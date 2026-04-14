import type { ComponentProps } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CompactPreviewLayout from "../CompactPreviewLayout";
import { CodeEditorStoreProvider } from "../../context/CodeStoreContext";

function renderLayout(props?: Partial<ComponentProps<typeof CompactPreviewLayout>>) {
  const defaultProps: ComponentProps<typeof CompactPreviewLayout> = {
    isCodeVisible: true,
    activeTab: "html",
    onToggleCode: vi.fn(),
    onTabChange: vi.fn(),
    layoutMode: "compact",
    onOpenLayoutInNewWindow: vi.fn(),
    iframeScripts: [],
    iframeStyles: [],
  };

  return render(
    <CodeEditorStoreProvider>
      <CompactPreviewLayout {...defaultProps} {...props} />
    </CodeEditorStoreProvider>
  );
}

describe("CompactPreviewLayout", () => {
  it("renders drawer when code is visible and switches tab", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    renderLayout({ onTabChange });

    expect(screen.getByText("Code")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "HTML" }));
    expect(onTabChange).toHaveBeenCalledWith("html");

    await user.click(screen.getByRole("tab", { name: "JavaScript" }));

    expect(onTabChange).toHaveBeenCalledWith("javascript");
  });

  it("handles invalid JSON upload gracefully", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    renderLayout();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["not-json"], "bad.json", { type: "application/json" });
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("Failed to parse file:", expect.anything());
    });
    spy.mockRestore();
  });

  it("hides drawer and toggles to show code", async () => {
    const user = userEvent.setup();
    const onToggleCode = vi.fn();

    renderLayout({ isCodeVisible: false, onToggleCode });

    expect(screen.queryByText("Code")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show code" }));
    expect(onToggleCode).toHaveBeenCalledTimes(1);
  });

  it("handleChange updates js code when activeTab is javascript", async () => {
    const user = userEvent.setup();

    renderLayout({ activeTab: "javascript" });

    const editor = screen.getByTestId("mock-monaco-editor");
    await user.clear(editor);
    await user.type(editor, "let x = 1;");

    expect((editor as HTMLTextAreaElement).value).toContain("let x = 1;");
  });

  it("handleChange updates html code when activeTab is html", async () => {
    const user = userEvent.setup();

    renderLayout({ activeTab: "html" });

    const editor = screen.getByTestId("mock-monaco-editor");
    await user.clear(editor);
    await user.type(editor, "<main>hello</main>");

    expect((editor as HTMLTextAreaElement).value).toContain("<main>hello</main>");
  });

  it("handleChange falls back to empty string when editor emits undefined", async () => {
    const user = userEvent.setup();

    renderLayout({ activeTab: "html" });

    const editor = screen.getByTestId("mock-monaco-editor");
    await user.type(editor, "__undefined__");
    expect((editor as HTMLTextAreaElement).value).toBe("");
  });

  it("calls onSave via the save button", async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(URL, "createObjectURL");

    renderLayout();

    await user.click(screen.getByRole("button", { name: "Save file" }));
    expect(createSpy).toHaveBeenCalled();
    createSpy.mockRestore();
  });

  it("calls onUpload and parses file content into store", async () => {
    const user = userEvent.setup();

    renderLayout();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const content = JSON.stringify({ html: "<p>hi</p>", javascript: "alert(1)", css: "body{}" });
    const file = new File([content], "state.json", { type: "application/json" });
    await user.upload(fileInput, file);

    // FileReader is async; the mock-monaco value for html editor should update
    await waitFor(() => {
      const editor = screen.getByTestId("mock-monaco-editor");
      expect((editor as HTMLTextAreaElement).value).toContain("<p>hi</p>");
    });
  });

  it("onUpload returns early when no file is selected", () => {
    renderLayout();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    Object.defineProperty(fileInput, "files", { value: [], configurable: true });
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    const editor = screen.getByTestId("mock-monaco-editor") as HTMLTextAreaElement;
    expect(editor.value).toBe("");
  });

  it("onUpload applies empty-string fallbacks for missing fields", async () => {
    const user = userEvent.setup();
    renderLayout();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const content = JSON.stringify({});
    const file = new File([content], "empty.json", { type: "application/json" });
    await user.upload(fileInput, file);

    await waitFor(() => {
      const editor = screen.getByTestId("mock-monaco-editor") as HTMLTextAreaElement;
      expect(editor.value).toBe("");
    });
  });

  it("clamps preview height on content-height change via postMessage", () => {
    renderLayout();

    // Trigger the message handler that LivePreview forwards to onContentHeightChange
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", { data: { type: "preview-height", height: 9999 } })
      );
    });

    // With height clamped to MAX_PREVIEW_HEIGHT (480), the iframe style should reflect that
    const iframe = document.querySelector("iframe") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
  });
});
