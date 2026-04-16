# Theming

CodeEditor exposes a set of CSS custom properties prefixed with `--code-editor-`.
Override them in your app's `:root` (or any ancestor/container selector) to restyle the editor without touching library source.

```css
:root {
  --code-editor-color-bg: #101317;
  --code-editor-font-family-base: "IBM Plex Sans", sans-serif;
  --code-editor-radius-md: 1rem;
  --code-editor-shadow-panel: 0 10px 28px rgba(0, 0, 0, 0.24);
}
```

Per-instance overrides are also supported — scope the selector to a wrapper element:

```css
.my-editor-wrapper {
  --code-editor-color-bg: #fefefe;
  --code-editor-color-text: #111827;
}
```

---

## Token reference

### Colors

| Variable | Dark default | Light default | Description |
|---|---|---|---|
| `--code-editor-color-bg` | `#131417` | `#f1f5f9` | Main panel background |
| `--code-editor-color-surface-muted` | `#181b21` | `#f8fafc` | Slightly elevated surface (headers, footers) |
| `--code-editor-color-border` | `#3a404c` | `#cbd5e1` | Primary border colour |
| `--code-editor-color-border-subtle` | `#282d36` | `#e2e8f0` | Subtle divider / low-contrast border |
| `--code-editor-color-text` | `#f3f4f6` | `#0f172a` | Primary text |
| `--code-editor-color-preview-bg` | `#f8fafc` | `#ffffff` | Background behind the live-preview iframe |
| `--code-editor-color-focus` | `#60a5fa` | `#2563eb` | Focus rings and active indicators |
| `--code-editor-color-editor-bg` | `#1e1e1e` | `#ffffff` | Monaco editor canvas background |
| `--code-editor-color-button-hover` | `#353d4b` | `#e2e8f0` | Toolbar button hover fill |
| `--code-editor-color-button-active` | `#40495a` | `#cbd5e1` | Toolbar button pressed/active fill |
| `--code-editor-color-button-hover-border` | `#505868` | `#94a3b8` | Toolbar button hover border |

### Gradients

| Variable | Dark default | Light default | Description |
|---|---|---|---|
| `--code-editor-gradient-panel` | dark slate blend | light slate blend | Main panel background gradient |
| `--code-editor-gradient-header` | dark header blend | light header blend | Editor-header bar gradient |
| `--code-editor-gradient-button` | dark button fill | light button fill | Toolbar button gradient |
| `--code-editor-gradient-active-tab` | navy blue blend | sky blue blend | Active language-tab highlight |
| `--code-editor-gradient-splitter` | grey blend | slate blend | Splitter handle default |
| `--code-editor-gradient-splitter-hover` | sky-blue blend | blue blend | Splitter handle on hover/focus |
| `--code-editor-gradient-console` | near-black blend | near-white blend | Console panel background |
| `--code-editor-gradient-preview-stage` | dark stage blend | light stage blend | Preview-stage wrapper background |

> Gradients are verbose `linear-gradient()` values — override with any CSS gradient or a solid `background-color`.

### Shadows

These are overridden in light mode (lighter, lower-opacity shadows).

| Variable | Dark default | Light default | Description |
|---|---|---|---|
| `--code-editor-shadow-panel` | `0 12px 24px rgba(0,0,0,0.18)` | `0 12px 24px rgba(0,0,0,0.06)` | Default panel drop-shadow |
| `--code-editor-shadow-panel-elevated` | `0 14px 30px rgba(0,0,0,0.18)` | `0 14px 30px rgba(0,0,0,0.06)` | Elevated/floating panel shadow |
| `--code-editor-shadow-inset-soft` | `inset 0 1px 0 rgba(255,255,255,0.04)` | `inset 0 1px 0 rgba(0,0,0,0.04)` | Soft inner top highlight |
| `--code-editor-shadow-inset-subtle` | `inset 0 1px 0 rgba(255,255,255,0.03)` | `inset 0 1px 0 rgba(0,0,0,0.03)` | Subtler inner top highlight |
| `--code-editor-shadow-header` | dark inset combo | light inset combo | Header bar inset border simulation |
| `--code-editor-shadow-focus-ring` | `0 0 0 3px rgba(96,165,250,0.2)` | `0 0 0 3px rgba(37,99,235,0.2)` | Keyboard-focus ring |
| `--code-editor-shadow-splitter-focus` | `0 0 0 3px rgba(96,165,250,0.16)` | `0 0 0 3px rgba(37,99,235,0.2)` | Splitter keyboard-focus ring |

### Console

| Variable | Dark default | Light default | Description |
|---|---|---|---|
| `--code-editor-color-console-text` | `#d1d5db` | `#1e293b` | Default log text colour |
| `--code-editor-color-console-log-bg` | `rgba(24,27,33,0.9)` | `rgba(248,250,252,0.9)` | Log-entry row background |
| `--code-editor-color-console-log-border` | `rgba(58,64,76,0.55)` | `rgba(203,213,225,0.55)` | Log-entry row border |
| `--code-editor-color-console-error-text` | `#fecaca` | `#7f1d1d` | Error-entry text |
| `--code-editor-color-console-error-bg` | `rgba(69,20,27,0.62)` | `rgba(254,226,226,0.62)` | Error-entry row background |
| `--code-editor-color-console-error-border` | `rgba(248,113,113,0.34)` | `rgba(248,113,113,0.5)` | Error-entry row border |

### Scrollbar colors

| Variable | Dark default | Light default | Description |
|---|---|---|---|
| `--code-editor-scrollbar-track-bg` | `rgba(255,255,255,0.04)` | `rgba(0,0,0,0.04)` | Scrollbar track background |
| `--code-editor-scrollbar-thumb-bg` | `rgba(156,163,175,0.35)` | `rgba(100,116,139,0.35)` | Scrollbar thumb fill |
| `--code-editor-scrollbar-thumb-hover-bg` | `rgba(156,163,175,0.55)` | `rgba(100,116,139,0.55)` | Scrollbar thumb fill on hover |

---

### Radii

Theme-invariant — same value in dark and light mode.

| Variable | Value | Description |
|---|---|---|
| `--code-editor-radius-xs` | `0.55rem` | Extra-small radius (chips, tags) |
| `--code-editor-radius-sm` | `0.65rem` | Small radius (buttons, inputs) |
| `--code-editor-radius-md` | `0.9rem` | Medium radius (panels, cards) |
| `--code-editor-radius-lg` | `0.75rem` | Large radius (outer shell) |
| `--code-editor-radius-full` | `999px` | Pill shape |

### Typography

#### Font families

| Variable | Default | Description |
|---|---|---|
| `--code-editor-font-family-base` | `"InterVariable", sans-serif` | UI text (labels, buttons, tabs) |
| `--code-editor-font-family-mono` | system monospace stack | Monospace fallback (not Monaco canvas) |

#### Font-size scale

| Variable | Default | Description |
|---|---|---|
| `--code-editor-font-size-xs` | `0.72rem` | Smallest label |
| `--code-editor-font-size-sm` | `0.74rem` | Small label / tab title |
| `--code-editor-font-size-base` | `0.78rem` | Body / default label |
| `--code-editor-font-size-console` | `0.83rem` | Console output |
| `--code-editor-font-size-lg` | `1rem` | Large heading |

#### Font-weight scale

| Variable | Default |
|---|---|
| `--code-editor-font-weight-regular` | `400` |
| `--code-editor-font-weight-medium` | `500` |
| `--code-editor-font-weight-semibold` | `600` |
| `--code-editor-font-weight-bold` | `700` |

#### Semantic typography aliases

These map component roles to scale values. Override these to re-style a component class without changing the global scale.

| Variable | Default (mapped to) |
|---|---|
| `--code-editor-font-size-title` | `var(--code-editor-font-size-sm)` |
| `--code-editor-font-size-label` | `var(--code-editor-font-size-base)` |
| `--code-editor-font-size-button` | `var(--code-editor-font-size-xs)` |
| `--code-editor-font-weight-title` | `var(--code-editor-font-weight-bold)` |
| `--code-editor-font-weight-label` | `var(--code-editor-font-weight-semibold)` |
| `--code-editor-font-weight-button` | `var(--code-editor-font-weight-bold)` |

### Spacing

| Variable | Default | Description |
|---|---|---|
| `--code-editor-spacing-2xs` | `0.25rem` | Tightest gap |
| `--code-editor-spacing-xs` | `0.4rem` | Extra-small gap |
| `--code-editor-spacing-sm` | `0.5rem` | Small gap |
| `--code-editor-spacing-md` | `0.55rem` | Medium gap |
| `--code-editor-spacing-lg` | `0.75rem` | Large gap |
| `--code-editor-spacing-xl` | `0.9rem` | Extra-large gap |

### Border

| Variable | Default | Description |
|---|---|---|
| `--code-editor-border-width` | `1px` | Shared border width |

### Scrollbar structure

| Variable | Default | Description |
|---|---|---|
| `--code-editor-scrollbar-size` | `0.65rem` | Scrollbar track width/height |
| `--code-editor-scrollbar-radius` | `var(--code-editor-radius-full)` | Scrollbar thumb border-radius |

---

## Source files

Tokens are declared in:

- `src/App.scss` — root variable blocks and shared layout
- `src/components/*.scss` — component-level usage
- `src/splitter.scss` — splitter-specific usage

Demo-only styles (`src/demo/**`) are excluded and not part of the public theming surface.
