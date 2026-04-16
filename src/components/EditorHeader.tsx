import ChevronDown from '../assets/chevron-down.svg';
import ChevronUp from '../assets/chevron-up.svg';
import Trash from '../assets/trash.svg';
import { useCodeEditorMessages } from '../context/CodeEditorMessages';
import './EditorHeader.scss';

interface EditorHeaderProps {
  title: string;
  onClear: () => void;
  onToggle?: () => void;
  isCollapsed?: boolean;
  controlsId?: string;
}

export function EditorHeader({ title, onClear, onToggle, isCollapsed, controlsId }: EditorHeaderProps) {
  const messages = useCodeEditorMessages();

  return (
    <div className="editor-header">
      <div className="editor-header-title-group">
        <span className="editor-header-title">{title}</span>
      </div>
      <div className="editor-header-actions">
        {onToggle && (
          <button
            onClick={onToggle}
            className="app-btn editor-header-btn"
            aria-label={isCollapsed ? messages.expandLabel : messages.collapseLabel}
            aria-expanded={typeof isCollapsed === "boolean" ? !isCollapsed : undefined}
            aria-controls={controlsId}
            type="button"
          >
            {isCollapsed
              ? <img src={ChevronDown} alt="" aria-hidden="true" />
              : <img src={ChevronUp} alt="" aria-hidden="true" />}
          </button>
        )}
        <button
          onClick={onClear}
          className="app-btn editor-header-btn"
          aria-label={messages.clearLabel}
          type="button"
        >
          <img src={Trash} alt="" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default EditorHeader;
