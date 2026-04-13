import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useCodeEditorStore } from "../context/CodeEditorStore";
import LivePreview from "./LivePreview";
import "./CompactPreviewLayout.scss";

type CompactEditorTab = "html" | "javascript";

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

const editorOptions = {
  minimap: { enabled: false },
  automaticLayout: true,
  fontSize: 16,
  wordWrap: "on" as const,
  lineNumbers: "on" as const,
  tabSize: 2,
};

const DEFAULT_PREVIEW_HEIGHT = 220;
const MIN_PREVIEW_HEIGHT = 140;
const MAX_PREVIEW_HEIGHT = 480;
const DEFAULT_DRAWER_HEIGHT = 280;
const MIN_DRAWER_HEIGHT = 220;
const MAX_DRAWER_HEIGHT = 640;

const clampHeight = (height: number, minHeight: number, maxHeight: number) => {
  return Math.max(minHeight, Math.min(maxHeight, Math.round(height)));
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
  const [previewHeight, setPreviewHeight] = useState(DEFAULT_PREVIEW_HEIGHT);
  const [drawerHeight, setDrawerHeight] = useState(DEFAULT_DRAWER_HEIGHT);

  const currentValue = activeTab === "html" ? htmlCode : jsCode;
  const currentLanguage = activeTab === "html" ? "html" : "javascript";

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !isCodeVisible) {
      return;
    }

    setDrawerHeight(
      clampHeight(editor.getContentHeight() + 20, MIN_DRAWER_HEIGHT, MAX_DRAWER_HEIGHT)
    );
    editor.layout();
  }, [activeTab, currentValue, isCodeVisible]);

  const handleChange = (value: string | undefined) => {
    const nextValue = value || "";

    if (activeTab === "html") {
      setHtmlCode(nextValue);
      return;
    }

    setJsCode(nextValue);
  };

  return (
    <div className="compact-layout">
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
            setPreviewHeight(
              clampHeight(height, MIN_PREVIEW_HEIGHT, MAX_PREVIEW_HEIGHT)
            );
          }}
          onUpload={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (loadEvent) => {
              try {
                const content = JSON.parse(loadEvent.target?.result as string);
                setCssCode(content.css || "");
                setHtmlCode(content.html || "");
                setJsCode(content.javascript || "");
              } catch (err) {
                console.error("Failed to parse file:", err);
              }
            };
            reader.readAsText(file);
          }}
          onSave={() => {
            const content = {
              html: htmlCode,
              javascript: jsCode,
              css: cssCode,
            };
            const blob = new Blob([JSON.stringify(content, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "sandbox-state.json";
            link.click();
            URL.revokeObjectURL(url);
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
          style={{ height: `${drawerHeight}px` }}
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
            </div>
          </div>
          <div className="compact-code-drawer-editor">
            <Editor
              height={`${drawerHeight - 41}px`}
              defaultLanguage={currentLanguage}
              language={currentLanguage}
              value={currentValue}
              onChange={handleChange}
              theme="vs-dark"
              options={editorOptions}
              onMount={(editor) => {
                editorRef.current = editor;
                setDrawerHeight(
                  clampHeight(editor.getContentHeight() + 20, MIN_DRAWER_HEIGHT, MAX_DRAWER_HEIGHT)
                );
                editor.onDidContentSizeChange(() => {
                  setDrawerHeight(
                    clampHeight(editor.getContentHeight() + 20, MIN_DRAWER_HEIGHT, MAX_DRAWER_HEIGHT)
                  );
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