
import { useCodeEditorMessages } from "../context/CodeEditorMessages";
import { useCodeEditorStore } from "../context/CodeEditorStore";
import './CSSEditor.scss';
import EditorPanel from "./EditorPanel";

type CSSEditorProps = {
  expanded?: boolean;
  onExpand?: () => void;
};

const CSSEditor = ({ expanded, onExpand }: CSSEditorProps) => {
  const { cssCode, setCssCode } = useCodeEditorStore();
  const messages = useCodeEditorMessages();

  return (
    <EditorPanel
      title={messages.cssLabel}
      language="css"
      value={cssCode}
      onChange={setCssCode}
      expanded={expanded}
      onToggle={onExpand}
    />
  );
};

export default CSSEditor;
