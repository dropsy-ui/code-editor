import { useCodeEditorStore } from "../context/CodeEditorStore";
import Console from "./Console";
import LivePreview from "./LivePreview";

interface PreviewSectionProps {
  iframeScripts?: string[];
  iframeStyles?: string[];
  layoutMode: "full" | "compact";
  onOpenLayoutInNewWindow: (mode: "full" | "compact") => void;
}

const PreviewSection = ({
  iframeScripts = [],
  iframeStyles = [],
  layoutMode,
  onOpenLayoutInNewWindow,
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
          onUpload={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const content = JSON.parse(e.target?.result as string);
                setCssCode(content.css || "");
                setHtmlCode(content.html || "");
                setJsCode(content.javascript || "");
              } catch (err) {
                console.error("Failed to parse file:", err);
              }
            };
            reader.readAsText(file);
          }}
          onSave={() => {
            const content = {
              html: htmlCode,
              javascript: jsCode,
              css: cssCode,
            };
            const blob = new Blob([JSON.stringify(content, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sandbox-state.json";
            a.click();
            URL.revokeObjectURL(url);
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
