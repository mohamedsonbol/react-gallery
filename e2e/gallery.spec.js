import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const fixturePath = "**/data/gallery.json";

test("supports keyboard navigation, visible focus, and accessible gallery controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Every frame tells a story." })).toBeVisible();
  await expect(page.getByRole("img", { name: "Gallery image 1", exact: true })).toBeVisible();

  const loadMore = page.getByRole("button", { name: "Load More" });
  await loadMore.focus();
  await expect(loadMore).toBeFocused();
  await expect(loadMore).toHaveCSS("outline-width", "3px");
  await expect(loadMore).toBeEnabled();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("announces loading, disables Load More, and recovers from a local data failure", async ({ page }) => {
  let attempts = 0;
  await page.route(fixturePath, async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.fulfill({ status: 500, body: "unavailable" });
      return;
    }
    await route.continue();
  });

  await page.goto("/");
  await expect(page.getByRole("status").filter({ hasText: "Loading images..." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Load More" })).toBeDisabled();
  await expect(page.getByRole("alert")).toHaveText("Unable to load images. Please try again.");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("img", { name: /Gallery image/ })).toHaveCount(10);
  expect(attempts).toBe(2);
});

test("loads local fixture pages in bounded 10-image increments", async ({ page }) => {
  let requests = 0;
  await page.route(fixturePath, async (route) => {
    requests += 1;
    await route.continue();
  });

  await page.goto("/");
  await expect(page.getByRole("img", { name: /Gallery image/ })).toHaveCount(10);
  await expect(page.getByRole("img", { name: "Gallery image 1", exact: true })).toHaveAttribute("width", "600");
  await expect(page.getByRole("img", { name: "Gallery image 4", exact: true })).toHaveAttribute("loading", "lazy");

  await page.getByRole("button", { name: "Load More" }).click();
  await expect(page.getByRole("img", { name: /Gallery image/ })).toHaveCount(20);
  expect(requests).toBe(2);
});

test("replaces a failed image with an accessible, dimension-preserving placeholder", async ({ page }) => {
  await page.route("**/images/gallery/**", (route) => route.abort());
  await page.goto("/");

  const placeholder = page.getByRole("img", {
    name: "Image unavailable: Gallery image 1",
    exact: true,
  });
  await expect(placeholder).toBeVisible();
  await expect(placeholder).toHaveText("Image unavailable");
  await expect(placeholder).toHaveCSS("aspect-ratio", "1 / 1");
});

test("does not overflow at the mobile viewport", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: /Gallery image/ })).toHaveCount(10);
  await expect(page.getByRole("button", { name: "Load More" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
