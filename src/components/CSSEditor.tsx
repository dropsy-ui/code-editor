
import Editor from "@monaco-editor/react";
import { useCodeEditorStore } from "../context/CodeEditorStore";
import './CSSEditor.scss';
import { EditorHeader } from "./EditorHeader";

type CSSEditorProps = {
  expanded?: boolean;
  onExpand?: () => void;
};

const CSSEditor = ({ expanded, onExpand }: CSSEditorProps) => {
  const { cssCode, setCssCode } = useCodeEditorStore();
  return (
    <div className="editor-container">
      <EditorHeader
        title="CSS"
        onClear={() => setCssCode("")}
        onCollapse={onExpand}
        isCollapsed={!expanded}
      />
      {expanded && (
        <div className="editor-content">
          <Editor
            height="100%"
            defaultLanguage="css"
            loading={null}
            value={cssCode}
            onChange={(value) => setCssCode(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              fontSize: 16,
              wordWrap: "on",
              lineNumbers: "on",
              tabSize: 2,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CSSEditor;
