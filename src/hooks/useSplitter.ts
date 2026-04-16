import { useCallback, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

const MIN_PANEL_WIDTH_PX = 300;
const KEYBOARD_RESIZE_STEP = 2;
const KEYBOARD_RESIZE_LARGE_STEP = 10;

const clampEditorPercent = (nextPercent: number, containerWidth: number) => {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) {
    return Math.max(0, Math.min(100, nextPercent));
  }

  const minEditorPercent = Math.min(50, (MIN_PANEL_WIDTH_PX / containerWidth) * 100);
  const maxEditorPercent = 100 - minEditorPercent;

  return Math.max(minEditorPercent, Math.min(maxEditorPercent, nextPercent));
};

export function useSplitter(initialPercent: number = 50) {
  const [editorColWidth, setEditorColWidth] = useState(initialPercent);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateEditorWidth = useCallback((nextPercent: number) => {
    const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 0;
    setEditorColWidth(clampEditorPercent(nextPercent, containerWidth));
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    /* v8 ignore next */
    if (!isDraggingRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;

    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    updateEditorWidth(percent);
  }, [updateEditorWidth]);

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

  const onSplitterKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? KEYBOARD_RESIZE_LARGE_STEP : KEYBOARD_RESIZE_STEP;
    let nextPercent: number | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        nextPercent = editorColWidth - step;
        break;
      case 'ArrowRight':
        nextPercent = editorColWidth + step;
        break;
      case 'Home':
        nextPercent = 0;
        break;
      case 'End':
        nextPercent = 100;
        break;
      default:
        break;
    }

    if (nextPercent === null) {
      return;
    }

    event.preventDefault();
    updateEditorWidth(nextPercent);
  }, [editorColWidth, updateEditorWidth]);

  return {
    editorColWidth,
    setEditorColWidth,
    isDragging,
    containerRef,
    onSplitterMouseDown,
    onSplitterKeyDown,
  };
}
