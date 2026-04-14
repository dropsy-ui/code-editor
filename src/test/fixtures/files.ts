type JsonFileValue = Record<string, string>;

export const createJsonFile = (value: JsonFileValue, name: string) => {
  return new File([JSON.stringify(value)], name, { type: "application/json" });
};

export const sandboxStateFixtures = {
  valid: () =>
    createJsonFile(
      { html: "<p>hi</p>", javascript: "alert(1)", css: "body{}" },
      "state.json"
    ),
  partialHtmlOnly: () => createJsonFile({ html: "<h3>Partial</h3>" }, "partial.json"),
  partialNoHtml: () =>
    createJsonFile(
      { javascript: "console.log('x')", css: "body{color:red;}" },
      "partial-no-html.json"
    ),
  empty: () => createJsonFile({}, "empty.json"),
  invalid: () => new File(["not-json"], "bad.json", { type: "application/json" }),
};
