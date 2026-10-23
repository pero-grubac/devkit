// Smoke tests for the shell: palette, hash routes, persistence, layout, offline.
import { test, expect } from "@playwright/test";

const SHA256_ABC = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.errors = errors;
  page.allowedErrors = null;
  // Keep runs hermetic: no web fonts from Google.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }));
});

test.afterEach(async ({ page }) => {
  const errors = page.allowedErrors
    ? page.errors.filter((e) => !page.allowedErrors.test(e))
    : page.errors;
  expect(errors, "no JavaScript errors").toEqual([]);
});

const title = (page) => page.locator("header span").first();
const palette = (page) => page.getByRole("dialog", { name: "Command palette" });
const search = (page) => page.getByRole("combobox", { name: /search tools/i });
const selected = (page) => page.getByRole("option", { selected: true });

test("command palette finds and opens tools from keyboard and button", async ({ page }) => {
  await page.goto("./");
  await expect(title(page)).toHaveText("JSON");

  await page.keyboard.press("Control+K");
  await expect(palette(page)).toBeVisible();
  await expect(search(page)).toBeFocused();
  await search(page).fill("sha");
  await expect(selected(page)).toContainText("Hash");
  await page.keyboard.press("Enter");
  await expect(palette(page)).toBeHidden();
  await expect(page).toHaveURL(/#\/hash$/);
  await expect(title(page)).toHaveText("Hash");

  // The top-bar button opens it too; arrows move, Escape closes.
  await page.getByRole("button", { name: /search tools/i }).click();
  await search(page).fill("cidr");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await expect(selected(page)).toContainText("IP / CIDR");
  await page.keyboard.press("Tab");
  await expect(search(page)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(palette(page)).toBeHidden();
  await expect(page).toHaveURL(/#\/hash$/);

  // "/" opens it when not typing.
  await page.keyboard.press("/");
  await search(page).fill("proto");
  await page.getByRole("option", { name: /Proto Gen/ }).click();
  await expect(page).toHaveURL(/#\/proto$/);
});

test("palette searches saved snippets", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("devkit:snippets", JSON.stringify([{
      id: "s1", title: "Nightly backup", content: "0 2 * * *",
      toolId: "cron", toolLabel: "Cron", createdAt: Date.now(),
    }]));
  });
  await page.goto("./");
  await page.keyboard.press("Control+K");
  await search(page).fill("nightly");
  await expect(selected(page)).toContainText("Nightly backup");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#\/cron$/);
  await expect(title(page)).toHaveText("Cron");
});

test("deep links, back/forward and unknown routes", async ({ page }) => {
  await page.goto("./#/jwt");
  await expect(title(page)).toHaveText("JWT");
  await expect(page).toHaveTitle("JWT · DevKit");

  await page.keyboard.press("Control+K");
  await search(page).fill("regex");
  await page.keyboard.press("Enter");
  await expect(title(page)).toHaveText("Regex");

  await page.goBack();
  await expect(page).toHaveURL(/#\/jwt$/);
  await expect(title(page)).toHaveText("JWT");
  await page.goForward();
  await expect(title(page)).toHaveText("Regex");

  await page.goto("./#/does-not-exist");
  await expect(title(page)).toHaveText("JSON");
  await expect(page).toHaveURL(/#\/json$/);
});

test("JSON and Hash tools produce output", async ({ page }) => {
  await page.goto("./#/json");
  await page.locator("textarea").first().fill('{"b":1,"a":[true,null]}');
  await expect(page.locator("pre").first()).toContainText('"b": 1');

  await page.goto("./#/hash");
  await page.getByPlaceholder("Enter text to hash...").fill("abc");
  await expect(page.getByText(SHA256_ABC)).toBeVisible();
});

test("inputs persist across reloads until cleared", async ({ page }) => {
  await page.goto("./#/hash");
  const input = page.getByPlaceholder("Enter text to hash...");
  await input.fill("remember me");
  await page.reload();
  await expect(input).toHaveValue("remember me");

  await page.keyboard.press("Control+K");
  await search(page).fill("clear saved");
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("");
  await page.reload();
  await expect(input).toHaveValue("");
});

test("layout fits the viewport", async ({ page, isMobile }) => {
  await page.goto("./#/ip");
  await expect(title(page)).toHaveText("IP / CIDR");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  const rail = await page.locator("aside").boundingBox();
  if (isMobile) expect(rail.width).toBeLessThan(60);
  else expect(rail.width).toBeGreaterThan(200);

  await page.getByRole("button", { name: /search tools/i }).click();
  const box = await palette(page).boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
});

test.describe("offline", () => {
  test.use({ serviceWorkers: "allow" });

  test("works offline once the service worker is installed", async ({ page, context }) => {
    page.allowedErrors = /ERR_INTERNET_DISCONNECTED|Failed to load resource/;
    await page.goto("./");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise((r) => navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }));
      }
    });
    await context.setOffline(true);
    await page.goto("./#/hash");
    await expect(title(page)).toHaveText("Hash");
    await page.getByPlaceholder("Enter text to hash...").fill("abc");
    await expect(page.getByText(SHA256_ABC)).toBeVisible();
    await context.setOffline(false);
  });
});
