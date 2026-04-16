import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";
import { CodeEditorStoreProvider } from "../context/CodeStoreContext";
import {
  CodeEditorStoreContext,
  type CodeEditorStore,
} from "../context/CodeEditorStore";

export const baseCodeEditorStore: CodeEditorStore = {
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

export function renderWithCodeStore(
  ui: ReactElement,
  overrides: Partial<CodeEditorStore> = {}
) {
  return render(
    <CodeEditorStoreContext.Provider value={{ ...baseCodeEditorStore, ...overrides }}>
      {ui}
    </CodeEditorStoreContext.Provider>
  );
}

export function renderWithStoreProvider(ui: ReactElement) {
  const rendered = render(<CodeEditorStoreProvider>{ui}</CodeEditorStoreProvider>);

  return {
    ...rendered,
    rerenderWithStoreProvider: (nextUi: ReactElement) => {
      rendered.rerender(<CodeEditorStoreProvider>{nextUi}</CodeEditorStoreProvider>);
    },
  };
}

export function createConsoleErrorSpy() {
  return vi.spyOn(console, "error").mockImplementation(() => undefined);
}
