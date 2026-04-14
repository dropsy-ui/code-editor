import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeEditorStoreProvider } from "../../context/CodeStoreContext";
import PreviewSection from "../PreviewSection";

function renderSection() {
  return render(
    <CodeEditorStoreProvider>
      <PreviewSection
        layoutMode="full"
        onOpenLayoutInNewWindow={vi.fn()}
      />
    </CodeEditorStoreProvider>
  );
}

describe("PreviewSection", () => {
  it("renders Live Preview and Console panels", () => {
    renderSection();

    expect(screen.getByTitle("Live Preview")).toBeInTheDocument();
    expect(screen.getByText("Console")).toBeInTheDocument();
  });

  it("save triggers URL.createObjectURL", async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(URL, "createObjectURL");
    renderSection();

    await user.click(screen.getByRole("button", { name: "Save file" }));
    expect(createSpy).toHaveBeenCalled();
    createSpy.mockRestore();
  });

  it("upload with no file does nothing", () => {
    renderSection();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    Object.defineProperty(fileInput, "files", { value: [], configurable: true });
    const event = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(event);

    expect(screen.queryByText(/>/)).not.toBeInTheDocument();
  });

  it("upload parses valid JSON and updates iframe srcdoc", async () => {
    const user = userEvent.setup();
    renderSection();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const content = JSON.stringify({ html: "<h2>Loaded</h2>", javascript: "var x=1;", css: "h2{}" });
    const file = new File([content], "state.json", { type: "application/json" });
    await user.upload(fileInput, file);

    await waitFor(() => {
      const iframe = screen.getByTitle("Live Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("<h2>Loaded</h2>");
      expect(iframe.srcdoc).toContain("var x=1;");
      expect(iframe.srcdoc).toContain("h2{}");
    });
  });

  it("upload with missing fields falls back to empty strings", async () => {
    const user = userEvent.setup();
    renderSection();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const content = JSON.stringify({ html: "<h3>Partial</h3>" });
    const file = new File([content], "partial.json", { type: "application/json" });
    await user.upload(fileInput, file);

    await waitFor(() => {
      const iframe = screen.getByTitle("Live Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("<h3>Partial</h3>");
      expect(iframe.srcdoc).toContain("<style>\n            \n          </style>");
    });
  });

  it("upload with missing html falls back to empty html string", async () => {
    const user = userEvent.setup();
    renderSection();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const content = JSON.stringify({ javascript: "console.log('x')", css: "body{color:red;}" });
    const file = new File([content], "partial-no-html.json", { type: "application/json" });
    await user.upload(fileInput, file);

    await waitFor(() => {
      const iframe = screen.getByTitle("Live Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).not.toContain("<h3>Partial</h3>");
      expect(iframe.srcdoc).toContain("console.log('x')");
      expect(iframe.srcdoc).toContain("body{color:red;}");
    });
  });

  it("upload handles invalid JSON gracefully", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderSection();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["not-json"], "bad.json", { type: "application/json" });
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("Failed to parse file:", expect.anything());
    });
    spy.mockRestore();
  });
});
