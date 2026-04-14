
import { useCodeEditorStore } from "../context/CodeEditorStore";
import './CSSEditor.scss';
import EditorPanel from "./EditorPanel";

type CSSEditorProps = {
  expanded?: boolean;
  onExpand?: () => void;
};

const CSSEditor = ({ expanded, onExpand }: CSSEditorProps) => {
  const { cssCode, setCssCode } = useCodeEditorStore();

  return (
    <EditorPanel
      title="CSS"
      language="css"
      value={cssCode}
      onChange={setCssCode}
      expanded={expanded}
      onToggle={onExpand}
    />
  );
};

export default CSSEditor;
