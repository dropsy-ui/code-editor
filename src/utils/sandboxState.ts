export type SandboxState = {
  html: string;
  javascript: string;
  css: string;
};

type SandboxStateSetters = {
  setHtmlCode: (value: string) => void;
  setJsCode: (value: string) => void;
  setCssCode: (value: string) => void;
};

const SANDBOX_FILE_NAME = "sandbox-state.json";

export const applySandboxState = (
  content: Partial<SandboxState>,
  { setHtmlCode, setJsCode, setCssCode }: SandboxStateSetters
) => {
  setCssCode(content.css || "");
  setHtmlCode(content.html || "");
  setJsCode(content.javascript || "");
};

export const loadSandboxStateFromFile = (
  file: File,
  setters: SandboxStateSetters
) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const content = JSON.parse(event.target?.result as string) as Partial<SandboxState>;
      applySandboxState(content, setters);
    } catch (err) {
      console.error("Failed to parse file:", err);
    }
  };
  reader.readAsText(file);
};

export const saveSandboxStateToFile = (state: SandboxState) => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = SANDBOX_FILE_NAME;
  link.click();
  URL.revokeObjectURL(url);
};
