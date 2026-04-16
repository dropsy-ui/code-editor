import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  showModeToggle?: boolean;
  showThemeToggle?: boolean;
  showSaveButton?: boolean;
  showUploadButton?: boolean;
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
      showModeToggle = true,
      showThemeToggle = true,
      showSaveButton = true,
      showUploadButton = true,
    },
    ref
  ) => {
    const { addLog, theme, toggleTheme } = useCodeEditorStore();
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

    const applyContentHeight = useCallback((nextHeight: number) => {
      const normalizedHeight = Math.max(1, Math.ceil(nextHeight));

      if (fitContent && typeof frameHeight !== "number") {
        const appliedHeight = Math.max(MIN_FIT_CONTENT_IFRAME_HEIGHT, normalizedHeight);
        setMeasuredFrameHeight((currentHeight) => (currentHeight === appliedHeight ? currentHeight : appliedHeight));
      }

      onContentHeightChange?.(normalizedHeight);
    }, [fitContent, frameHeight, onContentHeightChange]);

    const syncFrameHeightFromDocument = useCallback(() => {
      if (!fitContent || typeof frameHeight === "number") {
        return;
      }

      const iframeDocument = iframeRef.current?.contentDocument;
      const root = iframeDocument?.getElementById("code-editor-preview-root");
      const body = iframeDocument?.body;
      const documentElement = iframeDocument?.documentElement;

      if (!root || !body || !documentElement) {
        return;
      }

      const measuredHeight = Math.max(
        root.scrollHeight,
        root.offsetHeight,
        root.getBoundingClientRect().height,
        body.scrollHeight,
        documentElement.scrollHeight,
      );

      if (Number.isFinite(measuredHeight) && measuredHeight > 0) {
        applyContentHeight(measuredHeight);
      }
    }, [applyContentHeight, fitContent, frameHeight]);

    useLayoutEffect(() => {
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
          applyContentHeight(event.data.height);
        }
      };
      window.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }, [addLog, applyContentHeight]);

    useLayoutEffect(() => {
      if (!fitContent || typeof frameHeight === "number") {
        return;
      }

      const iframeNode = iframeRef.current;

      if (!iframeNode) {
        return;
      }

      const timedMeasurements = [0, 50, 150, 300, 600, 1000]
        .map((delay) => window.setTimeout(syncFrameHeightFromDocument, delay));
      const intervalId = window.setInterval(syncFrameHeightFromDocument, 150);
      const stopPollingTimeoutId = window.setTimeout(() => {
        window.clearInterval(intervalId);
      }, 5000);

      let innerResizeObserver: ResizeObserver | undefined;

      const attachInnerObserver = () => {
        const iframeDocument = iframeNode.contentDocument;
        const root = iframeDocument?.getElementById("code-editor-preview-root") ?? iframeDocument?.documentElement;

        if (!root) {
          return;
        }

        syncFrameHeightFromDocument();

        if ("ResizeObserver" in window) {
          innerResizeObserver?.disconnect();
          innerResizeObserver = new ResizeObserver(syncFrameHeightFromDocument);
          innerResizeObserver.observe(root);
        }
      };

      const handleLoad = () => {
        attachInnerObserver();
      };

      iframeNode.addEventListener("load", handleLoad);

      if (iframeNode.contentDocument?.readyState === "complete") {
        attachInnerObserver();
      }

      let intersectionObserver: IntersectionObserver | undefined;

      if ("IntersectionObserver" in window) {
        intersectionObserver = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            syncFrameHeightFromDocument();
          }
        }, { threshold: 0.01 });

        intersectionObserver.observe(iframeNode);
      }

      return () => {
        iframeNode.removeEventListener("load", handleLoad);
        timedMeasurements.forEach((timeoutId) => window.clearTimeout(timeoutId));
        window.clearInterval(intervalId);
        window.clearTimeout(stopPollingTimeoutId);
        innerResizeObserver?.disconnect();
        intersectionObserver?.disconnect();
      };
    }, [fitContent, frameHeight, syncFrameHeightFromDocument, htmlCode, jsCode, cssCode, iframeScripts, iframeStyles]);

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
              const fitContentMode = ${fitContent ? "true" : "false"};
              const root = document.getElementById('code-editor-preview-root');

              const reportHeight = () => {
                frameRequested = false;

                const body = document.body;
                const documentElement = document.documentElement;

                if (!body || !root || !documentElement) {
                  return;
                }

                const viewportHeight = Math.ceil(window.innerHeight || 0);
                const contentHeight = Math.max(
                  root.scrollHeight,
                  root.offsetHeight,
                  root.getBoundingClientRect().height,
                  body.scrollHeight,
                  documentElement.scrollHeight,
                );
                const nextHeight = Math.ceil(contentHeight + 1);
                const hasVerticalOverflow = contentHeight > viewportHeight + 2;
                const isViewportLockedHeight = viewportHeight > 0 && Math.abs(nextHeight - viewportHeight) <= 2;

                if (lastReportedHeight > 0 && isViewportLockedHeight && !hasVerticalOverflow) {
                  return;
                }

                if (Math.abs(nextHeight - lastReportedHeight) <= 1) {
                  return;
                }

                if (fitContentMode && window.frameElement instanceof HTMLIFrameElement) {
                  window.frameElement.style.height = nextHeight + 'px';
                }

                lastReportedHeight = nextHeight;
                window.parent.postMessage({ type: 'preview-height', height: nextHeight }, '*');
              };

              const scheduleReportHeight = () => {
                if (frameRequested) {
                  return;
                }

                frameRequested = true;

                const runReportHeight = () => {
                  if (!frameRequested) {
                    return;
                  }

                  reportHeight();
                };

                if (typeof window.requestAnimationFrame === 'function') {
                  window.requestAnimationFrame(runReportHeight);
                }

                window.setTimeout(runReportHeight, 0);
              };

              console.log = (...args) => sendToParent('log', ...args);
              console.error = (...args) => sendToParent('error', ...args);
              window.addEventListener('load', scheduleReportHeight);
              window.addEventListener('resize', scheduleReportHeight);

              if ('ResizeObserver' in window && root) {
                const resizeObserver = new ResizeObserver(scheduleReportHeight);
                resizeObserver.observe(root);
              }

              if ('MutationObserver' in window && document.documentElement) {
                const mutationObserver = new MutationObserver(scheduleReportHeight);
                mutationObserver.observe(document.documentElement, {
                  subtree: true,
                  childList: true,
                  attributes: true,
                  characterData: true,
                });
              }

              if (document.fonts && 'ready' in document.fonts) {
                document.fonts.ready.then(scheduleReportHeight).catch(() => {});
              }

              [0, 50, 150, 300, 600, 1000].forEach((delay) => {
                window.setTimeout(scheduleReportHeight, delay);
              });
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
            {showModeToggle && onOpenLayoutInNewWindow && layoutMode && (
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
            {showUploadButton && (
              <input
                type="file"
                ref={fileInputRef}
                className="file-input-hidden"
                accept=".json"
                onChange={onUpload}
              />
            )}
            {showThemeToggle && (
              <button
                type="button"
                onClick={toggleTheme}
                className="app-btn live-preview-btn live-preview-theme-btn"
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              >
                {theme === "dark" ? (
                  <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            )}
            {showUploadButton && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="app-btn live-preview-btn"
                aria-label="Load file"
              >
                <img src={Upload} alt="Upload" />
              </button>
            )}
            {showSaveButton && (
              <button
                id="live-save-button"
                type="button"
                onClick={onSave}
                className="app-btn live-preview-btn"
                aria-label="Save file"
              >
                <img src={Save} alt="Save" />
              </button>
            )}
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
