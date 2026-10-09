import { expect, test } from "@playwright/test";

const photosForPage = (page) =>
  Array.from({ length: 1000 }, (_, index) => {
    const albumId = page * 20 + Math.floor(index / 50) + 1;
    return {
      id: page * 1000 + index + 1,
      albumId,
      title: `Album ${albumId} photo`,
      url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'/%3E",
    };
  });

const mockPhotos = async (page) => {
  await page.route("**/photos?*", async (route) => {
    const start = Number(new URL(route.request().url()).searchParams.get("_start"));
    await route.fulfill({ json: photosForPage(start / 1000) });
  });
};

test("renders the gallery and loads a bounded next page on Load More", async ({ page }) => {
  await mockPhotos(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Image Gallery App" })).toBeVisible();
  await expect(page.getByRole("img")).toHaveCount(10);
  await expect(page.getByRole("img").nth(0)).toHaveAttribute("width", "600");
  await expect(page.getByRole("img").nth(3)).toHaveAttribute("loading", "lazy");

  await page.getByRole("button", { name: "Load More" }).click();
  await expect(page.getByRole("img")).toHaveCount(20);
});

test("announces failures and retries", async ({ page }) => {
  let attempts = 0;
  await page.route("**/photos?*", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 500, body: "unavailable" });
      return;
    }
    await route.fulfill({ json: photosForPage(0) });
  });

  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Unable to load images");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("img")).toHaveCount(10);
  expect(attempts).toBe(2);
});

test("keeps the gallery usable at a mobile viewport", async ({ page }) => {
  await mockPhotos(page);
  await page.goto("/");
  await expect(page.getByRole("img")).toHaveCount(10);
  await expect(page.getByRole("button", { name: "Load More" })).toBeVisible();
});
