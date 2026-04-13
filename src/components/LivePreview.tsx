import { forwardRef, useEffect, useMemo, useRef } from "react";
import Save from "../assets/save.svg";
import Upload from "../assets/upload.svg";
import { useCodeEditorStore } from "../context/CodeEditorStore";
import "./LivePreview.scss";

type LivePreviewProps = {
  htmlCode: string;
  jsCode: string;
  cssCode: string;
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave?: () => void;
  layoutMode?: "full" | "compact";
  onOpenLayoutInNewWindow?: (mode: "full" | "compact") => void;
  iframeScripts?: string[]; // Array of script URLs for the iframe
  iframeStyles?: string[]; // Array of stylesheet URLs for the iframe
  onContentHeightChange?: (height: number) => void;
  fitContent?: boolean;
  frameHeight?: number;
};

const LivePreview = forwardRef<HTMLIFrameElement, LivePreviewProps>(
  (
    {
      htmlCode,
      jsCode,
      cssCode,
      onUpload,
      onSave,
      layoutMode,
      onOpenLayoutInNewWindow,
      iframeScripts = [],
      iframeStyles = [],
      onContentHeightChange,
      fitContent = false,
      frameHeight,
    },
    ref
  ) => {
    const { addLog } = useCodeEditorStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      // Listen for console messages from iframe
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "console") {
          addLog(event.data.level, event.data.message);
          return;
        }

        if (event.data?.type === "preview-height" && typeof event.data.height === "number") {
          onContentHeightChange?.(event.data.height);
        }
      };
      window.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }, [addLog, onContentHeightChange]);

    // Simple HTML validation (checks for unclosed tags, etc.)
    function isValidHTML(html: string) {
      // Create a DOM parser and check for errors
      const doc = document.implementation.createHTMLDocument("preview");
      doc.body.innerHTML = html;
      // If the input HTML is not equal to the parsed HTML, it's likely invalid
      return doc.body.innerHTML === html;
    }

    const showError = htmlCode && !isValidHTML(htmlCode);

    const srcdoc = useMemo(
      () =>
        showError
          ? `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="color: red; font-family: monospace; padding: 1em; background: #fff0f0; border: 1px solid #f00;">
            Invalid HTML provided. Please check your markup.
          </div>
        </body>
      </html>
    `
          : `
      <!DOCTYPE html>
      <html>
        <head>
          ${iframeScripts
            .map((src) => `<script type="module" src="${src}"></script>`)
            .join("\n")}
          ${iframeStyles
            .map(
              (href) => `<link rel="stylesheet" type="text/css" href="${href}">`
            )
            .join("\n")}
          <style>
            ${cssCode}
          </style>
        </head>
        <body>
          ${htmlCode}
          <script type="text/javascript">
            (function() {
              const sendToParent = (level, ...args) => {
                window.parent.postMessage({ type: 'console', level, message: args.map(a => {
                  try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
                }).join(' ') }, '*');
              };
              const reportHeight = () => {
                const body = document.body;
                const doc = document.documentElement;
                const height = Math.max(
                  body ? body.scrollHeight : 0,
                  body ? body.offsetHeight : 0,
                  doc ? doc.scrollHeight : 0,
                  doc ? doc.offsetHeight : 0
                );

                window.parent.postMessage({ type: 'preview-height', height }, '*');
              };

              console.log = (...args) => sendToParent('log', ...args);
              console.error = (...args) => sendToParent('error', ...args);
              window.addEventListener('load', reportHeight);
              window.addEventListener('resize', reportHeight);

              if ('ResizeObserver' in window) {
                const resizeObserver = new ResizeObserver(reportHeight);
                resizeObserver.observe(document.documentElement);
                resizeObserver.observe(document.body);
              }

              requestAnimationFrame(reportHeight);
              setTimeout(reportHeight, 0);
              ${jsCode.replace(/function\s+(\w+)/g, "window.$1 = function")}
              requestAnimationFrame(reportHeight);
            })();
          </script>
        </body>
      </html>
    `,
      [htmlCode, jsCode, cssCode, iframeScripts, iframeStyles, showError]
    );

    return (
      <div className={`live-preview-outer${fitContent ? " live-preview-outer--fit-content" : ""}`}>
        <div className="live-preview-header">
          <span className="live-preview-title">Live Preview</span>
          <div className="live-preview-header-actions">
            {onOpenLayoutInNewWindow && layoutMode && (
              <div className="live-preview-layout-actions" role="group" aria-label="Open layout in new window">
                <button
                  type="button"
                  className={`app-btn app-btn--text live-preview-layout-btn${layoutMode === "full" ? " is-active" : ""}`}
                  onClick={() => onOpenLayoutInNewWindow("full")}
                  aria-label="Open full layout in new window"
                >
                  Full
                </button>
                <button
                  type="button"
                  className={`app-btn app-btn--text live-preview-layout-btn${layoutMode === "compact" ? " is-active" : ""}`}
                  onClick={() => onOpenLayoutInNewWindow("compact")}
                  aria-label="Open compact layout in new window"
                >
                  Compact
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="file-input-hidden"
              accept=".json"
              onChange={onUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="app-btn live-preview-btn"
              aria-label="Load file"
            >
              <img src={Upload} alt="Upload" />
            </button>
            <button
              id="live-save-button"
              onClick={onSave}
              className="app-btn live-preview-btn"
              aria-label="Save file"
            >
              <img src={Save} alt="Save" />
            </button>
          </div>
        </div>
        <div className={`live-preview-stage${fitContent ? " live-preview-stage--fit-content" : ""}`}>
          <iframe
            ref={ref}
            title="Live Preview"
            className={`live-preview-iframe${fitContent ? " live-preview-iframe--fit-content" : ""}`}
            sandbox="allow-scripts"
            srcDoc={srcdoc}
            style={fitContent && frameHeight ? { height: `${frameHeight}px` } : undefined}
          />
        </div>
      </div>
    );
  }
);

export default LivePreview;
