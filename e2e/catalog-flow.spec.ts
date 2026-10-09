import { test, expect } from "@playwright/test";

test.describe("StockPilot Catalog Navigation & Unauthenticated Flow", () => {
  test("renders homepage with branding and isolated inventory notice", async ({ page }) => {
    await page.goto("/");

    // Verify application title and header
    await expect(page.getByRole("heading", { name: "StockPilot", level: 1 })).toBeVisible();

    // Verify unauthenticated security banner
    await expect(page.getByText("Private & Isolated Inventory")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In to Get Started" })).toBeVisible();

    // Verify search bar and filter controls
    await expect(page.getByPlaceholder("Search items by name, category, description...")).toBeVisible();
    await expect(page.getByRole("combobox").filter({ hasText: "All Categories" })).toBeVisible();
    await expect(page.getByRole("combobox").filter({ hasText: "All Statuses" })).toBeVisible();

    // Verify action buttons
    await expect(page.getByRole("button", { name: "Audit Log" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Import" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Export" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Item" })).toBeVisible();
  });

  test("opens authentication modal when clicking sign in", async ({ page }) => {
    await page.goto("/");

    // Click Sign In
    await page.getByRole("button", { name: "Sign In to Get Started" }).click();

    // Verify modal dialog appears
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Welcome to StockPilot" })).toBeVisible();

    // Verify multi-provider tabs
    await expect(page.getByRole("tab", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Guest" })).toBeVisible();
  });

  test("opens import modal and provides sample CSV download button", async ({ page }) => {
    await page.goto("/");

    // Click Import
    await page.getByRole("button", { name: "Import" }).click();

    // Verify import dialog appears
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Import Inventory Catalog" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sample CSV" })).toBeVisible();
  });

  test("opens stock movement audit log modal", async ({ page }) => {
    await page.goto("/");

    // Click Audit Log
    await page.getByRole("button", { name: "Audit Log" }).click();

    // Verify movement history dialog appears
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stock Movement Audit Log" })).toBeVisible();
  });
});
