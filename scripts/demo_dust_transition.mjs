import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const URL = "http://localhost:5173";
const OUT_DIR = "/tmp/dust-demo-video";
const ARTIFACT = "/opt/cursor/artifacts/demo_transicao_thanos_areia.mp4";

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(path.dirname(ARTIFACT), { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: OUT_DIR, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const ptToggle = page.getByRole("button", { name: /Mudar para inglês/i }).first();
await ptToggle.scrollIntoViewIfNeeded();
await ptToggle.click();
await page.waitForTimeout(2400);

const enToggle = page.getByRole("button", { name: /Switch to Portuguese/i }).first();
await enToggle.scrollIntoViewIfNeeded();
await enToggle.click();
await page.waitForTimeout(2400);

await context.close();
await browser.close();

const webm = readdirSync(OUT_DIR).find((f) => f.endsWith(".webm"));
if (!webm) throw new Error("Playwright did not produce a video file");

execSync(
  `ffmpeg -y -i "${path.join(OUT_DIR, webm)}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart /tmp/demo_transicao_thanos_areia.mp4`,
  { stdio: "inherit" },
);
execSync(`cp /tmp/demo_transicao_thanos_areia.mp4 "${ARTIFACT}"`);

console.log(`Saved demo to ${ARTIFACT}`);
