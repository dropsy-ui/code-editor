import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CodeEditorStoreProvider } from "../CodeStoreContext";
import { useCodeEditorStore } from "../CodeEditorStore";

function StoreHarness() {
  const {
    htmlCode,
    cssCode,
    jsCode,
    logs,
    setHtmlCode,
    setCssCode,
    setJsCode,
    addLog,
    clearLogs,
  } = useCodeEditorStore();

  return (
    <div>
      <div data-testid="html">{htmlCode}</div>
      <div data-testid="css">{cssCode}</div>
      <div data-testid="js">{jsCode}</div>
      <div data-testid="logs">{logs.length}</div>
      <button onClick={() => setHtmlCode("<h1>Hello</h1>")}>set-html</button>
      <button onClick={() => setCssCode("body { color: red; }")}>set-css</button>
      <button onClick={() => setJsCode("console.log('x')")}>set-js</button>
      <button onClick={() => addLog("log", "first")}>add-log</button>
      <button onClick={() => clearLogs()}>clear-logs</button>
    </div>
  );
}

describe("CodeEditorStoreContext", () => {
  it("supports initial code props", () => {
    render(
      <CodeEditorStoreProvider
        initialHtmlCode="<p>seed html</p>"
        initialCssCode="p { color: teal; }"
        initialJsCode="console.log('seed')"
      >
        <StoreHarness />
      </CodeEditorStoreProvider>
    );

    expect(screen.getByTestId("html")).toHaveTextContent("<p>seed html</p>");
    expect(screen.getByTestId("css")).toHaveTextContent("p { color: teal; }");
    expect(screen.getByTestId("js")).toHaveTextContent("console.log('seed')");
  });

  it("initializes and updates all code fields", async () => {
    const user = userEvent.setup();

    render(
      <CodeEditorStoreProvider>
        <StoreHarness />
      </CodeEditorStoreProvider>
    );

    expect(screen.getByTestId("html")).toHaveTextContent("");
    expect(screen.getByTestId("css")).toHaveTextContent("");
    expect(screen.getByTestId("js")).toHaveTextContent("");

    await user.click(screen.getByRole("button", { name: "set-html" }));
    await user.click(screen.getByRole("button", { name: "set-css" }));
    await user.click(screen.getByRole("button", { name: "set-js" }));

    expect(screen.getByTestId("html")).toHaveTextContent("<h1>Hello</h1>");
    expect(screen.getByTestId("css")).toHaveTextContent("body { color: red; }");
    expect(screen.getByTestId("js")).toHaveTextContent("console.log('x')");
  });

  it("adds and clears logs", async () => {
    const user = userEvent.setup();

    render(
      <CodeEditorStoreProvider>
        <StoreHarness />
      </CodeEditorStoreProvider>
    );

    expect(screen.getByTestId("logs")).toHaveTextContent("0");

    await user.click(screen.getByRole("button", { name: "add-log" }));
    await user.click(screen.getByRole("button", { name: "add-log" }));

    expect(screen.getByTestId("logs")).toHaveTextContent("2");

    await user.click(screen.getByRole("button", { name: "clear-logs" }));
    expect(screen.getByTestId("logs")).toHaveTextContent("0");
  });

});
