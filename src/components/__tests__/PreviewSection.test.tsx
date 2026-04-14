import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeEditorStoreProvider } from "../../context/CodeStoreContext";
import PreviewSection from "../PreviewSection";
import { sandboxStateFixtures } from "../../test/fixtures/files";
import { createConsoleErrorSpy } from "../../test/helpers";

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
    const file = sandboxStateFixtures.valid();
    await user.upload(fileInput, file);

    await waitFor(() => {
      const iframe = screen.getByTitle("Live Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("<p>hi</p>");
      expect(iframe.srcdoc).toContain("alert(1)");
      expect(iframe.srcdoc).toContain("body{}");
    });
  });

  it("upload with missing fields falls back to empty strings", async () => {
    const user = userEvent.setup();
    renderSection();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = sandboxStateFixtures.partialHtmlOnly();
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
    const file = sandboxStateFixtures.partialNoHtml();
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
    const spy = createConsoleErrorSpy();
    renderSection();

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    const file = sandboxStateFixtures.invalid();
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("Failed to parse file:", expect.anything());
    });
    spy.mockRestore();
  });
});
