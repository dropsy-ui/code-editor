import Editor from "@monaco-editor/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useCodeEditorStore } from "../context/CodeEditorStore";
import LivePreview from "./LivePreview";
import { sharedMonacoEditorOptions } from "./monacoOptions";
import { loadSandboxStateFromFile, saveSandboxStateToFile } from "../utils/sandboxState";
import "./CompactPreviewLayout.scss";

type CompactEditorTab = "html" | "css" | "javascript";

interface CompactPreviewLayoutProps {
  isCodeVisible: boolean;
  activeTab: CompactEditorTab;
  onToggleCode: () => void;
  onTabChange: (tab: CompactEditorTab) => void;
  layoutMode: "full" | "compact";
  onOpenLayoutInNewWindow: (mode: "full" | "compact") => void;
  iframeScripts?: string[];
  iframeStyles?: string[];
}

const COMPACT_EDITOR_LINE_HEIGHT = 20;

const editorOptions = {
  ...sharedMonacoEditorOptions,
  lineHeight: COMPACT_EDITOR_LINE_HEIGHT,
};

const DEFAULT_PREVIEW_HEIGHT = 220;
const MIN_PREVIEW_HEIGHT = 140;
const MAX_PREVIEW_HEIGHT = 480;
const DEFAULT_DRAWER_HEIGHT = 112;
const MIN_DRAWER_HEIGHT = 112;
const DRAWER_VERTICAL_PADDING = 12;

const clampHeight = (height: number, minHeight: number, maxHeight: number) => {
  return Math.max(minHeight, Math.min(maxHeight, Math.round(height)));
};

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
  activeTab,
  onToggleCode,
  onTabChange,
  layoutMode,
  onOpenLayoutInNewWindow,
  iframeScripts = [],
  iframeStyles = [],
}: CompactPreviewLayoutProps) => {
  const {
    htmlCode,
    jsCode,
    cssCode,
    setHtmlCode,
    setJsCode,
    setCssCode,
  } = useCodeEditorStore();
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const [previewHeight, setPreviewHeight] = useState(DEFAULT_PREVIEW_HEIGHT);
  const [drawerHeight, setDrawerHeight] = useState(DEFAULT_DRAWER_HEIGHT);

  const currentValue = activeTab === "html" ? htmlCode : activeTab === "css" ? cssCode : jsCode;
  const currentLanguage = activeTab === "html" ? "html" : activeTab === "css" ? "css" : "javascript";

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
    setCodeByTab[activeTab](nextValue);
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
          fitContent
          frameHeight={previewHeight}
          onContentHeightChange={(height) => {
            const nextHeight = clampHeight(height, MIN_PREVIEW_HEIGHT, MAX_PREVIEW_HEIGHT);
            // Keep the preview stable when switching layouts: allow growth but avoid sudden shrink.
            setPreviewHeight((currentHeight) => Math.max(currentHeight, nextHeight));
          }}
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
        <button
          type="button"
          className="app-btn app-btn--text compact-preview-toggle"
          onClick={onToggleCode}
          aria-expanded={isCodeVisible}
          aria-controls="compact-code-drawer"
        >
          {isCodeVisible ? "Hide code" : "Show code"}
        </button>
      </div>

      {isCodeVisible && (
        <div
          className="compact-code-drawer"
          id="compact-code-drawer"
        >
          <div className="compact-code-drawer-header">
            <span className="compact-code-drawer-title">Code</span>
            <div className="compact-code-drawer-tabs" role="tablist" aria-label="Compact editor tabs">
              <button
                type="button"
                className={`app-btn app-btn--text compact-code-tab${activeTab === "html" ? " is-active" : ""}`}
                onClick={() => onTabChange("html")}
                role="tab"
                aria-selected={activeTab === "html"}
              >
                HTML
              </button>
              <button
                type="button"
                className={`app-btn app-btn--text compact-code-tab${activeTab === "javascript" ? " is-active" : ""}`}
                onClick={() => onTabChange("javascript")}
                role="tab"
                aria-selected={activeTab === "javascript"}
              >
                JavaScript
              </button>
              <button
                type="button"
                className={`app-btn app-btn--text compact-code-tab${activeTab === "css" ? " is-active" : ""}`}
                onClick={() => onTabChange("css")}
                role="tab"
                aria-selected={activeTab === "css"}
              >
                CSS
              </button>
            </div>
          </div>
          <div
            ref={editorContainerRef}
            className="compact-code-drawer-editor"
            style={{ height: `${drawerHeight}px` }}
          >
            <Editor
              height={`${drawerHeight}px`}
              defaultLanguage={currentLanguage}
              language={currentLanguage}
              loading={null}
              value={currentValue}
              onChange={handleChange}
              theme="vs-dark"
              options={editorOptions}
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