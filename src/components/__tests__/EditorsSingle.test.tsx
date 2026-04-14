import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CodeEditor from "../CodeEditor";
import JavaScriptEditor from "../JavaScriptEditor";
import CSSEditor from "../CSSEditor";
import { renderWithStoreProvider } from "../../test/helpers";

describe("Single editors", () => {
  it("CodeEditor clear and onChange branches", async () => {
    const user = userEvent.setup();
    const onExpand = () => undefined;
    renderWithStoreProvider(<CodeEditor expanded onExpand={onExpand} />);

    const editor = screen.getByLabelText("monaco-html") as HTMLTextAreaElement;
    await user.type(editor, "<h1>Hello</h1>");
    expect(editor.value).toContain("<h1>Hello</h1>");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(editor.value).toBe("");

    await user.type(editor, "__undefined__");
    expect(editor.value).toBe("");
  });

  it("CodeEditor hides content when collapsed", () => {
    renderWithStoreProvider(<CodeEditor expanded={false} onExpand={() => undefined} />);
    expect(screen.queryByTestId("mock-monaco-editor")).toBeNull();
  });

  it("JavaScriptEditor clear and collapsed branches", async () => {
    const user = userEvent.setup();
    const { rerenderWithStoreProvider } = renderWithStoreProvider(
      <JavaScriptEditor expanded onExpand={() => undefined} />
    );

    const editor = screen.getByLabelText("monaco-javascript") as HTMLTextAreaElement;
    await user.type(editor, "console.log('x')");
    expect(editor.value).toContain("console.log('x')");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(editor.value).toBe("");

    await user.type(editor, "__undefined__");
    expect(editor.value).toBe("");

    rerenderWithStoreProvider(<JavaScriptEditor expanded={false} onExpand={() => undefined} />);
    expect(screen.queryByLabelText("monaco-javascript")).toBeNull();
  });

  it("CSSEditor clear and collapsed branches", async () => {
    const user = userEvent.setup();
    const { rerenderWithStoreProvider } = renderWithStoreProvider(
      <CSSEditor expanded onExpand={() => undefined} />
    );

    const editor = screen.getByLabelText("monaco-css") as HTMLTextAreaElement;
    await user.clear(editor);
    await user.paste("body { color: red; }");
    expect(editor.value).toContain("body { color: red; }");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(editor.value).toBe("");

    await user.type(editor, "__undefined__");
    expect(editor.value).toBe("");

    rerenderWithStoreProvider(<CSSEditor expanded={false} onExpand={() => undefined} />);
    expect(screen.queryByLabelText("monaco-css")).toBeNull();
  });
});
