import { useMemo, useState } from "react";
import App from "../App";
import type { CodeEditorOptions } from "../embed";
import type { DemoPreset } from "./presets";
import { DEMO_PRESETS } from "./presets";
import "./DemoApp.scss";

type DemoFilter = "all" | DemoPreset["id"];

const FILTERS: Array<{ id: DemoFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "baseline", label: "Baseline" },
  { id: "bootstrap", label: "Bootstrap" },
  { id: "tailwind", label: "Tailwind" },
  { id: "visibility-controls", label: "Visibility" },
  { id: "localized-messages", label: "Localization" },
];

const DEFAULT_VISIBILITY_OPTIONS: Required<Pick<CodeEditorOptions,
  "showModeToggle" |
  "showThemeToggle" |
  "showSaveButton" |
  "showUploadButton" |
  "showCode" |
  "showHtmlEditor" |
  "showJavaScriptEditor" |
  "showCssEditor"
>> = {
  showModeToggle: true,
  showThemeToggle: true,
  showSaveButton: true,
  showUploadButton: true,
  showCode: true,
  showHtmlEditor: true,
  showJavaScriptEditor: true,
  showCssEditor: true,
};

const VISIBILITY_TOGGLE_FIELDS: Array<{ key: keyof typeof DEFAULT_VISIBILITY_OPTIONS; label: string }> = [
  { key: "showModeToggle", label: "Mode toggle" },
  { key: "showThemeToggle", label: "Theme toggle" },
  { key: "showSaveButton", label: "Save button" },
  { key: "showUploadButton", label: "Upload button" },
  { key: "showCode", label: "Show code" },
  { key: "showHtmlEditor", label: "HTML editor" },
  { key: "showJavaScriptEditor", label: "JavaScript editor" },
  { key: "showCssEditor", label: "CSS editor" },
];

function DemoCard({ preset }: { preset: DemoPreset }) {
  const [layoutMode, setLayoutMode] = useState<"compact" | "full">("compact");
  const [visibilityOptions, setVisibilityOptions] = useState(DEFAULT_VISIBILITY_OPTIONS);
  const isVisibilityDemo = preset.id === "visibility-controls";
  const appOptions = useMemo(() => {
    return isVisibilityDemo ? visibilityOptions : {};
  }, [isVisibilityDemo, visibilityOptions]);

  return (
    <article className="demo-card">
      <header className="demo-card__header">
        <div>
          <h2 className="demo-card__title">{preset.title}</h2>
          <p className="demo-card__description">{preset.description}</p>
        </div>
        <div>
          <div className="demo-card__mode">Mode: {layoutMode}</div>
          <button
            type="button"
            className="app-btn app-btn--text"
            onClick={() => setLayoutMode((current) => (current === "compact" ? "full" : "compact"))}
          >
            {layoutMode === "compact" ? "Switch to Full" : "Switch to Compact"}
          </button>
        </div>
      </header>

      <section className="demo-card__links">
        <div>
          <strong>iframeStyles</strong>
          <ul>
            {preset.iframeStyles.length === 0 ? (
              <li>None</li>
            ) : (
              preset.iframeStyles.map((href) => <li key={href}>{href}</li>)
            )}
          </ul>
        </div>
        <div>
          <strong>iframeScripts</strong>
          <ul>
            {preset.iframeScripts.length === 0 ? (
              <li>None</li>
            ) : (
              preset.iframeScripts.map((src) => <li key={src}>{src}</li>)
            )}
          </ul>
        </div>
      </section>

      {isVisibilityDemo && (
        <section className="demo-card__controls" aria-label="Visibility controls demo options">
          {VISIBILITY_TOGGLE_FIELDS.map(({ key, label }) => (
            <label key={key} className="demo-card__control-toggle">
              <input
                type="checkbox"
                checked={visibilityOptions[key]}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setVisibilityOptions((current) => ({
                    ...current,
                    [key]: checked,
                  }));
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </section>
      )}

      <div className={`demo-card__app demo-card__app--${layoutMode}`}>
        <App
          layoutModeOverride={layoutMode}
          newWindowParams={{
            demoStandalone: "1",
            preset: preset.id,
          }}
          iframeScripts={preset.iframeScripts}
          iframeStyles={preset.iframeStyles}
          initialHtmlCode={preset.initialHtmlCode}
          initialCssCode={preset.initialCssCode}
          initialJsCode={preset.initialJsCode}
          {...preset.appOptions}
          {...appOptions}
        />
      </div>
    </article>
  );
}

export default function DemoApp() {
  const [activeFilter, setActiveFilter] = useState<DemoFilter>("all");
  const visiblePresets = DEMO_PRESETS.filter((preset) => {
    return activeFilter === "all" || preset.id === activeFilter;
  });

  return (
    <main className="demo-page">
      <header className="demo-page__header">
        <h1 className="demo-page__title">CodeEditor Demo Gallery</h1>
        <p className="demo-page__subtitle">
          Every example starts in compact mode to match the primary embedding use-case. Use
          each card toggle to switch that specific example into full mode.
        </p>
        <div className="demo-page__filters" role="group" aria-label="Filter examples">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`app-btn app-btn--text demo-page__filter-btn${activeFilter === filter.id ? " is-active" : ""}`}
              aria-pressed={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <section className="demo-grid">
        {visiblePresets.map((preset) => (
          <DemoCard key={preset.id} preset={preset} />
        ))}
      </section>
    </main>
  );
}
