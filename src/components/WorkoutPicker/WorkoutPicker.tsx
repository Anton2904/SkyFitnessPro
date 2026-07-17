import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Workout, WorkoutProgress } from "../../types";

type WorkoutPickerProps = {
  courseId: string;
  workouts: Workout[];
  progress: WorkoutProgress[];
  onClose: () => void;
};

function getWorkoutText(name: string) {
  const parts = name
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    title: parts[0] ?? name,

    // Автор обычно находится в последней части, поэтому его не показываем
    description:
      parts.length > 2
        ? parts.slice(1, -1).join(" / ")
        : parts.slice(1).join(" / "),
  };
}

export function WorkoutPicker({
  courseId,
  workouts,
  progress,
  onClose,
}: WorkoutPickerProps) {
  const navigate = useNavigate();

  const [selectedWorkoutId, setSelectedWorkoutId] =
    useState<string>("");

  const handleStart = () => {
    if (!selectedWorkoutId) {
      return;
    }

    onClose();
    navigate(`/workout/${courseId}/${selectedWorkoutId}`);
  };

  return (
    <div className="workoutPicker">
      <h2 className="workoutPickerTitle">
        Выберите тренировку
      </h2>

      <div className="workoutPickerList">
        {workouts.map((workout) => {
          const workoutText = getWorkoutText(workout.name);

          const isCompleted =
            progress.find(
              (item) => item.workoutId === workout._id,
            )?.workoutCompleted ?? false;

          const isSelected =
            selectedWorkoutId === workout._id;

          return (
            <button
              key={workout._id}
              type="button"
              className="workoutPickerItem"
              onClick={() =>
                setSelectedWorkoutId(workout._id)
              }
            >
              <span
                className={[
                  "workoutPickerRadio",
                  isCompleted || isSelected
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
                    {workoutText.description}
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