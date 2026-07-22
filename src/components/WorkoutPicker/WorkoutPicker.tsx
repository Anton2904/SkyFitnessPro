import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Workout, WorkoutProgress } from "../../types";
import { findWorkoutProgress, isWorkoutCompleted } from "../../utils/progress";

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
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");

  const handleStart = () => {
    if (!selectedWorkoutId) return;
    onClose();
    navigate(`/workout/${courseId}/${selectedWorkoutId}`);
  };

  return (
    <div className="workoutPicker">
      <h2 className="workoutPickerTitle">Выберите тренировку</h2>

      <div className="workoutPickerList">
        {workouts.map((workout) => {
          const workoutText = getWorkoutText(workout.name);
          const currentWorkoutId = String(workout._id);
          const workoutProgress = findWorkoutProgress(progress, currentWorkoutId);
          const completed = isWorkoutCompleted(workout, workoutProgress);
          const selected = selectedWorkoutId === currentWorkoutId;

          return (
            <button
              key={workout._id}
              type="button"
              className="workoutPickerItem"
              onClick={() => setSelectedWorkoutId(currentWorkoutId)}
            >
              <span
                aria-label={completed ? "Тренировка пройдена" : "Тренировка не пройдена"}
                className={[
                  "workoutPickerRadio",
                  completed ? "completed" : "",
                  !completed && selected ? "selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />

              <span className="workoutPickerText">
                <span className="workoutPickerName">{workoutText.title}</span>
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
