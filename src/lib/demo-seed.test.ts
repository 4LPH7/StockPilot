import { describe, it, expect } from "vitest";
import { buildDemoPlan, DEMO_DAYS } from "./demo-seed";
import { getItemStockStatus } from "./stock-status";

describe("buildDemoPlan", () => {
  const now = Date.UTC(2026, 9, 31);
  const plan = buildDemoPlan(now);

  it("chains every movement from the opening stock to the item's final quantity", () => {
    for (const { item, openingQuantity, steps } of plan) {
      let qty = openingQuantity;
      for (const s of steps) {
        expect(s.previousQuantity).toBe(qty);
        expect(s.newQuantity).toBeGreaterThanOrEqual(0);
        qty = s.newQuantity;
      }
      expect(qty).toBe(item.quantity);
    }
  });

  it("keeps timestamps ordered inside the 30-day window", () => {
    for (const { createdAt, steps } of plan) {
      expect(createdAt).toBeGreaterThanOrEqual(now - DEMO_DAYS * 864e5);
      let t = createdAt;
      for (const s of steps) {
        expect(s.timestamp).toBeGreaterThan(t);
        t = s.timestamp;
      }
      expect(t).toBeLessThanOrEqual(now);
    }
  });

  it("fits the 100-event history view and shows every stock status", () => {
    const events = plan.reduce((n, p) => n + 1 + p.steps.length, 0);
    expect(events).toBeLessThanOrEqual(100);
    const statuses = new Set(plan.map((p) => getItemStockStatus(p.item.quantity, p.item.lowStockThreshold)));
    expect(statuses).toEqual(new Set(["in_stock", "low_stock", "out_of_stock"]));
  });
});
