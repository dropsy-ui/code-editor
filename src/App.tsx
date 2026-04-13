import { useState } from "react";
import './App.scss';
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

function AppInner({ iframeScripts = [], iframeStyles = [] }: AppProps) {
  const [expanded, setExpanded] = useState({ html: true, js: true, css: true });
  const {
    editorColWidth,
    isDragging,
    containerRef,
    onSplitterMouseDown,
  } = useSplitter(50);

  return (
    <div className="app-body">
      {isDragging && (
        <div className="app-drag-overlay" />
      )}
      <div className="app-main">
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
            <PreviewSection iframeScripts={iframeScripts} iframeStyles={iframeStyles} />
          </div>
        </div>
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
