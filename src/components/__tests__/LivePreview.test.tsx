import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LivePreview from "../LivePreview";
import { renderWithCodeStore } from "../../test/helpers";
import { createJsonFile } from "../../test/fixtures/files";

describe("LivePreview", () => {
  it("builds srcdoc with html/css/js and external assets", () => {
    renderWithCodeStore(
      <LivePreview
        htmlCode="<h1>Demo</h1>"
        cssCode="h1 { color: red; }"
        jsCode="console.log('x')"
        iframeScripts={["https://cdn.example/script.js"]}
        iframeStyles={["https://cdn.example/style.css"]}
      />
    );

    const iframe = screen.getByTitle("Live Preview") as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain("<h1>Demo</h1>");
    expect(iframe.srcdoc).toContain("h1 { color: red; }");
    expect(iframe.srcdoc).toContain("console.log('x')");
    expect(iframe.srcdoc).toContain("https://cdn.example/script.js");
    expect(iframe.srcdoc).toContain("https://cdn.example/style.css");
  });

  it("shows invalid-HTML error srcdoc when markup is malformed", () => {
    renderWithCodeStore(<LivePreview htmlCode="<b>unclosed" cssCode="" jsCode="" />);

    const iframe = screen.getByTitle("Live Preview") as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain("Invalid HTML provided");
  });

  it("wires save and upload actions", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onUpload = vi.fn();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    renderWithCodeStore(<LivePreview htmlCode="" cssCode="" jsCode="" onSave={onSave} onUpload={onUpload} />);

    await user.click(screen.getByRole("button", { name: "Save file" }));
    expect(onSave).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Load file" }));
    expect(clickSpy).toHaveBeenCalled();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = createJsonFile({}, "demo.json");
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled();
    });

    clickSpy.mockRestore();
  });

  it("handles postMessage events for logs and preview height", () => {
    const onContentHeightChange = vi.fn();
    const addLog = vi.fn();

    renderWithCodeStore(<LivePreview htmlCode="" cssCode="" jsCode="" onContentHeightChange={onContentHeightChange} />, { addLog });

    window.dispatchEvent(new MessageEvent("message", { data: { type: "console", level: "log", message: "ok" } }));
    window.dispatchEvent(new MessageEvent("message", { data: { type: "preview-height", height: 320 } }));

    expect(addLog).toHaveBeenCalledWith("log", "ok");
    expect(onContentHeightChange).toHaveBeenCalledWith(320);
  });

  it("ignores unrecognised postMessage events", () => {
    const onContentHeightChange = vi.fn();
    const addLog = vi.fn();

    renderWithCodeStore(<LivePreview htmlCode="" cssCode="" jsCode="" onContentHeightChange={onContentHeightChange} />, { addLog });

    window.dispatchEvent(new MessageEvent("message", { data: { type: "unknown" } }));
    window.dispatchEvent(new MessageEvent("message", { data: { type: "preview-height", height: "not-a-number" } }));

    expect(addLog).not.toHaveBeenCalled();
    expect(onContentHeightChange).not.toHaveBeenCalled();
  });

  it("renders layout switcher buttons and calls handler", async () => {
    const user = userEvent.setup();
    const onOpenLayoutInNewWindow = vi.fn();

    renderWithCodeStore(
      <LivePreview
        htmlCode=""
        cssCode=""
        jsCode=""
        layoutMode="full"
        onOpenLayoutInNewWindow={onOpenLayoutInNewWindow}
      />
    );

    await user.click(screen.getByRole("button", { name: "Open full layout in new window" }));
    expect(onOpenLayoutInNewWindow).toHaveBeenCalledWith("full");

    await user.click(screen.getByRole("button", { name: "Open compact layout in new window" }));
    expect(onOpenLayoutInNewWindow).toHaveBeenCalledWith("compact");
  });

  it("applies fitContent classes and frameHeight style", () => {
    renderWithCodeStore(
      <LivePreview
        htmlCode=""
        cssCode=""
        jsCode=""
        fitContent
        frameHeight={400}
      />
    );

    expect(document.querySelector(".live-preview-outer--fit-content")).toBeInTheDocument();
    expect(document.querySelector(".live-preview-stage--fit-content")).toBeInTheDocument();
    const iframe = screen.getByTitle("Live Preview") as HTMLIFrameElement;
    expect(iframe).toHaveStyle({ height: "400px" });
    expect(iframe).toHaveClass("live-preview-iframe--fit-content");
  });
});
