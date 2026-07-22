import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProgressForm } from "./ProgressForm";

const workout = {
  _id: "w1",
  name: "Тренировка",
  video: "",
  exercises: [{ _id: "e1", name: "Приседания", quantity: 10 }],
};

describe("ProgressForm", () => {
  it("показывает ранее сохраненное значение", () => {
    render(<ProgressForm workout={workout} initial={[4]} onSave={vi.fn()} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(4);
  });

  it("передает новое значение при сохранении", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<ProgressForm workout={workout} initial={[0]} onSave={onSave} />);
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "10");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(onSave).toHaveBeenCalledWith([10]);
  });
});
