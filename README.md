# CodeEditor

A React-based embeddable code editor with live HTML/CSS/JS preview.

## Features

- Live HTML, CSS, and JavaScript editing
- Real-time preview with console output
- Embeddable as a standalone widget
- JSON import/export of editor state

## Installation

```sh
npm install @dropsy-ui/code-editor
```

## Usage

Use the UMD bundle in a browser page:

```html
<div id="editor-container"></div>
<script src="node_modules/@dropsy-ui/code-editor/dist/code-editor.umd.js"></script>
<script>
  const scripts = [];
  const styles = [];

  const editor = new CodeEditor('#editor-container', {
    scripts,
    styles
  });
</script>
```

### Third-Party Injection

You can pass external URLs through `scripts` and `styles` to load libraries inside the preview iframe.

```html
<script>
  const editor = new CodeEditor('#editor-container', {
    scripts: [
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
      'https://cdn.tailwindcss.com'
    ],
    styles: [
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
    ]
  });
</script>
```

### Editor State Import/Export

- Export: Click Save to download the current editor state as JSON.
- Import: Click Upload and select a previously saved JSON file.

## Theming

CodeEditor exposes consumer-facing CSS custom properties prefixed with `--code-editor-`.
Override them in your app's `:root` (or a container selector) to theme the editor.

```css
:root {
  --code-editor-color-bg: #101317;
  --code-editor-color-surface-muted: #161b24;
  --code-editor-color-text: #e5e7eb;
  --code-editor-radius-lg: 1rem;
  --code-editor-font-family-base: "IBM Plex Sans", sans-serif;
  --code-editor-font-size-title: 0.8rem;
  --code-editor-shadow-panel: 0 10px 28px rgba(0, 0, 0, 0.24);
}
```

Token groups currently supported:

- Colors: surfaces, text, focus, preview background, editor background, button/console states
- Gradients: panel, header, button, active tabs, splitter, console, preview stage
- Radii: xs, sm, md, lg, full
- Typography: base/mono families, font scale, weights, semantic aliases (title, label, button)
- Shadows: panel, elevated panel, inset, header, focus ring, splitter focus
- Spacing: 2xs through xl
- Border widths: shared border width token
- Scrollbar: size, track, thumb, hover, radius

Notes:

- This applies to library styles in `src/App.scss`, `src/components/*.scss`, and `src/splitter.scss`.
- Demo-only styles in `src/demo/**` are excluded.
- Motion/easing tokens are not included in this pass.

## Development Demo

In development, `src/main.tsx` renders `src/demo/DemoApp.tsx` (compact-first examples).

Distributed library entrypoint: `src/embed.tsx`.

---

For development and contributing, see [CONTRIBUTING.md](CONTRIBUTING.md).
