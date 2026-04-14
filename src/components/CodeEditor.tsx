
import Editor from "@monaco-editor/react";
import { useCodeEditorStore } from "../context/CodeEditorStore";
import './CodeEditor.scss';
import { EditorHeader } from "./EditorHeader";

type CodeEditorProps = {
  expanded?: boolean;
  onExpand?: () => void;
};

const CodeEditor = ({ expanded, onExpand }: CodeEditorProps) => {
  const { htmlCode, setHtmlCode } = useCodeEditorStore();
  return (
    <div className="editor-container">
      <EditorHeader
        title="HTML"
        onClear={() => setHtmlCode("")}
        onCollapse={onExpand}
        isCollapsed={!expanded}
      />
      {expanded && (
        <div className="editor-content">
          <Editor
            height="100%"
            defaultLanguage="html"
            loading={null}
            value={htmlCode}
            onChange={(value) => setHtmlCode(value || "")}
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

export default CodeEditor;
