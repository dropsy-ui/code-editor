import { useCodeEditorStore } from "../context/CodeEditorStore";
import Console from "./Console";
import LivePreview from "./LivePreview";
import { loadSandboxStateFromFile, saveSandboxStateToFile } from "../utils/sandboxState";

interface PreviewSectionProps {
  iframeScripts?: string[];
  iframeStyles?: string[];
  layoutMode: "full" | "compact";
  onOpenLayoutInNewWindow: (mode: "full" | "compact") => void;
  showModeToggle?: boolean;
  showThemeToggle?: boolean;
  showSaveButton?: boolean;
  showUploadButton?: boolean;
}

const PreviewSection = ({
  iframeScripts = [],
  iframeStyles = [],
  layoutMode,
  onOpenLayoutInNewWindow,
  showModeToggle = true,
  showThemeToggle = true,
  showSaveButton = true,
  showUploadButton = true,
}: PreviewSectionProps) => {
  const { htmlCode, jsCode, cssCode, setHtmlCode, setJsCode, setCssCode } = useCodeEditorStore();
  return (
    <>
      <div className="live-preview-flex">
        <LivePreview
          htmlCode={htmlCode}
          jsCode={jsCode}
          cssCode={cssCode}
          iframeScripts={iframeScripts}
          iframeStyles={iframeStyles}
          layoutMode={layoutMode}
          onOpenLayoutInNewWindow={onOpenLayoutInNewWindow}
          showModeToggle={showModeToggle}
          showThemeToggle={showThemeToggle}
          showSaveButton={showSaveButton}
          showUploadButton={showUploadButton}
          onUpload={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            loadSandboxStateFromFile(file, { setHtmlCode, setCssCode, setJsCode });
          }}
          onSave={() => {
            saveSandboxStateToFile({
              html: htmlCode,
              javascript: jsCode,
              css: cssCode,
            });
          }}
        />
      </div>
      <div className="console-section">
        <Console />
      </div>
    </>
  );
};

export default PreviewSection;
