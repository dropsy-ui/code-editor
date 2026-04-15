import { createRoot } from "react-dom/client";
import App from "./App";
import type { SandboxState } from "./utils/sandboxState";
import './App.scss'; // Ensure global styles are included

type CodeEditorOptions = {
  scripts?: string[];
  styles?: string[];
  initialState?: Partial<SandboxState>;
  initialHtmlCode?: string;
  initialCssCode?: string;
  initialJsCode?: string;
} & Record<string, unknown>;

type CodeEditorInit = (
  selector: string | Element,
  options?: CodeEditorOptions
) => void;

const globalWindow = window as Window & { CodeEditor?: CodeEditorInit };

globalWindow.CodeEditor = function (
  selector: string | Element,
  options: CodeEditorOptions = {}
) {
  const el =
    typeof selector === "string"
      ? document.querySelector(selector)
      : selector;
  if (!el) throw new Error("Container element not found");
  createRoot(el).render(
    <App
      {...options}
      iframeScripts={options.scripts || []}
      iframeStyles={options.styles || []}
    />
  );
};
