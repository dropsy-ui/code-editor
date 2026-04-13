import { useState } from "react";
import './App.scss';
import CompactPreviewLayout from "./components/CompactPreviewLayout";
import EditorsColumn from "./components/EditorsColumn";
import PreviewSection from "./components/PreviewSection";
import { CodeEditorStoreProvider } from "./context/CodeStoreContext";
import { useSplitter } from "./hooks/useSplitter";
import "./splitter.scss";

// Accept iframeScripts and iframeStyles as props for embedding
interface AppProps {
  iframeScripts?: string[];
  iframeStyles?: string[];
}

type LayoutMode = "full" | "compact";
type CompactEditorTab = "html" | "javascript";

const getInitialLayoutMode = (): LayoutMode => {
  if (typeof window === "undefined") {
    return "full";
  }

  const mode = new URLSearchParams(window.location.search).get("layout");
  return mode === "compact" ? "compact" : "full";
};

function AppInner({ iframeScripts = [], iframeStyles = [] }: AppProps) {
  const [expanded, setExpanded] = useState({ html: true, js: true, css: true });
  const [layoutMode] = useState<LayoutMode>(getInitialLayoutMode);
  const [isCompactCodeVisible, setIsCompactCodeVisible] = useState(false);
  const [compactEditorTab, setCompactEditorTab] = useState<CompactEditorTab>("html");
  const {
    editorColWidth,
    isDragging,
    containerRef,
    onSplitterMouseDown,
  } = useSplitter(50);

  const isCompactMode = layoutMode === "compact";

  const openLayoutInNewWindow = (mode: LayoutMode) => {
    const url = new URL(window.location.href);
    url.searchParams.set("layout", mode);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`app-body${isCompactMode ? " app-body--compact" : ""}`}>
      {isDragging && !isCompactMode && (
        <div className="app-drag-overlay" />
      )}
      <div className={`app-main${isCompactMode ? " app-main--compact" : ""}`}>
        {isCompactMode ? (
          <div className="app-compact-main">
            <CompactPreviewLayout
              isCodeVisible={isCompactCodeVisible}
              activeTab={compactEditorTab}
              onToggleCode={() => setIsCompactCodeVisible((current) => !current)}
              onTabChange={setCompactEditorTab}
              layoutMode={layoutMode}
              onOpenLayoutInNewWindow={openLayoutInNewWindow}
              iframeScripts={iframeScripts}
              iframeStyles={iframeStyles}
            />
          </div>
        ) : (
          <div className="app-editors-row" ref={containerRef}>
            <div
              className="app-editors-col"
              style={{
                width: `${editorColWidth}%`,
              }}
            >
              <EditorsColumn
                expanded={expanded}
                setExpanded={setExpanded}
              />
            </div>
            <div
              className="splitter"
              onMouseDown={onSplitterMouseDown}
            />
            <div
              className="preview-section"
              style={{ width: `${100 - editorColWidth}%` }}
            >
              <PreviewSection
                iframeScripts={iframeScripts}
                iframeStyles={iframeStyles}
                layoutMode={layoutMode}
                onOpenLayoutInNewWindow={openLayoutInNewWindow}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App(props: AppProps) {
  return (
    <CodeEditorStoreProvider>
      <AppInner {...props} />
    </CodeEditorStoreProvider>
  );
}

export default App;
