import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function setSearch(search: string) {
  window.history.pushState({}, "", `/${search}`);
}

describe("App layout mode", () => {
  afterEach(() => {
    setSearch("");
  });

  it("defaults to full layout when query param is absent", () => {
    setSearch("");
    render(<App />);

    expect(screen.getByText("HTML")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("CSS")).toBeInTheDocument();
  });

  it("renders compact layout when layout=compact", () => {
    setSearch("?layout=compact");
    render(<App />);

    expect(screen.getByRole("button", { name: "Show code" })).toBeInTheDocument();
  });

  it("shows drag overlay while splitter is dragging", () => {
    setSearch("");
    render(<App />);

    expect(screen.queryByRole("presentation")).toBeNull();
    fireEvent.mouseDown(document.querySelector(".splitter")!);
    expect(document.querySelector(".app-drag-overlay")).toBeInTheDocument();
    fireEvent.mouseUp(window);
    expect(document.querySelector(".app-drag-overlay")).not.toBeInTheDocument();
  });

  it("opens layout in new window via layout buttons", () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    setSearch("");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Open compact layout in new window" }));
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("layout=compact"),
      "_blank",
      "noopener,noreferrer"
    );

    fireEvent.click(screen.getByRole("button", { name: "Open full layout in new window" }));
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("layout=full"),
      "_blank",
      "noopener,noreferrer"
    );

    openSpy.mockRestore();
  });

  it("toggles compact code visibility in compact mode", async () => {
    const user = userEvent.setup();
    setSearch("?layout=compact");
    render(<App />);

    expect(document.querySelector("#compact-code-drawer")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Show code" }));
    expect(document.querySelector("#compact-code-drawer")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide code" }));
    expect(document.querySelector("#compact-code-drawer")).toBeNull();
  });

  it("switches compact editor tab between html and javascript", async () => {
    const user = userEvent.setup();
    setSearch("?layout=compact");
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Show code" }));
    const jsTab = screen.getByRole("tab", { name: "JavaScript" });
    await user.click(jsTab);
    expect(jsTab).toHaveAttribute("aria-selected", "true");
  });
});
