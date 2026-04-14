
import { useCodeEditorStore } from "../context/CodeEditorStore";
import './CodeEditor.scss';
import EditorPanel from "./EditorPanel";

type CodeEditorProps = {
  expanded?: boolean;
  onExpand?: () => void;
};

const CodeEditor = ({ expanded, onExpand }: CodeEditorProps) => {
  const { htmlCode, setHtmlCode } = useCodeEditorStore();

  return (
    <EditorPanel
      title="HTML"
      language="html"
      value={htmlCode}
      onChange={setHtmlCode}
      expanded={expanded}
      onToggle={onExpand}
    />
  );
};

export default CodeEditor;
