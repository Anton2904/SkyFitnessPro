import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { WorkoutPicker } from "./WorkoutPicker";

const workout = {
  _id: "w1",
  name: "Тренировка 1 / Основы",
  video: "",
  exercises: [{ _id: "e1", name: "Приседания", quantity: 10 }],
};

describe("WorkoutPicker", () => {
  it("не показывает галочку при частичном прогрессе", () => {
    render(
      <MemoryRouter>
        <WorkoutPicker
          courseId="c1"
          workouts={[workout]}
          progress={[{ workoutId: "w1", workoutCompleted: true, progressData: [5] }]}
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Тренировка не пройдена")).toBeInTheDocument();
  });

  it("показывает галочку при полном прогрессе", () => {
    render(
      <MemoryRouter>
        <WorkoutPicker
          courseId="c1"
          workouts={[workout]}
          progress={[{ workoutId: "w1", workoutCompleted: false, progressData: [10] }]}
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Тренировка пройдена")).toBeInTheDocument();
  });
});
