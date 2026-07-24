import { describe, expect, it } from "vitest";
import type { CourseProgress, Workout } from "../types";
import { calculateCourseProgress, isWorkoutCompleted } from "./progress";

const workouts: Workout[] = [
  {
    _id: "w1",
    name: "Тренировка 1",
    video: "",
    exercises: [{ _id: "e1", name: "Приседания", quantity: 10 }],
  },
  {
    _id: "w2",
    name: "Тренировка 2",
    video: "",
    exercises: [{ _id: "e2", name: "Наклоны", quantity: 20 }],
  },
];

describe("progress utils", () => {
  it("не считает частично выполненную тренировку пройденной", () => {
    expect(
      isWorkoutCompleted(workouts[0], {
        workoutId: "w1",
        workoutCompleted: true,
        progressData: [5],
      }),
    ).toBe(false);
  });

  it("считает тренировку пройденной только при выполнении нормы", () => {
    expect(
      isWorkoutCompleted(workouts[0], {
        workoutId: "w1",
        workoutCompleted: false,
        progressData: [10],
      }),
    ).toBe(true);
  });

  it("правильно считает прогресс всего курса", () => {
    const progress: CourseProgress = {
      courseId: "c1",
      courseCompleted: false,
      workoutsProgress: [
        { workoutId: "w1", workoutCompleted: true, progressData: [10] },
      ],
    };

    expect(calculateCourseProgress(workouts, progress)).toBe(50);
  });

  it("учитывает частичный прогресс упражнений", () => {
    const progress: CourseProgress = {
      courseId: "c1",
      courseCompleted: false,
      workoutsProgress: [
        { workoutId: "w1", workoutCompleted: false, progressData: [5] },
      ],
    };

    expect(calculateCourseProgress(workouts, progress)).toBe(25);
  });
});
