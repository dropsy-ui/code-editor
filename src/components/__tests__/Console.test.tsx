import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeEditorStoreContext, type CodeEditorStore } from "../../context/CodeEditorStore";
import Console from "../Console";

const baseStore: CodeEditorStore = {
  htmlCode: "",
  cssCode: "",
  jsCode: "",
  setHtmlCode: () => undefined,
  setCssCode: () => undefined,
  setJsCode: () => undefined,
  logs: [],
  addLog: () => undefined,
  clearLogs: () => undefined,
  theme: "dark",
  toggleTheme: () => undefined,
};

describe("Console", () => {
  it("renders logs with level-specific output", () => {
    render(
      <CodeEditorStoreContext.Provider
        value={{
          ...baseStore,
          logs: [
            { level: "log", message: "hello" },
            { level: "error", message: "broken" },
          ],
        }}
      >
        <Console />
      </CodeEditorStoreContext.Provider>
    );

    expect(screen.getByText("> hello")).toHaveClass("console-log--log");
    expect(screen.getByText("> Error: broken")).toHaveClass("console-log--error");
  });

  it("renders header even when there are no logs", () => {
    render(
      <CodeEditorStoreContext.Provider value={baseStore}>
        <Console />
      </CodeEditorStoreContext.Provider>
    );

    expect(screen.getByText("Console")).toBeInTheDocument();
    expect(screen.getByText("No console output yet.")).toBeInTheDocument();
  });

  it("exposes console output as a polite live region", () => {
    render(
      <CodeEditorStoreContext.Provider
        value={{
          ...baseStore,
          logs: [{ level: "log", message: "hello" }],
        }}
      >
        <Console />
      </CodeEditorStoreContext.Provider>
    );

    expect(screen.getByRole("log", { name: "Console output" })).toHaveAttribute("aria-live", "polite");
  });
});
