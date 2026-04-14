import { ReactNode, useState } from 'react';
import { CodeEditorStoreContext } from './CodeEditorStore';

type CodeEditorStoreProviderProps = {
  children: ReactNode;
  initialHtmlCode?: string;
  initialCssCode?: string;
  initialJsCode?: string;
};

export const CodeEditorStoreProvider = ({
  children,
  initialHtmlCode = '',
  initialCssCode = '',
  initialJsCode = '',
}: CodeEditorStoreProviderProps) => {
  const [htmlCode, setHtmlCode] = useState(initialHtmlCode);
  const [cssCode, setCssCode] = useState(initialCssCode);
  const [jsCode, setJsCode] = useState(initialJsCode);
  const [logs, setLogs] = useState<Array<{ level: string; message: string }>>([]);

  const addLog = (level: string, message: string) => {
    setLogs((prev) => [...prev, { level, message }]);
  };

  const clearLogs = () => setLogs([]);

  return (
    <CodeEditorStoreContext.Provider value={{ htmlCode, cssCode, jsCode, setHtmlCode, setCssCode, setJsCode, logs, addLog, clearLogs }}>
      {children}
    </CodeEditorStoreContext.Provider>
  );
};
