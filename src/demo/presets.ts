export type DemoPreset = {
  id: string;
  title: string;
  description: string;
  iframeScripts: string[];
  iframeStyles: string[];
  initialHtmlCode: string;
  initialCssCode: string;
  initialJsCode: string;
};

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "baseline",
    title: "Baseline (No External Libraries)",
    description: "Compact-first reference example with no third-party dependencies.",
    iframeScripts: [],
    iframeStyles: [],
    initialHtmlCode: `<main class=\"sandbox\">\n  <h1>Vanilla Demo</h1>\n  <p id=\"status\">Click the button to increment.</p>\n  <button id=\"increment\">Count: <span id=\"count\">0</span></button>\n</main>`,
    initialCssCode: `.sandbox {\n  max-width: 420px;\n  margin: 1rem auto;\n  border: 2px solid #2c4a7a;\n  border-radius: 14px;\n  background: #f8fbff;\n  color: #1e293b;\n  padding: 1rem;\n  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;\n}\n\n#increment {\n  background: #2c4a7a;\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  padding: 0.65rem 0.95rem;\n  cursor: pointer;\n}`,
    initialJsCode: `let count = 0;\nconst countEl = document.getElementById("count");\nconst statusEl = document.getElementById("status");\n\ndocument.getElementById("increment").addEventListener("click", () => {\n  count += 1;\n  countEl.textContent = String(count);\n  statusEl.textContent = \`Count updated to \${count}.\`;\n  console.log("baseline counter", { count });\n});`,
  },
  {
    id: "bootstrap",
    title: "Bootstrap Example",
    description: "Loads Bootstrap CSS and JS bundle into the preview iframe.",
    iframeScripts: [
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
    ],
    iframeStyles: [
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    ],
    initialHtmlCode: `<main class=\"container py-4\">\n  <h1 class=\"h3 mb-3\">Bootstrap Inside Iframe</h1>\n  <p class=\"text-body-secondary\">This preview is styled by Bootstrap loaded via iframeStyles.</p>\n  <div class=\"card shadow-sm\">\n    <div class=\"card-body\">\n      <button id=\"primary\" class=\"btn btn-primary me-2\">Primary</button>\n      <button id=\"outline\" class=\"btn btn-outline-secondary\">Outline</button>\n      <div id=\"result\" class=\"alert alert-info mt-3 mb-0\" role=\"alert\">\n        Waiting for interaction...\n      </div>\n    </div>\n  </div>\n</main>`,
    initialCssCode: `body {\n  background: #eef2f7;\n}`,
    initialJsCode: `const result = document.getElementById("result");\n\ndocument.getElementById("primary").addEventListener("click", () => {\n  result.className = "alert alert-success mt-3 mb-0";\n  result.textContent = "Bootstrap button clicked";\n  console.log("bootstrap primary clicked");\n});\n\ndocument.getElementById("outline").addEventListener("click", () => {\n  result.className = "alert alert-warning mt-3 mb-0";\n  result.textContent = "Bootstrap outline clicked";\n  console.log("bootstrap outline clicked");\n});`,
  },
  {
    id: "tailwind",
    title: "Tailwind Example",
    description: "Loads Tailwind CDN script into the preview iframe and uses utility classes.",
    iframeScripts: [
      "https://cdn.tailwindcss.com",
    ],
    iframeStyles: [],
    initialHtmlCode: `<main class=\"min-h-screen bg-slate-100 p-6\">\n  <section class=\"mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-lg\">\n    <h1 class=\"text-2xl font-bold text-slate-800\">Tailwind in Preview</h1>\n    <p class=\"mt-2 text-slate-600\">Utilities below should style immediately when Tailwind script loads.</p>\n    <div class=\"mt-4 flex gap-2\">\n      <button id=\"tag-a\" class=\"rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white\">Tag A</button>\n      <button id=\"tag-b\" class=\"rounded-full bg-sky-500 px-3 py-1 text-sm font-semibold text-white\">Tag B</button>\n    </div>\n    <p id=\"message\" class=\"mt-4 rounded-lg bg-slate-50 p-3 text-slate-700\">Choose a tag</p>\n  </section>\n</main>`,
    initialCssCode: `/* Tailwind utilities are loaded by script; this file is intentionally minimal. */`,
    initialJsCode: `const message = document.getElementById("message");\n\ndocument.getElementById("tag-a").addEventListener("click", () => {\n  message.textContent = "Selected: Tag A";\n  message.className = "mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-700";\n  console.log("tailwind tag a");\n});\n\ndocument.getElementById("tag-b").addEventListener("click", () => {\n  message.textContent = "Selected: Tag B";\n  message.className = "mt-4 rounded-lg bg-sky-50 p-3 text-sky-700";\n  console.log("tailwind tag b");\n});`,
  },
];
