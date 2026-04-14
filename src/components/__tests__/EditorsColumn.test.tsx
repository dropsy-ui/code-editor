import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeEditorStoreProvider } from "../../context/CodeStoreContext";
import EditorsColumn from "../EditorsColumn";

describe("EditorsColumn", () => {
  it("renders all three editor headers", () => {
    render(
      <CodeEditorStoreProvider>
        <EditorsColumn expanded={{ html: true, js: true, css: true }} setExpanded={vi.fn()} />
      </CodeEditorStoreProvider>
    );

    expect(screen.getByText("HTML")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("CSS")).toBeInTheDocument();
  });

  it("applies collapsed style when an editor is collapsed", () => {
    render(
      <CodeEditorStoreProvider>
        <EditorsColumn expanded={{ html: false, js: true, css: true }} setExpanded={vi.fn()} />
      </CodeEditorStoreProvider>
    );

    const sections = document.querySelectorAll(".editor-section");
    expect(sections.length).toBe(3);
    expect((sections[0] as HTMLDivElement).style.maxHeight).toBe("40px");
  });

  it("calls setExpanded via onExpand callback", async () => {
    const user = userEvent.setup();
    const setExpanded = vi.fn();

    render(
      <CodeEditorStoreProvider>
        <EditorsColumn expanded={{ html: true, js: true, css: true }} setExpanded={setExpanded} />
      </CodeEditorStoreProvider>
    );

    // First collapse button belongs to HTML header
    await user.click(screen.getAllByRole("button", { name: "Collapse" })[0]);
    expect(setExpanded).toHaveBeenCalled();
    const updater = setExpanded.mock.calls[0][0] as (s: { html: boolean; js: boolean; css: boolean }) => {
      html: boolean;
      js: boolean;
      css: boolean;
    };
    expect(updater({ html: true, js: true, css: true })).toEqual({ html: false, js: true, css: true });

    await user.click(screen.getAllByRole("button", { name: "Collapse" })[1]);
    const jsUpdater = setExpanded.mock.calls[1][0] as (s: { html: boolean; js: boolean; css: boolean }) => {
      html: boolean;
      js: boolean;
      css: boolean;
    };
    expect(jsUpdater({ html: true, js: true, css: true })).toEqual({ html: true, js: false, css: true });

    await user.click(screen.getAllByRole("button", { name: "Collapse" })[2]);
    const cssUpdater = setExpanded.mock.calls[2][0] as (s: { html: boolean; js: boolean; css: boolean }) => {
      html: boolean;
      js: boolean;
      css: boolean;
    };
    expect(cssUpdater({ html: true, js: true, css: true })).toEqual({ html: true, js: true, css: false });
  });

  it("uses 0% flex basis when all editors are collapsed", () => {
    render(
      <CodeEditorStoreProvider>
        <EditorsColumn expanded={{ html: false, js: false, css: false }} setExpanded={vi.fn()} />
      </CodeEditorStoreProvider>
    );

    const sections = document.querySelectorAll(".editor-section");
    expect((sections[0] as HTMLDivElement).style.maxHeight).toBe("40px");
    expect((sections[1] as HTMLDivElement).style.maxHeight).toBe("40px");
    expect((sections[2] as HTMLDivElement).style.maxHeight).toBe("40px");
  });
});
