import { ReactNode, useState } from 'react';
import { CodeEditorStoreContext } from './CodeEditorStore';
import type { AppTheme, ResolvedTheme } from './CodeEditorStore';

function resolveInitialTheme(pref: AppTheme | undefined): ResolvedTheme {
  if (pref === 'light') return 'light';
  if (pref === 'dark') return 'dark';
  // 'system' or omitted: follow browser preference
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

type CodeEditorStoreProviderProps = {
  children: ReactNode;
  initialHtmlCode?: string;
  initialCssCode?: string;
  initialJsCode?: string;
  defaultTheme?: AppTheme;
};

export const CodeEditorStoreProvider = ({
  children,
  initialHtmlCode = '',
  initialCssCode = '',
  initialJsCode = '',
  defaultTheme,
}: CodeEditorStoreProviderProps) => {
  const [htmlCode, setHtmlCode] = useState(initialHtmlCode);
  const [cssCode, setCssCode] = useState(initialCssCode);
  const [jsCode, setJsCode] = useState(initialJsCode);
  const [logs, setLogs] = useState<Array<{ level: string; message: string }>>([]);
  const [theme, setTheme] = useState<ResolvedTheme>(() => resolveInitialTheme(defaultTheme));

  const addLog = (level: string, message: string) => {
    setLogs((prev) => [...prev, { level, message }]);
  };

  const clearLogs = () => setLogs([]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <CodeEditorStoreContext.Provider value={{ htmlCode, cssCode, jsCode, setHtmlCode, setCssCode, setJsCode, logs, addLog, clearLogs, theme, toggleTheme }}>
      {children}
    </CodeEditorStoreContext.Provider>
  );
};
