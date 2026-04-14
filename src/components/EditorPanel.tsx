import Editor from "@monaco-editor/react";
import { EditorHeader } from "./EditorHeader";
import { sharedMonacoEditorOptions } from "./monacoOptions";

type EditorPanelProps = {
  title: string;
  language: "html" | "javascript" | "css";
  value: string;
  onChange: (value: string) => void;
  expanded?: boolean;
  onToggle?: () => void;
};

const EditorPanel = ({
  title,
  language,
  value,
  onChange,
  expanded,
  onToggle,
}: EditorPanelProps) => {
  return (
    <div className="editor-container">
      <EditorHeader
        title={title}
        onClear={() => onChange("")}
        onToggle={onToggle}
        isCollapsed={!expanded}
      />
      {expanded && (
        <div className="editor-content">
          <Editor
            height="100%"
            defaultLanguage={language}
            loading={null}
            value={value}
            onChange={(nextValue) => onChange(nextValue || "")}
            theme="vs-dark"
            options={sharedMonacoEditorOptions}
          />
        </div>
      )}
    </div>
  );
};

export default EditorPanel;
