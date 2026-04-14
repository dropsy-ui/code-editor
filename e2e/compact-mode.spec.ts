import { expect, test } from "@playwright/test";

test("compact mode interactions", async ({ page }) => {
  await page.goto("/?demoStandalone=1&layout=compact");

  await expect(page.getByTitle("Live Preview")).toBeVisible();
  await page.getByRole("button", { name: "Show code" }).click();
  await expect(page.locator("#compact-code-drawer")).toBeVisible();

  await page.getByRole("tab", { name: "JavaScript" }).click();
  await expect(page.getByRole("tab", { name: "JavaScript" })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("button", { name: "Hide code" }).click();
  await expect(page.locator("#compact-code-drawer")).toHaveCount(0);
});
