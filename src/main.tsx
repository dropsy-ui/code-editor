import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import DemoApp from './demo/DemoApp.tsx';
import { DEMO_PRESETS } from './demo/presets';
import './index.scss';

const params = new URLSearchParams(window.location.search);
const isDemoStandalone = params.get('demoStandalone') === '1';
const presetId = params.get('preset');
const preset = presetId ? DEMO_PRESETS.find((item) => item.id === presetId) : undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDemoStandalone ? (
      <App
        layoutModeOverride={(params.get('layout') as 'full' | 'compact' | null) ?? undefined}
        iframeScripts={preset?.iframeScripts ?? []}
        iframeStyles={preset?.iframeStyles ?? []}
        initialHtmlCode={preset?.initialHtmlCode}
        initialCssCode={preset?.initialCssCode}
        initialJsCode={preset?.initialJsCode}
      />
    ) : (
      <DemoApp />
    )}
  </StrictMode>,
)
