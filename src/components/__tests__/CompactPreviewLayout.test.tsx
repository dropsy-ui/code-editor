import type { ComponentProps } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CompactPreviewLayout from "../CompactPreviewLayout";
import { CodeEditorStoreProvider } from "../../context/CodeStoreContext";
import { sandboxStateFixtures } from "../../test/fixtures/files";
import { createConsoleErrorSpy } from "../../test/helpers";
import { __getLastLayoutDimensions, __resetMonacoMockState } from "../../test/mocks/monaco";

function renderLayout(props?: Partial<ComponentProps<typeof CompactPreviewLayout>>) {
  const defaultProps: ComponentProps<typeof CompactPreviewLayout> = {
    isCodeVisible: true,
    canShowCode: true,
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

    await user.click(screen.getByRole("tab", { name: "CSS" }));
    expect(onTabChange).toHaveBeenCalledWith("css");
  });

  it("handles invalid JSON upload gracefully", async () => {
    const user = userEvent.setup();
    const spy = createConsoleErrorSpy();

    renderLayout();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = sandboxStateFixtures.invalid();
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

  it("handleChange updates css code when activeTab is css", async () => {
    const user = userEvent.setup();

    renderLayout({ activeTab: "css" });

    const editor = screen.getByTestId("mock-monaco-editor");
    await user.clear(editor);
    await user.type(editor, "main color red;");

    expect((editor as HTMLTextAreaElement).value).toContain("main color red;");
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
    const file = sandboxStateFixtures.valid();
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
    const file = sandboxStateFixtures.empty();
    await user.upload(fileInput, file);

    await waitFor(() => {
      const editor = screen.getByTestId("mock-monaco-editor") as HTMLTextAreaElement;
      expect(editor.value).toBe("");
    });
  });

  it("updates preview height and allows it to shrink on content-height change via postMessage", () => {
    renderLayout();

    const iframe = document.querySelector("iframe") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", { data: { type: "preview-height", height: 360 } })
      );
    });

    expect(iframe).toHaveStyle({ height: "360px" });

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", { data: { type: "preview-height", height: 160 } })
      );
    });

    expect(iframe).toHaveStyle({ height: "160px" });
  });

  it("relayouts with explicit dimensions when container size is available", async () => {
    __resetMonacoMockState();

    const widthSpy = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(640);
    const heightSpy = vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);

    renderLayout();

    await waitFor(() => {
      expect(__getLastLayoutDimensions()).toEqual({ width: 640, height: 300 });
    });

    widthSpy.mockRestore();
    heightSpy.mockRestore();
  });

  it("updates drawer height when active code grows beyond minimum height", async () => {
    const user = userEvent.setup();
    renderLayout({ activeTab: "html" });

    const editor = screen.getByTestId("mock-monaco-editor");
    await user.clear(editor);
    await user.type(editor, "l1{enter}l2{enter}l3{enter}l4{enter}l5{enter}l6");

    await waitFor(() => {
      const drawerEditor = document.querySelector(".compact-code-drawer-editor") as HTMLDivElement;
      expect(drawerEditor.style.height).toBe("132px");
      expect(parseInt(drawerEditor.style.height, 10)).toBeGreaterThan(44);
    });
  });

  it("supports arrow-key navigation across compact editor tabs", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    renderLayout({ onTabChange, activeTab: "html" });

    const htmlTab = screen.getByRole("tab", { name: "HTML" });
    htmlTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(onTabChange).toHaveBeenCalledWith("javascript");
  });
});
