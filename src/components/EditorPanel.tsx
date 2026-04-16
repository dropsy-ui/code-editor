import Editor from "@monaco-editor/react";
import { useId } from "react";
import { useCodeEditorStore } from "../context/CodeEditorStore";
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
  const { theme } = useCodeEditorStore();
  const monacoTheme = theme === "light" ? "vs" : "vs-dark";
  const contentId = useId();

  return (
    <div className="editor-container" role="region" aria-label={`${title} editor`}>
      <EditorHeader
        title={title}
        onClear={() => onChange("")}
        onToggle={onToggle}
        isCollapsed={!expanded}
        controlsId={contentId}
      />
      {expanded && (
        <div className="editor-content" id={contentId}>
          <Editor
            height="100%"
            defaultLanguage={language}
            loading={null}
            value={value}
            onChange={(nextValue) => onChange(nextValue || "")}
            theme={monacoTheme}
            options={{
              ...sharedMonacoEditorOptions,
              ariaLabel: `${title} code editor`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EditorPanel;
