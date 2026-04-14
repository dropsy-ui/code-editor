# CodeEditor

A React-based embeddable code editor with live HTML/CSS/JS preview.

## Features

- Live HTML, CSS, and JavaScript editing
- Real-time preview with console output
- Embeddable as a standalone widget
- JSON import/export of editor state

## Demo (Dev Only)

The local dev entrypoint (`src/main.tsx`) now renders a demo gallery (`src/demo/DemoApp.tsx`) that is **compact-first**:

- All examples start in compact mode.
- Each example has its own toggle to switch between compact and full mode.
- Examples include third-party iframe injection presets (Bootstrap and Tailwind).

This demo shell is **not** the distributed library entry.

- Distributed embed entry: `src/embed.tsx`
- Library build entry: `build.lib.entry` in `vite.config.ts`

## Installation

```sh
npm install @dropsy-ui/code-editor
```

This will generate `dist/code-editor.umd.js`.

## Usage

Add the following to your HTML:

```html
<div id="editor-container"></div>
<script src="node_modules/@dropsy-ui/code-editor/dist/code-editor.umd.js"></script>
<script>
  // Provide scripts and styles for the preview iframe
  const scripts = [
    // Example: "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"
  ];
  const styles = [
    // Example: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
  ];

  // Initialize the embedded editor
  const editor = new CodeEditor('#editor-container', {
    scripts, // Array of JS URLs for the preview iframe
    styles   // Array of CSS URLs for the preview iframe
  });
</script>
```

### Third-Party Library Injection

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

### 3. Editor State Import/Export

- **Export:** Click the Save button to download the current state as a JSON file.
- **Import:** Click the Upload button and select a previously saved JSON file to restore the editor state.

---

For development and contributing, see [CONTRIBUTING.md](CONTRIBUTING.md).
