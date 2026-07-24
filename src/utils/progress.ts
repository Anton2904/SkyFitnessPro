import type { CourseProgress, Workout, WorkoutProgress } from "../types";

type UnknownRecord = Record<string, unknown>;

export function getProgressWorkoutId(item: WorkoutProgress): string {
  const data = item as unknown as UnknownRecord;
  const directWorkoutId = data.workoutId;

  if (typeof directWorkoutId === "string" || typeof directWorkoutId === "number") {
    return String(directWorkoutId);
  }

  if (directWorkoutId && typeof directWorkoutId === "object") {
    const workoutObject = directWorkoutId as UnknownRecord;
    if (typeof workoutObject._id === "string" || typeof workoutObject._id === "number") {
      return String(workoutObject._id);
    }
    if (typeof workoutObject.id === "string" || typeof workoutObject.id === "number") {
      return String(workoutObject.id);
    }
  }

  const nestedWorkout = data.workout;
  if (nestedWorkout && typeof nestedWorkout === "object") {
    const workoutObject = nestedWorkout as UnknownRecord;
    if (typeof workoutObject._id === "string" || typeof workoutObject._id === "number") {
      return String(workoutObject._id);
    }
    if (typeof workoutObject.id === "string" || typeof workoutObject.id === "number") {
      return String(workoutObject.id);
    }
  }

  return "";
}

export function findWorkoutProgress(
  progress: WorkoutProgress[],
  workoutId: string,
): WorkoutProgress | undefined {
  return progress.find((item) => getProgressWorkoutId(item) === String(workoutId));
}

export function isWorkoutCompleted(
  workout: Workout,
  progress?: WorkoutProgress,
): boolean {
  const exercises = workout.exercises ?? [];
  const values = progress?.progressData ?? [];

  if (exercises.length === 0) {
    return Boolean(progress?.workoutCompleted);
  }

  return exercises.every((exercise, index) => {
    const required = Math.max(0, Number(exercise.quantity) || 0);
    const completed = Math.max(0, Number(values[index]) || 0);
    return required === 0 || completed >= required;
  });
}

export function calculateCourseProgress(
  workouts: Workout[],
  courseProgress?: CourseProgress,
): number {
  if (workouts.length === 0) {
    return 0;
  }

  const progressItems = courseProgress?.workoutsProgress ?? [];
  let totalExerciseShare = 0;
  let exerciseCount = 0;

  workouts.forEach((workout) => {
    const exercises = workout.exercises ?? [];
    const workoutProgress = findWorkoutProgress(progressItems, workout._id);

    if (exercises.length === 0) {
      exerciseCount += 1;
      totalExerciseShare += workoutProgress?.workoutCompleted ? 1 : 0;
      return;
    }

    exercises.forEach((exercise, index) => {
      const required = Math.max(0, Number(exercise.quantity) || 0);
      const completed = Math.max(
        0,
        Number(workoutProgress?.progressData?.[index]) || 0,
      );

      exerciseCount += 1;
      totalExerciseShare += required === 0 ? 1 : Math.min(completed / required, 1);
    });
  });

  return exerciseCount === 0
    ? 0
    : Math.round((totalExerciseShare / exerciseCount) * 100);
}
