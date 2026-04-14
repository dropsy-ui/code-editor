import { useCallback, useRef, useState } from "react";

export function useSplitter(initialPercent: number = 50) {
  const [editorColWidth, setEditorColWidth] = useState(initialPercent);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    /* v8 ignore next */
    if (!isDraggingRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const minPx = 300;
    const minEditorPercent = (minPx / rect.width) * 100;
    const maxEditorPercent = 100 - minEditorPercent;
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.max(minEditorPercent, Math.min(maxEditorPercent, percent));
    setEditorColWidth(percent);
  }, []);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove]);

  const onSplitterMouseDown = useCallback(() => {
    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [onMouseMove, onMouseUp]);

  return {
    editorColWidth,
    setEditorColWidth,
    isDragging,
    containerRef,
    onSplitterMouseDown,
  };
}
