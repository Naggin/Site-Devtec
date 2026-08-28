import { chromium } from "playwright";

const URL = "http://localhost:5173";

const browser = await chromium.launch({
  headless: false,
  args: ["--start-maximized", "--window-position=0,0"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const ptToggle = page.getByRole("button", { name: /Mudar para inglês/i }).first();
await ptToggle.scrollIntoViewIfNeeded();
await ptToggle.click();
await page.waitForTimeout(2200);

const enToggle = page.getByRole("button", { name: /Switch to Portuguese/i }).first();
await enToggle.scrollIntoViewIfNeeded();
await enToggle.click();
await page.waitForTimeout(2200);

await browser.close();
