import { createContext, useContext } from 'react';

export type CodeEditorStore = {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  setHtmlCode: (code: string) => void;
  setCssCode: (code: string) => void;
  setJsCode: (code: string) => void;
  logs: Array<{ level: string; message: string }>;
  addLog: (level: string, message: string) => void;
  clearLogs: () => void;
};

export const CodeEditorStoreContext = createContext<CodeEditorStore | undefined>(undefined);

export function useCodeEditorStore() {
  const ctx = useContext(CodeEditorStoreContext);
  /* v8 ignore next */
  if (!ctx) throw new Error('useCodeEditorStore must be used within a CodeEditorStoreProvider');
  return ctx;
}
