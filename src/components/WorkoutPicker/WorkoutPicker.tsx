import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Workout, WorkoutProgress } from "../../types";

type WorkoutPickerProps = {
  courseId: string;
  workouts: Workout[];
  progress: WorkoutProgress[];
  onClose: () => void;
};

type UnknownRecord = Record<string, unknown>;

function getWorkoutText(name: string) {
  const parts = name
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    title: parts[0] ?? name,
    description:
      parts.length > 2
        ? parts.slice(1, -1).join(" / ")
        : parts.slice(1).join(" / "),
  };
}

/**
 * Приводит разные варианты ID от API к одной строке.
 *
 * Поддерживает:
 * workoutId: "123"
 * workoutId: { _id: "123" }
 * workout: { _id: "123" }
 * _id: "123"
 */
function getProgressWorkoutId(item: WorkoutProgress): string {
  const data = item as unknown as UnknownRecord;

  const directWorkoutId = data.workoutId;

  if (
    typeof directWorkoutId === "string" ||
    typeof directWorkoutId === "number"
  ) {
    return String(directWorkoutId);
  }

  if (
    directWorkoutId &&
    typeof directWorkoutId === "object"
  ) {
    const workoutObject =
      directWorkoutId as UnknownRecord;

    if (
      typeof workoutObject._id === "string" ||
      typeof workoutObject._id === "number"
    ) {
      return String(workoutObject._id);
    }

    if (
      typeof workoutObject.id === "string" ||
      typeof workoutObject.id === "number"
    ) {
      return String(workoutObject.id);
    }
  }

  const nestedWorkout = data.workout;

  if (
    nestedWorkout &&
    typeof nestedWorkout === "object"
  ) {
    const workoutObject =
      nestedWorkout as UnknownRecord;

    if (
      typeof workoutObject._id === "string" ||
      typeof workoutObject._id === "number"
    ) {
      return String(workoutObject._id);
    }

    if (
      typeof workoutObject.id === "string" ||
      typeof workoutObject.id === "number"
    ) {
      return String(workoutObject.id);
    }
  }

  return "";
}

function getIsWorkoutCompleted(
  item: WorkoutProgress | undefined,
): boolean {
  if (!item) {
    return false;
  }

  const data = item as unknown as UnknownRecord;
  const completed = data.workoutCompleted;

  if (
    completed === true ||
    completed === 1 ||
    completed === "true"
  ) {
    return true;
  }

  const progressData = data.progressData;

  if (Array.isArray(progressData)) {
    return (
      progressData.length > 0 &&
      progressData.every(
        (value) =>
          typeof value === "number" &&
          value > 0,
      )
    );
  }

  return false;
}

export function WorkoutPicker({
  courseId,
  workouts,
  progress,
  onClose,
}: WorkoutPickerProps) {
  const navigate = useNavigate();

  const [selectedWorkoutId, setSelectedWorkoutId] =
    useState("");

  const handleStart = () => {
    if (!selectedWorkoutId) {
      return;
    }

    onClose();

    navigate(
      `/workout/${courseId}/${selectedWorkoutId}`,
    );
  };

  return (
    <div className="workoutPicker">
      <h2 className="workoutPickerTitle">
        Выберите тренировку
      </h2>

      <div className="workoutPickerList">
        {workouts.map((workout) => {
          const workoutText =
            getWorkoutText(workout.name);

          const currentWorkoutId =
            String(workout._id);

          const workoutProgress = progress.find(
            (item) =>
              getProgressWorkoutId(item) ===
              currentWorkoutId,
          );

          const isCompleted =
            getIsWorkoutCompleted(
              workoutProgress,
            );

          const isSelected =
            selectedWorkoutId ===
            currentWorkoutId;

          return (
            <button
              key={workout._id}
              type="button"
              className="workoutPickerItem"
              onClick={() =>
                setSelectedWorkoutId(
                  currentWorkoutId,
                )
              }
            >
              <span
                className={[
                  "workoutPickerRadio",
                  isCompleted
                    ? "completed"
                    : "",
                  !isCompleted && isSelected
                    ? "selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />

              <span className="workoutPickerText">
                <span className="workoutPickerName">
                  {workoutText.title}
                </span>

                {workoutText.description && (
                  <span className="workoutPickerDescription">
                    {
                      workoutText.description
                    }
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="workoutPickerStart"
        disabled={!selectedWorkoutId}
        onClick={handleStart}
      >
        Начать
      </button>
    </div>
  );
}