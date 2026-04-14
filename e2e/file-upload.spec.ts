import { expect, test } from "@playwright/test";
import path from "node:path";

test("uploads demo data and populates preview", async ({ page }) => {
  await page.goto("/?demoStandalone=1");

  const filePath = path.resolve(process.cwd(), "src/test/mock-data/demo.json");
  const input = page.locator("input[type='file']");
  await input.setInputFiles(filePath);

  const previewFrame = page.getByTitle("Live Preview");
  await expect(previewFrame).toHaveAttribute("srcdoc", /Interactive Counter Demo/);
});
