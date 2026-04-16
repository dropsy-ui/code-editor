import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    expect(document.querySelector("#compact-code-drawer")).toBeNull();
  });

  it("renders compact layout when compact mode is explicitly requested", () => {
    setSearch("");
    render(<App layoutModeOverride="compact" />);

    expect(screen.getByRole("button", { name: "Show code" })).toBeInTheDocument();
    expect(document.querySelector("#compact-code-drawer")).toBeNull();
  });

  it("shows drag overlay while splitter is dragging", () => {
    setSearch("");
    const { container } = render(<App />);

    expect(container.querySelector(".app-drag-overlay")).toBeNull();
    fireEvent.mouseDown(container.querySelector(".splitter")!);
    expect(container.querySelector(".app-drag-overlay")).toBeInTheDocument();
    fireEvent.mouseUp(window);
    expect(container.querySelector(".app-drag-overlay")).toBeNull();
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

  it("appends newWindowParams when opening a layout in a new window", () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    setSearch("");
    render(<App newWindowParams={{ theme: "light", source: "demo" }} />);

    fireEvent.click(screen.getByRole("button", { name: "Open compact layout in new window" }));

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("layout=compact"),
      "_blank",
      "noopener,noreferrer"
    );
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("theme=light"),
      "_blank",
      "noopener,noreferrer"
    );
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("source=demo"),
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

  it("honors layoutModeOverride over URL query mode", () => {
    setSearch("?layout=compact");
    render(<App layoutModeOverride="full" />);

    expect(screen.getByText("HTML")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show code" })).toBeNull();
  });

  it("accepts initial code props and renders seeded content", async () => {
    setSearch("");
    render(
      <App
        initialHtmlCode="<h1>Seeded HTML</h1>"
        initialCssCode="body { color: hotpink; }"
        initialJsCode="console.log('seeded')"
      />
    );

    expect(screen.getByDisplayValue("<h1>Seeded HTML</h1>")).toBeInTheDocument();
    expect(screen.getByDisplayValue("body { color: hotpink; }")).toBeInTheDocument();
    expect(screen.getByDisplayValue("console.log('seeded')")).toBeInTheDocument();
  });

  it("accepts a whole initialState object and renders seeded content", () => {
    setSearch("");
    render(
      <App
        initialState={{
          html: "<h1>State HTML</h1>",
          css: "body { color: teal; }",
          javascript: "console.log('state')",
        }}
      />
    );

    expect(screen.getByDisplayValue("<h1>State HTML</h1>")).toBeInTheDocument();
    expect(screen.getByDisplayValue("body { color: teal; }")).toBeInTheDocument();
    expect(screen.getByDisplayValue("console.log('state')")).toBeInTheDocument();
  });

  it("defaults to dark theme when no defaultTheme is given and system prefers dark", () => {
    setSearch("");
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("dark"), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<App />);
    expect(document.querySelector('[data-theme="dark"]')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("defaults to light theme when no defaultTheme is given and system prefers light", () => {
    setSearch("");
    vi.stubGlobal("matchMedia", (_query: string) => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<App />);
    expect(document.querySelector('[data-theme="light"]')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("respects defaultTheme='dark' regardless of system preference", () => {
    setSearch("");
    vi.stubGlobal("matchMedia", (_query: string) => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<App defaultTheme="dark" />);
    expect(document.querySelector('[data-theme="dark"]')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("respects defaultTheme='light' regardless of system preference", () => {
    setSearch("");
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("dark"), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<App defaultTheme="light" />);
    expect(document.querySelector('[data-theme="light"]')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("toggles theme when the theme toggle button is clicked", async () => {
    const user = userEvent.setup();
    setSearch("");
    render(<App defaultTheme="dark" />);
    expect(document.querySelector('[data-theme="dark"]')).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Switch to light theme" }));
    expect(document.querySelector('[data-theme="light"]')).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(document.querySelector('[data-theme="dark"]')).toBeInTheDocument();
  });
});
