import { expect, test } from "@playwright/test";

test("full mode interactions", async ({ page }) => {
  await page.goto("/?demoStandalone=1");

  await expect(page.getByText("HTML")).toBeVisible();
  await expect(page.getByText("JavaScript")).toBeVisible();
  await expect(page.getByText("CSS")).toBeVisible();

  await page.getByRole("button", { name: "Collapse" }).first().click();
  await expect(page.getByRole("button", { name: "Expand" }).first()).toBeVisible();

  const previewFrame = page.getByTitle("Live Preview");
  await expect(previewFrame).toHaveAttribute("srcdoc", /<script type="text\/javascript">/);

  const splitter = page.locator(".splitter");
  const box = await splitter.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + box.height / 2);
    await page.mouse.up();
  }

  await expect(page.locator(".app-editors-col")).toBeVisible();
});
