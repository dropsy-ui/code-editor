import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
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

const MIN_FIT_CONTENT_IFRAME_HEIGHT = 120;

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
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [measuredFrameHeight, setMeasuredFrameHeight] = useState<number | null>(
      frameHeight ?? (fitContent ? MIN_FIT_CONTENT_IFRAME_HEIGHT : null)
    );

    useEffect(() => {
      if (typeof frameHeight === "number") {
        setMeasuredFrameHeight(frameHeight);
        return;
      }

      if (fitContent) {
        setMeasuredFrameHeight((currentHeight) => currentHeight ?? MIN_FIT_CONTENT_IFRAME_HEIGHT);
        return;
      }

      setMeasuredFrameHeight(null);
    }, [fitContent, frameHeight]);

    useEffect(() => {
      // Listen for console messages from this iframe only
      const handleMessage = (event: MessageEvent) => {
        const iframeWindow = iframeRef.current?.contentWindow;
        if (iframeWindow && event.source && event.source !== iframeWindow) {
          return;
        }

        if (event.data?.type === "console") {
          addLog(event.data.level, event.data.message);
          return;
        }

        if (event.data?.type === "preview-height" && typeof event.data.height === "number") {
          const nextHeight = Math.max(1, Math.ceil(event.data.height));

          if (fitContent && typeof frameHeight !== "number") {
            const appliedHeight = Math.max(MIN_FIT_CONTENT_IFRAME_HEIGHT, nextHeight);
            setMeasuredFrameHeight((currentHeight) => (currentHeight === appliedHeight ? currentHeight : appliedHeight));
          }

          onContentHeightChange?.(nextHeight);
        }
      };
      window.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }, [addLog, fitContent, frameHeight, onContentHeightChange]);

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
            .map((src) => `<script src="${src}"></script>`)
            .join("\n")}
          ${iframeStyles
            .map(
              (href) => `<link rel="stylesheet" type="text/css" href="${href}">`
            )
            .join("\n")}
          <style>
            html, body {
              margin: 0;
              padding: 0;
              overflow: hidden;
            }

            #code-editor-preview-root {
              display: flow-root;
            }

            ${cssCode}
          </style>
        </head>
        <body>
          <div id="code-editor-preview-root">${htmlCode}</div>
          <script type="text/javascript">
            (function() {
              const sendToParent = (level, ...args) => {
                window.parent.postMessage({ type: 'console', level, message: args.map(a => {
                  try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
                }).join(' ') }, '*');
              };

              let lastReportedHeight = -1;
              let frameRequested = false;
              const root = document.getElementById('code-editor-preview-root');

              const reportHeight = () => {
                frameRequested = false;

                const body = document.body;

                if (!body || !root) {
                  return;
                }

                const contentHeight = Math.max(
                  root.scrollHeight,
                  root.offsetHeight,
                  root.getBoundingClientRect().height,
                );
                const nextHeight = Math.ceil(contentHeight + 1);

                if (Math.abs(nextHeight - lastReportedHeight) <= 1) {
                  return;
                }

                lastReportedHeight = nextHeight;
                window.parent.postMessage({ type: 'preview-height', height: nextHeight }, '*');
              };

              const scheduleReportHeight = () => {
                if (frameRequested) {
                  return;
                }

                frameRequested = true;
                window.requestAnimationFrame(reportHeight);
              };

              console.log = (...args) => sendToParent('log', ...args);
              console.error = (...args) => sendToParent('error', ...args);
              window.addEventListener('load', scheduleReportHeight);
              window.addEventListener('resize', scheduleReportHeight);

              if ('ResizeObserver' in window && root) {
                const resizeObserver = new ResizeObserver(scheduleReportHeight);
                resizeObserver.observe(root);
              }

              scheduleReportHeight();
              setTimeout(scheduleReportHeight, 0);
              ${jsCode.replace(/function\s+(\w+)/g, "window.$1 = function")}
              scheduleReportHeight();
            })();
          </script>
        </body>
      </html>
    `,
      [htmlCode, jsCode, cssCode, iframeScripts, iframeStyles, showError]
    );

    const resolvedFrameHeight = frameHeight ?? measuredFrameHeight;

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
            ref={(node) => {
              iframeRef.current = node;

              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            title="Live Preview"
            className={`live-preview-iframe${fitContent ? " live-preview-iframe--fit-content" : ""}`}
            sandbox="allow-scripts"
            srcDoc={srcdoc}
            style={fitContent && typeof resolvedFrameHeight === "number"
              ? { height: `${resolvedFrameHeight}px` }
              : undefined}
          />
        </div>
      </div>
    );
  }
);

export default LivePreview;
