
import Editor from "@monaco-editor/react";
import { useCodeEditorStore } from "../context/CodeEditorStore";
import { EditorHeader } from "./EditorHeader";
import './JavaScriptEditor.scss';

type JavaScriptEditorProps = {
  expanded?: boolean;
  onExpand?: () => void;
};

const JavaScriptEditor = ({ expanded, onExpand }: JavaScriptEditorProps) => {
  const { jsCode, setJsCode } = useCodeEditorStore();
  return (
    <div className="editor-container">
      <EditorHeader
        title="JavaScript"
        onClear={() => setJsCode("")}
        onCollapse={onExpand}
        isCollapsed={!expanded}
      />
      {expanded && (
        <div className="editor-content">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            loading={null}
            value={jsCode}
            onChange={(value) => setJsCode(value || "")}
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

export default JavaScriptEditor;
