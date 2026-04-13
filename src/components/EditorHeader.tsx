import ChevronDown from '../assets/chevron-down.svg';
import ChevronUp from '../assets/chevron-up.svg';
import Trash from '../assets/trash.svg';
import './EditorHeader.scss';

interface EditorHeaderProps {
  title: string;
  onClear: () => void;
  onCollapse?: () => void; // Optional collapse handler
  isCollapsed?: boolean;   // Optional collapsed state
}

export function EditorHeader({ title, onClear, onCollapse, isCollapsed }: EditorHeaderProps) {
  return (
    <div className="editor-header">
      <div className="editor-header-title-group">
        <span className="editor-header-title">{title}</span>
      </div>
      <div className="editor-header-actions">
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="app-btn editor-header-btn"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            type="button"
          >
            {isCollapsed
              ? <img src={ChevronDown} alt="Expand" />
              : <img src={ChevronUp} alt="Collapse" />}
          </button>
        )}
        <button
          onClick={onClear} className="app-btn editor-header-btn"
          aria-label="Clear"
          type="button"
        >
          <img src={Trash} alt="Clear" />
        </button>
      </div>
    </div>
  );
}

export default EditorHeader;
