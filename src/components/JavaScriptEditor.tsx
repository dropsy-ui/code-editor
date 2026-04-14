
import { useCodeEditorStore } from "../context/CodeEditorStore";
import './JavaScriptEditor.scss';
import EditorPanel from "./EditorPanel";

type JavaScriptEditorProps = {
  expanded?: boolean;
  onExpand?: () => void;
};

const JavaScriptEditor = ({ expanded, onExpand }: JavaScriptEditorProps) => {
  const { jsCode, setJsCode } = useCodeEditorStore();

  return (
    <EditorPanel
      title="JavaScript"
      language="javascript"
      value={jsCode}
      onChange={setJsCode}
      expanded={expanded}
      onToggle={onExpand}
    />
  );
};

export default JavaScriptEditor;
