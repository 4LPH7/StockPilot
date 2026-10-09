import { describe, it, expect } from "vitest";
import { getItemStockStatus, getStatusBadgeDetails } from "./stock-status";

describe("getItemStockStatus", () => {
  it("classifies quantity 0 as out_of_stock", () => {
    expect(getItemStockStatus(0)).toBe("out_of_stock");
    expect(getItemStockStatus(0, 5)).toBe("out_of_stock");
    expect(getItemStockStatus(-2, 10)).toBe("out_of_stock");
  });

  it("classifies quantity between 1 and threshold as low_stock", () => {
    // Default threshold is 10
    expect(getItemStockStatus(1)).toBe("low_stock");
    expect(getItemStockStatus(5)).toBe("low_stock");
    expect(getItemStockStatus(10)).toBe("low_stock");

    // Custom threshold
    expect(getItemStockStatus(1, 15)).toBe("low_stock");
    expect(getItemStockStatus(15, 15)).toBe("low_stock");
  });

  it("classifies quantity greater than threshold as in_stock", () => {
    // Default threshold is 10
    expect(getItemStockStatus(11)).toBe("in_stock");
    expect(getItemStockStatus(100)).toBe("in_stock");

    // Custom threshold
    expect(getItemStockStatus(16, 15)).toBe("in_stock");
    expect(getItemStockStatus(4, 3)).toBe("in_stock");
  });
});

describe("getStatusBadgeDetails", () => {
  it("returns destructive variant for out_of_stock", () => {
    const details = getStatusBadgeDetails("out_of_stock");
    expect(details.label).toBe("Out of Stock");
    expect(details.variant).toBe("destructive");
  });

  it("returns secondary warning variant for low_stock", () => {
    const details = getStatusBadgeDetails("low_stock");
    expect(details.label).toBe("Low Stock");
    expect(details.variant).toBe("secondary");
    expect(details.className).toContain("text-amber-600");
  });

  it("returns outline variant for in_stock", () => {
    const details = getStatusBadgeDetails("in_stock");
    expect(details.label).toBe("In Stock");
    expect(details.variant).toBe("outline");
    expect(details.className).toContain("text-emerald-600");
  });
});
