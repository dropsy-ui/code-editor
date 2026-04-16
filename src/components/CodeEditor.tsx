
import { useCodeEditorMessages } from "../context/CodeEditorMessages";
import { useCodeEditorStore } from "../context/CodeEditorStore";
import './CodeEditor.scss';
import EditorPanel from "./EditorPanel";

type CodeEditorProps = {
  expanded?: boolean;
  onExpand?: () => void;
};

const CodeEditor = ({ expanded, onExpand }: CodeEditorProps) => {
  const { htmlCode, setHtmlCode } = useCodeEditorStore();
  const messages = useCodeEditorMessages();

  return (
    <EditorPanel
      title={messages.htmlLabel}
      language="html"
      value={htmlCode}
      onChange={setHtmlCode}
      expanded={expanded}
      onToggle={onExpand}
    />
  );
};

export default CodeEditor;
