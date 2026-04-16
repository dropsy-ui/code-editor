import { createRoot } from "react-dom/client";
import App from "./App";
import type { CodeEditorMessages } from "./context/CodeEditorMessages";
import type { SandboxState } from "./utils/sandboxState";
import './App.scss'; // Ensure global styles are included

type DisplayMode = "compact" | "full";

export type AppTheme = "light" | "dark" | "system";
export type { CodeEditorMessages } from "./context/CodeEditorMessages";

export type CodeEditorOptions = {
  /** External script URLs to inject into the preview iframe. */
  scripts?: string[];
  /** External stylesheet URLs to inject into the preview iframe. */
  styles?: string[];
  /** Chooses the initial editor layout. */
  displayMode?: DisplayMode;
  /** Seeds the editor with an initial HTML, CSS, and JavaScript state object. */
  initialState?: Partial<SandboxState>;
  /** Sets the initial HTML source for the editor. */
  initialHtmlCode?: string;
  /** Sets the initial CSS source for the editor. */
  initialCssCode?: string;
  /** Sets the initial JavaScript source for the editor. */
  initialJsCode?: string;
  /** Controls the editor colour scheme. Omit or pass "system" to follow the browser colour-scheme preference. */
  defaultTheme?: AppTheme;
  /** Shows or hides the Full and Compact layout buttons in the preview header. */
  showModeToggle?: boolean;
  /** Shows or hides the light and dark theme toggle in the preview header. */
  showThemeToggle?: boolean;
  /** Shows or hides the save button in the preview header. */
  showSaveButton?: boolean;
  /** Shows or hides the upload button in the preview header. */
  showUploadButton?: boolean;
  /** Shows or hides all code editing UI while keeping the live preview available. */
  showCode?: boolean;
  /** Shows or hides the HTML editor. */
  showHtmlEditor?: boolean;
  /** Shows or hides the JavaScript editor. */
  showJavaScriptEditor?: boolean;
  /** Shows or hides the CSS editor. */
  showCssEditor?: boolean;
  /** Overrides visible UI copy and aria labels, allowing translated or customized text per editor instance. */
  messages?: CodeEditorMessages;
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
      layoutModeOverride={options.displayMode}
      iframeScripts={options.scripts || []}
      iframeStyles={options.styles || []}
      defaultTheme={options.defaultTheme}
    />
  );
};
