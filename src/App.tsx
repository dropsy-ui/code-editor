import { useEffect, useState } from "react";
import './App.scss';
import CompactPreviewLayout from "./components/CompactPreviewLayout";
import EditorsColumn from "./components/EditorsColumn";
import PreviewSection from "./components/PreviewSection";
import { CodeEditorStoreProvider } from "./context/CodeStoreContext";
import { useCodeEditorStore } from "./context/CodeEditorStore";
import { useSplitter } from "./hooks/useSplitter";
import type { SandboxState } from "./utils/sandboxState";
import "./splitter.scss";

import type { AppTheme } from './embed';

// Accept iframeScripts and iframeStyles as props for embedding
interface AppProps {
  iframeScripts?: string[];
  iframeStyles?: string[];
  layoutModeOverride?: LayoutMode;
  initialState?: Partial<SandboxState>;
  initialHtmlCode?: string;
  initialCssCode?: string;
  initialJsCode?: string;
  newWindowParams?: Record<string, string>;
  defaultTheme?: AppTheme;
  showModeToggle?: boolean;
  showThemeToggle?: boolean;
  showSaveButton?: boolean;
  showUploadButton?: boolean;
  showCode?: boolean;
  showHtmlEditor?: boolean;
  showJavaScriptEditor?: boolean;
  showCssEditor?: boolean;
}

type LayoutMode = "full" | "compact";
type CompactEditorTab = "html" | "css" | "javascript";

const getInitialLayoutMode = (): LayoutMode => {
  /* v8 ignore next 3 */
  if (typeof window === "undefined") {
    return "full";
  }

  const mode = new URLSearchParams(window.location.search).get("layout");
  return mode === "compact" ? "compact" : "full";
};

function AppInner({
  iframeScripts = [],
  iframeStyles = [],
  layoutModeOverride,
  newWindowParams,
  showModeToggle = true,
  showThemeToggle = true,
  showSaveButton = true,
  showUploadButton = true,
  showCode = true,
  showHtmlEditor = true,
  showJavaScriptEditor = true,
  showCssEditor = true,
}: AppProps) {
  const { theme } = useCodeEditorStore();
  const [expanded, setExpanded] = useState({ html: true, js: true, css: true });
  const [urlLayoutMode] = useState<LayoutMode>(getInitialLayoutMode);
  const [isCompactCodeVisible, setIsCompactCodeVisible] = useState(false);
  const [compactEditorTab, setCompactEditorTab] = useState<CompactEditorTab>("html");
  const {
    editorColWidth,
    isDragging,
    containerRef,
    onSplitterMouseDown,
    onSplitterKeyDown,
  } = useSplitter(50);

  const layoutMode = layoutModeOverride ?? urlLayoutMode;
  const isCompactMode = layoutMode === "compact";
  const visibleCompactTabs: CompactEditorTab[] = [
    ...(showHtmlEditor ? ["html" as const] : []),
    ...(showJavaScriptEditor ? ["javascript" as const] : []),
    ...(showCssEditor ? ["css" as const] : []),
  ];
  const hasVisibleEditors = showCode && visibleCompactTabs.length > 0;

  useEffect(() => {
    if (!hasVisibleEditors) {
      setIsCompactCodeVisible(false);
      return;
    }

    if (!visibleCompactTabs.includes(compactEditorTab)) {
      setCompactEditorTab(visibleCompactTabs[0]);
    }
  }, [compactEditorTab, hasVisibleEditors, visibleCompactTabs]);

  const openLayoutInNewWindow = (mode: LayoutMode) => {
    const url = new URL(window.location.href);
    url.searchParams.set("layout", mode);
    if (newWindowParams) {
      Object.entries(newWindowParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`app-body${isCompactMode ? " app-body--compact" : ""}`} data-theme={theme}>
      {isDragging && !isCompactMode && (
        <div className="app-drag-overlay" />
      )}
      <div
        className={`app-main${isCompactMode ? " app-main--compact" : ""}`}
        role="main"
        aria-label="Code editor playground"
      >
        <span id="splitter-instructions" className="app-visually-hidden">
          Use the left and right arrow keys to resize the editor and preview panels. Hold Shift for larger steps.
        </span>
        {isCompactMode ? (
          <div className="app-compact-main">
            <CompactPreviewLayout
              isCodeVisible={isCompactCodeVisible}
              canShowCode={hasVisibleEditors}
              activeTab={compactEditorTab}
              onToggleCode={() => setIsCompactCodeVisible((current) => !current)}
              onTabChange={setCompactEditorTab}
              layoutMode={layoutMode}
              onOpenLayoutInNewWindow={openLayoutInNewWindow}
              iframeScripts={iframeScripts}
              iframeStyles={iframeStyles}
              showModeToggle={showModeToggle}
              showThemeToggle={showThemeToggle}
              showSaveButton={showSaveButton}
              showUploadButton={showUploadButton}
              showHtmlEditor={showHtmlEditor}
              showJavaScriptEditor={showJavaScriptEditor}
              showCssEditor={showCssEditor}
            />
          </div>
        ) : (
          <div className="app-editors-row" ref={containerRef}>
            {hasVisibleEditors && (
              <>
                <div
                  className="app-editors-col"
                  role="region"
                  aria-label="Code editors"
                  style={{
                    width: `${editorColWidth}%`,
                  }}
                >
                  <EditorsColumn
                    expanded={expanded}
                    setExpanded={setExpanded}
                    visibleEditors={{
                      html: showHtmlEditor,
                      js: showJavaScriptEditor,
                      css: showCssEditor,
                    }}
                  />
                </div>
                <div
                  className="splitter"
                  onMouseDown={onSplitterMouseDown}
                  onKeyDown={onSplitterKeyDown}
                  role="separator"
                  aria-label="Resize editor and preview panels"
                  aria-orientation="vertical"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(editorColWidth)}
                  aria-describedby="splitter-instructions"
                  tabIndex={0}
                />
              </>
            )}
            <div
              className="preview-section"
              role="region"
              aria-label="Live preview and console"
              style={{ width: hasVisibleEditors ? `${100 - editorColWidth}%` : "100%" }}
            >
              <PreviewSection
                iframeScripts={iframeScripts}
                iframeStyles={iframeStyles}
                layoutMode={layoutMode}
                onOpenLayoutInNewWindow={openLayoutInNewWindow}
                showModeToggle={showModeToggle}
                showThemeToggle={showThemeToggle}
                showSaveButton={showSaveButton}
                showUploadButton={showUploadButton}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App(props: AppProps) {
  const {
    initialState,
    initialHtmlCode,
    initialCssCode,
    initialJsCode,
    defaultTheme,
  } = props;

  const resolvedInitialHtmlCode = initialHtmlCode ?? initialState?.html ?? "";
  const resolvedInitialCssCode = initialCssCode ?? initialState?.css ?? "";
  const resolvedInitialJsCode = initialJsCode ?? initialState?.javascript ?? "";

  return (
    <CodeEditorStoreProvider
      initialHtmlCode={resolvedInitialHtmlCode}
      initialCssCode={resolvedInitialCssCode}
      initialJsCode={resolvedInitialJsCode}
      defaultTheme={defaultTheme}
    >
      <AppInner {...props} />
    </CodeEditorStoreProvider>
  );
}

export default App;
