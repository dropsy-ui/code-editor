
import { useCodeEditorStore } from '../context/CodeEditorStore';
import './Console.scss';
import EditorHeader from "./EditorHeader";

const Console = () => {
  const { logs, clearLogs } = useCodeEditorStore();

  return (
    <div className="console-container">
      <EditorHeader title="Console" onClear={clearLogs} />
      <div className="console-logs">
        {logs.map((log, i) => (
          <div key={i} className={`console-log console-log--${log.level}`}>
            {`> ${log.level === 'error' ? 'Error: ' : ''}${log.message}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Console;
