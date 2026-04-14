import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditorHeader } from "../EditorHeader";

describe("EditorHeader", () => {
  it("renders title and clear action", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(<EditorHeader title="HTML" onClear={onClear} />);

    expect(screen.getByText("HTML")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("renders collapse button and calls handler", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    const { rerender } = render(
      <EditorHeader title="CSS" onClear={() => undefined} onToggle={onToggle} isCollapsed={false} />
    );

    await user.click(screen.getByRole("button", { name: "Collapse" }));
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(
      <EditorHeader title="CSS" onClear={() => undefined} onToggle={onToggle} isCollapsed />
    );
    expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument();
  });

  it("does not render collapse button when onCollapse is omitted", () => {
    render(<EditorHeader title="JS" onClear={() => undefined} />);

    expect(screen.queryByRole("button", { name: /collapse|expand/i })).toBeNull();
  });
});
