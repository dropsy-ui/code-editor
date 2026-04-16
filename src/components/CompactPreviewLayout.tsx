import Editor from "@monaco-editor/react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useCodeEditorStore } from "../context/CodeEditorStore";
import LivePreview from "./LivePreview";
import { sharedMonacoEditorOptions } from "./monacoOptions";
import { loadSandboxStateFromFile, saveSandboxStateToFile } from "../utils/sandboxState";
import "./CompactPreviewLayout.scss";

type CompactEditorTab = "html" | "css" | "javascript";

interface CompactPreviewLayoutProps {
  isCodeVisible: boolean;
  canShowCode: boolean;
  activeTab: CompactEditorTab;
  onToggleCode: () => void;
  onTabChange: (tab: CompactEditorTab) => void;
  layoutMode: "full" | "compact";
  onOpenLayoutInNewWindow: (mode: "full" | "compact") => void;
  iframeScripts?: string[];
  iframeStyles?: string[];
  showModeToggle?: boolean;
  showThemeToggle?: boolean;
  showSaveButton?: boolean;
  showUploadButton?: boolean;
  showHtmlEditor?: boolean;
  showJavaScriptEditor?: boolean;
  showCssEditor?: boolean;
}

const COMPACT_EDITOR_LINE_HEIGHT = 20;

const editorOptions = {
  ...sharedMonacoEditorOptions,
  lineHeight: COMPACT_EDITOR_LINE_HEIGHT,
};

const DEFAULT_DRAWER_HEIGHT = 44;
const MIN_DRAWER_HEIGHT = 44;
const DRAWER_VERTICAL_PADDING = 12;

const clampDrawerHeight = (height: number) => {
  return Math.max(MIN_DRAWER_HEIGHT, Math.round(height));
};

const getLineCount = (value: string) => {
  if (!value) {
    return 1;
  }

  return value.split(/\r?\n/).length;
};

const getDrawerHeightFromCode = (value: string) => {
  const lineCount = getLineCount(value);
  return clampDrawerHeight(lineCount * COMPACT_EDITOR_LINE_HEIGHT + DRAWER_VERTICAL_PADDING);
};

const CompactPreviewLayout = ({
  isCodeVisible,
  canShowCode,
  activeTab,
  onToggleCode,
  onTabChange,
  layoutMode,
  onOpenLayoutInNewWindow,
  iframeScripts = [],
  iframeStyles = [],
  showModeToggle = true,
  showThemeToggle = true,
  showSaveButton = true,
  showUploadButton = true,
  showHtmlEditor = true,
  showJavaScriptEditor = true,
  showCssEditor = true,
}: CompactPreviewLayoutProps) => {
  const {
    htmlCode,
    jsCode,
    cssCode,
    setHtmlCode,
    setJsCode,
    setCssCode,
    theme,
  } = useCodeEditorStore();
  const monacoTheme = theme === "light" ? "vs" : "vs-dark";
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const tabButtonRefs = useRef<Partial<Record<CompactEditorTab, HTMLButtonElement | null>>>({});
  const [drawerHeight, setDrawerHeight] = useState(DEFAULT_DRAWER_HEIGHT);
  const tabListId = useId();

  const visibleTabs: CompactEditorTab[] = [
    ...(showHtmlEditor ? ["html" as const] : []),
    ...(showJavaScriptEditor ? ["javascript" as const] : []),
    ...(showCssEditor ? ["css" as const] : []),
  ];
  const resolvedActiveTab = visibleTabs.includes(activeTab) ? activeTab : (visibleTabs[0] ?? "html");
  const currentValue = resolvedActiveTab === "html" ? htmlCode : resolvedActiveTab === "css" ? cssCode : jsCode;
  const currentLanguage = resolvedActiveTab === "html" ? "html" : resolvedActiveTab === "css" ? "css" : "javascript";
  const currentTabLabel = resolvedActiveTab === "html" ? "HTML" : resolvedActiveTab === "css" ? "CSS" : "JavaScript";
  const drawerPanelId = `${tabListId}-panel`;

  useEffect(() => {
    if (!isCodeVisible) {
      return;
    }

    const nextHeight = getDrawerHeightFromCode(currentValue);
    setDrawerHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
  }, [activeTab, currentValue, isCodeVisible]);

  const relayoutEditor = () => {
    if (!editorRef.current || !editorContainerRef.current) {
      return;
    }

    const width = editorContainerRef.current.clientWidth;
    const height = editorContainerRef.current.clientHeight;

    if (width > 0 && height > 0) {
      editorRef.current.layout({ width, height });
      return;
    }

    editorRef.current.layout();
  };

  useLayoutEffect(() => {
    if (!isCodeVisible) {
      return;
    }

    let secondFrame: number | null = null;
    const firstFrame = requestAnimationFrame(() => {
      relayoutEditor();
      secondFrame = requestAnimationFrame(() => {
        relayoutEditor();
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);

      if (secondFrame !== null) {
        cancelAnimationFrame(secondFrame);
      }
    };
  }, [activeTab, drawerHeight, isCodeVisible]);

  const handleChange = (value: string | undefined) => {
    const nextValue = value || "";
    const setCodeByTab = {
      html: setHtmlCode,
      css: setCssCode,
      javascript: setJsCode,
    };
    setCodeByTab[resolvedActiveTab](nextValue);
  };

  const focusTab = (tab: CompactEditorTab) => {
    requestAnimationFrame(() => {
      tabButtonRefs.current[tab]?.focus();
    });
  };

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, tab: CompactEditorTab) => {
    const currentIndex = visibleTabs.indexOf(tab);

    if (currentIndex === -1) {
      return;
    }

    let nextTab: CompactEditorTab | undefined;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextTab = visibleTabs[(currentIndex + 1) % visibleTabs.length];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextTab = visibleTabs[(currentIndex - 1 + visibleTabs.length) % visibleTabs.length];
        break;
      case "Home":
        nextTab = visibleTabs[0];
        break;
      case "End":
        nextTab = visibleTabs[visibleTabs.length - 1];
        break;
      default:
        break;
    }

    if (!nextTab) {
      return;
    }

    event.preventDefault();
    onTabChange(nextTab);
    focusTab(nextTab);
  };

  return (
    <div className={`compact-layout${isCodeVisible ? " compact-layout--docked" : ""}`}>
      <div className="compact-preview-shell">
        <LivePreview
          htmlCode={htmlCode}
          jsCode={jsCode}
          cssCode={cssCode}
          iframeScripts={iframeScripts}
          iframeStyles={iframeStyles}
          layoutMode={layoutMode}
          onOpenLayoutInNewWindow={onOpenLayoutInNewWindow}
          showModeToggle={showModeToggle}
          showThemeToggle={showThemeToggle}
          showSaveButton={showSaveButton}
          showUploadButton={showUploadButton}
          fitContent
          onUpload={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            loadSandboxStateFromFile(file, { setHtmlCode, setCssCode, setJsCode });
          }}
          onSave={() => {
            saveSandboxStateToFile({
              html: htmlCode,
              javascript: jsCode,
              css: cssCode,
            });
          }}
        />
        {canShowCode && (
          <button
            type="button"
            className="app-btn app-btn--text compact-preview-toggle"
            onClick={onToggleCode}
            aria-expanded={isCodeVisible}
            aria-controls="compact-code-drawer"
          >
            {isCodeVisible ? "Hide code" : "Show code"}
          </button>
        )}
      </div>

      {canShowCode && isCodeVisible && (
        <div
          className="compact-code-drawer"
          id="compact-code-drawer"
        >
          <div className="compact-code-drawer-header">
            <span className="compact-code-drawer-title">Code</span>
            <div className="compact-code-drawer-tabs" role="tablist" aria-label="Compact editor tabs">
              {showHtmlEditor && (
                <button
                  type="button"
                  id={`${tabListId}-html-tab`}
                  ref={(node) => {
                    tabButtonRefs.current.html = node;
                  }}
                  className={`app-btn app-btn--text compact-code-tab${resolvedActiveTab === "html" ? " is-active" : ""}`}
                  onClick={() => onTabChange("html")}
                  onKeyDown={(event) => handleTabKeyDown(event, "html")}
                  role="tab"
                  aria-selected={resolvedActiveTab === "html"}
                  aria-controls={drawerPanelId}
                  tabIndex={resolvedActiveTab === "html" ? 0 : -1}
                >
                  HTML
                </button>
              )}
              {showJavaScriptEditor && (
                <button
                  type="button"
                  id={`${tabListId}-javascript-tab`}
                  ref={(node) => {
                    tabButtonRefs.current.javascript = node;
                  }}
                  className={`app-btn app-btn--text compact-code-tab${resolvedActiveTab === "javascript" ? " is-active" : ""}`}
                  onClick={() => onTabChange("javascript")}
                  onKeyDown={(event) => handleTabKeyDown(event, "javascript")}
                  role="tab"
                  aria-selected={resolvedActiveTab === "javascript"}
                  aria-controls={drawerPanelId}
                  tabIndex={resolvedActiveTab === "javascript" ? 0 : -1}
                >
                  JavaScript
                </button>
              )}
              {showCssEditor && (
                <button
                  type="button"
                  id={`${tabListId}-css-tab`}
                  ref={(node) => {
                    tabButtonRefs.current.css = node;
                  }}
                  className={`app-btn app-btn--text compact-code-tab${resolvedActiveTab === "css" ? " is-active" : ""}`}
                  onClick={() => onTabChange("css")}
                  onKeyDown={(event) => handleTabKeyDown(event, "css")}
                  role="tab"
                  aria-selected={resolvedActiveTab === "css"}
                  aria-controls={drawerPanelId}
                  tabIndex={resolvedActiveTab === "css" ? 0 : -1}
                >
                  CSS
                </button>
              )}
            </div>
          </div>
          <div
            ref={editorContainerRef}
            className="compact-code-drawer-editor"
            id={drawerPanelId}
            role="tabpanel"
            aria-labelledby={`${tabListId}-${resolvedActiveTab}-tab`}
            style={{ height: `${drawerHeight}px` }}
          >
            <Editor
              height={`${drawerHeight}px`}
              defaultLanguage={currentLanguage}
              language={currentLanguage}
              loading={null}
              value={currentValue}
              onChange={handleChange}
              theme={monacoTheme}
              options={{
                ...editorOptions,
                ariaLabel: `${currentTabLabel} code editor`,
              }}
              onMount={(editor) => {
                editorRef.current = editor;
                requestAnimationFrame(() => {
                  relayoutEditor();
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactPreviewLayout;