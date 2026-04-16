
import { useCodeEditorStore } from '../context/CodeEditorStore';
import './Console.scss';
import EditorHeader from "./EditorHeader";

const Console = () => {
  const { logs, clearLogs } = useCodeEditorStore();

  return (
    <div className="console-container" role="region" aria-label="Console">
      <EditorHeader title="Console" onClear={clearLogs} />
      <div
        className="console-logs"
        role="log"
        aria-label="Console output"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
      >
        {logs.length === 0 ? (
          <div className="console-empty">No console output yet.</div>
        ) : logs.map((log, i) => (
          <div key={i} className={`console-log console-log--${log.level}`}>
            {`> ${log.level === 'error' ? 'Error: ' : ''}${log.message}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Console;
