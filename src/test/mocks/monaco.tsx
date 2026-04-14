import { useEffect, useRef } from "react";

type LayoutDimensions = { width: number; height: number };

let lastLayoutDimensions: LayoutDimensions | null = null;

export function __resetMonacoMockState() {
  lastLayoutDimensions = null;
}

export function __getLastLayoutDimensions() {
  return lastLayoutDimensions;
}

type EditorProps = {
  value?: string;
  defaultLanguage?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: {
    getContentHeight: () => number;
    layout: (dimensions?: LayoutDimensions) => void;
    onDidContentSizeChange: (callback: () => void) => { dispose: () => void };
  }) => void;
  height?: string;
};

export default function MockMonacoEditor({
  value = "",
  defaultLanguage,
  language,
  onChange,
  onMount,
  height,
}: EditorProps) {
  const callbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!onMount) return;

    const editor = {
      getContentHeight: () => 280,
      layout: (dimensions?: LayoutDimensions) => {
        lastLayoutDimensions = dimensions ?? null;
      },
      onDidContentSizeChange: (callback: () => void) => {
        callbackRef.current = callback;
        return { dispose: () => { callbackRef.current = null; } };
      },
    };

    onMount(editor);

    return () => {
      callbackRef.current = null;
    };
  }, [onMount]);

  return (
    <textarea
      aria-label={`monaco-${language ?? defaultLanguage ?? "plain"}`}
      data-testid="mock-monaco-editor"
      style={{ height: height ?? "auto" }}
      value={value}
      onChange={(event) => {
        onChange?.(event.target.value === "__undefined__" ? undefined : event.target.value);
        callbackRef.current?.();
      }}
    />
  );
}
