import { describe, it, expect } from "vitest";
import { calculateInventoryStats, convertPrice } from "./inventory-calculations";
import type { InventoryItem } from "@/types/inventory";

describe("convertPrice", () => {
  it("returns original price when currency is INR", () => {
    expect(convertPrice(500, "INR")).toBe(500);
  });

  it("divides by exchange rate when currency is USD", () => {
    expect(convertPrice(835, "USD", 83.5)).toBe(10);
  });
});

describe("calculateInventoryStats", () => {
  const sampleItems: InventoryItem[] = [
    {
      id: "1",
      name: "Wireless Mouse",
      category: "Electronics",
      price: 1000,
      quantity: 5,
      lowStockThreshold: 10,
      description: "",
    },
    {
      id: "2",
      name: "Mechanical Keyboard",
      category: "Electronics",
      price: 3000,
      quantity: 2,
      lowStockThreshold: 5,
      description: "",
    },
    {
      id: "3",
      name: "Office Desk",
      category: "Furniture",
      price: 12000,
      quantity: 1,
      lowStockThreshold: 2,
      description: "",
    },
    {
      id: "4",
      name: "Ergonomic Chair",
      category: "Furniture",
      price: 8000,
      quantity: 0,
      lowStockThreshold: 3,
      description: "",
    },
  ];

  it("accurately computes total inventory value and unit count", () => {
    // Total value: (1000*5) + (3000*2) + (12000*1) + (8000*0) = 5000 + 6000 + 12000 + 0 = 23000
    // Total items: 5 + 2 + 1 + 0 = 8
    const stats = calculateInventoryStats(sampleItems, "INR");
    expect(stats.totalValue).toBe(23000);
    expect(stats.totalItems).toBe(8);
  });

  it("accurately counts items at or below low stock threshold", () => {
    // item 1: 5 <= 10 (low)
    // item 2: 2 <= 5 (low)
    // item 3: 1 <= 2 (low)
    // item 4: 0 <= 3 (out of stock/low)
    // All 4 are at or below threshold
    const stats = calculateInventoryStats(sampleItems, "INR");
    expect(stats.lowStockCount).toBe(4);
  });

  it("accurately groups valuation by category", () => {
    const stats = calculateInventoryStats(sampleItems, "INR");
    // Electronics: 5000 + 6000 = 11000
    // Furniture: 12000 + 0 = 12000
    expect(stats.categoryData).toHaveLength(2);
    expect(stats.categoryData[0]).toEqual({ name: "Furniture", value: 12000 });
    expect(stats.categoryData[1]).toEqual({ name: "Electronics", value: 11000 });
  });

  it("supports USD conversion in aggregated totals", () => {
    const stats = calculateInventoryStats(sampleItems, "USD", 100);
    // 23000 / 100 = 230
    expect(stats.totalValue).toBe(230);
  });

  it("handles empty inventory gracefully", () => {
    const stats = calculateInventoryStats([], "INR");
    expect(stats.totalValue).toBe(0);
    expect(stats.totalItems).toBe(0);
    expect(stats.lowStockCount).toBe(0);
    expect(stats.categoryData).toEqual([]);
    expect(stats.topItems).toEqual([]);
  });
});
