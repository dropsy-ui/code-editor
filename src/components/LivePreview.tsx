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
  iframeScripts?: string[]; // Array of script URLs for the iframe
  iframeStyles?: string[]; // Array of stylesheet URLs for the iframe
};

const LivePreview = forwardRef<HTMLIFrameElement, LivePreviewProps>(
  (
    {
      htmlCode,
      jsCode,
      cssCode,
      onUpload,
      onSave,
      iframeScripts = [],
      iframeStyles = [],
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
        }
      };
      window.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }, [addLog]);

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
              console.log = (...args) => sendToParent('log', ...args);
              console.error = (...args) => sendToParent('error', ...args);
              ${jsCode.replace(/function\s+(\w+)/g, "window.$1 = function")}
            })();
          </script>
        </body>
      </html>
    `,
      [htmlCode, jsCode, cssCode, iframeScripts, iframeStyles, showError]
    );

    return (
      <div className="live-preview-outer">
        <div className="live-preview-header">
          <span className="live-preview-title">Live Preview</span>
          <div className="live-preview-header-actions">
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
        <div className="live-preview-stage">
          <iframe
            ref={ref}
            title="Live Preview"
            className="live-preview-iframe"
            sandbox="allow-scripts"
            srcDoc={srcdoc}
          />
        </div>
      </div>
    );
  }
);

export default LivePreview;
