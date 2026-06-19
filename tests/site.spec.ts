import { test, expect } from "@playwright/test";

test.describe("Muhjah Cafe", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/index.html");
  });

  test("RTL document and title", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page).toHaveTitle(/مهجة/);
  });

  test("hero headline and CTAs render", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("مهجة");
    await expect(page.getByRole("link", { name: "اطلب الآن" }).first()).toBeVisible();
  });

  test("Google rating cited", async ({ page }) => {
    await expect(page.locator(".trust")).toContainText("4.7");
    await expect(page.locator(".trust")).toContainText("خرائط قوقل");
  });

  test("all images have alt and load", async ({ page }) => {
    const imgs = page.locator("img");
    const count = await imgs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(imgs.nth(i)).toHaveAttribute("alt", /.+/);
    }
  });

  test("full-screen mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#burger").click();
    const menu = page.locator("#mobileMenu");
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(380);
    await page.locator("#menuClose").click();
    await expect(menu).toBeHidden();
  });

  test("no horizontal scroll at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("order form validates and builds wa.me link", async ({ page }) => {
    await page.locator("#orderSubmit").click();
    await expect(page.locator('.error[data-for="name"]')).toContainText("مطلوب");

    await page.fill("#name", "نورة");
    await page.fill("#phone", "0564689536");
    await page.selectOption("#item", "قهوة باردة");

    const popupPromise = page.waitForEvent("popup");
    await page.locator("#orderSubmit").click();
    await expect(page.locator("#toast")).toBeVisible();
    const popup = await popupPromise;
    expect(popup.url()).toContain("wa.me/966564689536");

    const stored = await page.evaluate(() => localStorage.getItem("muhjah_orders"));
    expect(stored).toContain("نورة");
  });

  test("lightbox opens from gallery", async ({ page }) => {
    await page.locator(".g-item").first().click();
    await expect(page.locator("#lightbox")).toBeVisible();
    await page.locator("#lightboxClose").click();
    await expect(page.locator("#lightbox")).toBeHidden();
  });
});
