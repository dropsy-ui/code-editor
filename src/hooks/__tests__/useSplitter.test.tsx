import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSplitter } from "../useSplitter";

function Harness() {
  const { editorColWidth, isDragging, containerRef, onSplitterMouseDown } = useSplitter(50);

  return (
    <div>
      <div
        ref={containerRef}
        data-testid="container"
        style={{ width: "1000px", height: "200px" }}
      />
      <button onMouseDown={onSplitterMouseDown}>drag</button>
      <div data-testid="width">{editorColWidth}</div>
      <div data-testid="dragging">{String(isDragging)}</div>
    </div>
  );
}

describe("useSplitter", () => {
  it("starts and stops dragging and clamps width", async () => {
    render(<Harness />);

    const container = screen.getByTestId("container");
    container.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      width: 1000,
      height: 200,
      top: 0,
      right: 1000,
      bottom: 200,
      left: 0,
      toJSON: () => ({}),
    });

    expect(screen.getByTestId("width")).toHaveTextContent("50");
    expect(screen.getByTestId("dragging")).toHaveTextContent("false");

    fireEvent.mouseDown(screen.getByRole("button", { name: "drag" }));
    expect(screen.getByTestId("dragging")).toHaveTextContent("true");

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 50 }));
    });
    expect(Number(screen.getByTestId("width").textContent)).toBeCloseTo(30, 0);

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 980 }));
    });
    expect(Number(screen.getByTestId("width").textContent)).toBeCloseTo(70, 0);

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });
    expect(screen.getByTestId("dragging")).toHaveTextContent("false");
  });
});

function HarnessWithoutContainer() {
  const { editorColWidth, onSplitterMouseDown } = useSplitter(50);

  return (
    <div>
      <button onMouseDown={onSplitterMouseDown}>drag-no-container</button>
      <div data-testid="width-no-container">{editorColWidth}</div>
    </div>
  );
}

describe("useSplitter early returns", () => {
  it("ignores mousemove when not dragging", () => {
    render(<Harness />);

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 900 }));
    });

    expect(screen.getByTestId("width")).toHaveTextContent("50");
  });

  it("ignores mousemove when container ref is null", () => {
    render(<HarnessWithoutContainer />);

    fireEvent.mouseDown(screen.getByRole("button", { name: "drag-no-container" }));
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 100 }));
    });

    expect(screen.getByTestId("width-no-container")).toHaveTextContent("50");

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });
  });
});
