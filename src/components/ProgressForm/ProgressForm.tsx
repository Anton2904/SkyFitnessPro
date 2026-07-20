import { useState, type FormEvent } from "react";

import type { Workout } from "../../types";

type ProgressFormProps = {
  workout: Workout;
  initial: number[];
  onSave: (values: number[]) => Promise<void>;
};

export function ProgressForm({
  workout,
  initial,
  onSave,
}: ProgressFormProps) {
  const exercises = workout.exercises ?? [];

  const [values, setValues] = useState<number[]>(
    exercises.map((_, index) => initial[index] ?? 0),
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (index: number, inputValue: string) => {
    const parsedValue = Number(inputValue);

    setValues((currentValues) =>
      currentValues.map((value, currentIndex) =>
        currentIndex === index
          ? Number.isNaN(parsedValue)
            ? 0
            : parsedValue
          : value,
      ),
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSaving(true);

    try {
      await onSave(values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="progressForm"
      onSubmit={handleSubmit}
    >
      <h2 className="progressFormTitle">
        Мой прогресс
      </h2>

      <div className="progressFormFields">
        {exercises.map((exercise, index) => (
          <label
            key={exercise._id}
            className="progressFormField"
          >
            <span className="progressFormLabel">
              Сколько раз вы сделали «{exercise.name}»?
            </span>

            <input
              type="number"
              min={0}
              max={exercise.quantity}
              value={values[index] ?? 0}
              onChange={(event) =>
                handleChange(index, event.target.value)
              }
            />
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="progressFormButton"
        disabled={saving}
      >
        {saving ? "Сохраняем..." : "Сохранить"}
      </button>
    </form>
  );
}