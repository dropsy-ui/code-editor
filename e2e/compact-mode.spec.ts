import { expect, test } from "@playwright/test";

test("compact mode interactions", async ({ page }) => {
  await page.goto("/?demoStandalone=1&layout=compact");

  await expect(page.getByTitle("Live Preview")).toBeVisible();
  await page.getByRole("button", { name: "Show code" }).click();
  await expect(page.locator("#compact-code-drawer")).toBeVisible();

  const compactPreviewHeight = await page
    .locator('iframe[title="Live Preview"]')
    .evaluate((iframe) => iframe.getBoundingClientRect().height);

  expect(compactPreviewHeight).toBeGreaterThan(100);
  expect(compactPreviewHeight).toBeLessThan(210);

  const compactEditorMetrics = await page
    .locator("#compact-code-drawer .monaco-scrollable-element.editor-scrollable")
    .evaluate((el) => {
      const editor = el as HTMLElement;
      const renderedLines = document.querySelector("#compact-code-drawer .view-lines") as HTMLElement | null;

      return {
        viewportHeight: editor.clientHeight,
        renderedLinesHeight: renderedLines ? parseFloat(getComputedStyle(renderedLines).height) : 0,
      };
    });

  expect(compactEditorMetrics.renderedLinesHeight).toBeLessThanOrEqual(
    compactEditorMetrics.viewportHeight + 1,
  );

  await page.getByRole("tab", { name: "JavaScript" }).click();
  await expect(page.getByRole("tab", { name: "JavaScript" })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("button", { name: "Hide code" }).click();
  await expect(page.locator("#compact-code-drawer")).toHaveCount(0);
});

test("theme toggle works in compact mode", async ({ page }) => {
  await page.goto("/?demoStandalone=1&layout=compact");

  const toggleBtn = page.getByRole("button", { name: /Switch to (light|dark) theme/ });
  await expect(toggleBtn).toBeVisible();

  const initialTheme = await page.locator(".app-body").getAttribute("data-theme");

  await toggleBtn.click();

  const toggledTheme = await page.locator(".app-body").getAttribute("data-theme");
  expect(toggledTheme).not.toBe(initialTheme);
  expect(["light", "dark"]).toContain(toggledTheme);
});

test("demo gallery compact preview height stays stable on scroll", async ({ page }) => {
  await page.goto("/");

  const previews = page.locator('iframe[title="Live Preview"]');
  await expect(previews).toHaveCount(3);

  const lastPreview = previews.nth(2);

  for (let i = 0; i < 4; i += 1) {
    await page.mouse.wheel(0, 900);
  }

  await expect(lastPreview).toBeVisible();

  await expect
    .poll(async () => lastPreview.evaluate((iframe) => iframe.getBoundingClientRect().height))
    .toBeGreaterThan(50);

  const heightBeforeExtraScroll = await lastPreview.evaluate((iframe) => iframe.getBoundingClientRect().height);

  for (let i = 0; i < 8; i += 1) {
    await page.mouse.wheel(0, 900);
  }

  await expect
    .poll(async () => lastPreview.evaluate((iframe) => iframe.getBoundingClientRect().height))
    .toBeLessThanOrEqual(heightBeforeExtraScroll + 2);
});
