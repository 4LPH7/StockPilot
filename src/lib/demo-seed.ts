import type { InventoryItem, StockMovementType } from "@/types/inventory";

const DAY = 24 * 60 * 60 * 1000;
export const DEMO_DAYS = 30;

// [name, category, priceINR, lowStockThreshold, openingQty, deltas over 30 days, description]
const SKUS: [string, string, number, number, number, number[], string][] = [
  ["Wireless Mouse", "Electronics", 899, 10, 40, [-8, -6, 20, -12, -9, -7], "2.4GHz optical, USB-C charging"],
  ["Mechanical Keyboard", "Electronics", 3499, 8, 15, [-3, -4, -2, -5], "RGB backlit, blue switches"],
  ['27" IPS Monitor', "Electronics", 15999, 4, 10, [-2, -3, 6, -4], "QHD, 75Hz, height adjustable"],
  ["USB-C Hub 7-in-1", "Electronics", 1299, 15, 30, [-10, -8, -7, -5], "HDMI, SD, 3x USB-A, PD 100W"],
  ["Noise-Cancelling Headphones", "Electronics", 7499, 5, 12, [-2, -1, -3], "Over-ear, 30h battery"],
  ["Mesh Ergonomic Chair", "Furniture", 7999, 5, 8, [-2, 6, -3], "High-back with lumbar support"],
  ["Standing Desk", "Furniture", 18999, 3, 6, [-1, -2, -1], "Dual motor, 120x60cm top"],
  ["5-Tier Bookshelf", "Furniture", 4599, 2, 5, [-1, 3], "Engineered wood, walnut finish"],
  ["Laptop Sleeve 14\"", "Accessories", 799, 20, 60, [-15, -12, 30, -18], "Water-resistant neoprene"],
  ["Aluminium Phone Stand", "Accessories", 349, 25, 80, [-20, -25, -18], "Adjustable angle, foldable"],
  ["HDMI 2.1 Cable 2m", "Accessories", 299, 30, 100, [-30, -25, 50, -20], "8K@60Hz braided cable"],
  ["A5 Hardcover Journal", "Office Supplies", 249, 25, 120, [-30, -25, -20, 60], "192 dotted pages, 100gsm"],
  ["Gel Pens (Pack of 10)", "Office Supplies", 199, 40, 150, [-40, -35, -30, -25], "0.5mm assorted colours"],
  ["A4 Printer Paper (500)", "Office Supplies", 389, 20, 50, [-15, -12, -10, -13], "75gsm ream"],
  ["Thermal Label Roll", "Other", 549, 10, 25, [-5, -4, 15, -6], "100x150mm, 500 labels"],
];

export type DemoStep = {
  type: StockMovementType;
  previousQuantity: number;
  newQuantity: number;
  timestamp: number;
  note: string;
};

export type DemoSku = {
  item: Omit<InventoryItem, "id" | "lastMovementId">;
  openingQuantity: number;
  createdAt: number;
  steps: DemoStep[];
};

/** 15 SKUs whose movements replay 30 days of receipts and dispatches, ending at item.quantity. */
export function buildDemoPlan(now = Date.now()): DemoSku[] {
  return SKUS.map(([name, category, price, lowStockThreshold, opening, deltas, description], i) => {
    const createdAt = now - DEMO_DAYS * DAY + i * 37 * 60 * 1000;
    let quantity = opening;
    const steps = deltas.map((delta, k) => {
      const previousQuantity = quantity;
      quantity += delta;
      return {
        type: delta > 0 ? "restock" : "reduction",
        previousQuantity,
        newQuantity: quantity,
        timestamp: createdAt + Math.round(((k + 1) * DEMO_DAYS * DAY) / (deltas.length + 1)),
        note: delta > 0 ? `Purchase receipt PO-${1040 + i * 7 + k}` : `Sales dispatch INV-${2310 + i * 11 + k}`,
      } satisfies DemoStep;
    });
    return {
      item: { name, category, price, lowStockThreshold, description, quantity },
      openingQuantity: opening,
      createdAt,
      steps,
    };
  });
}
