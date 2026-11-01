import type { InventoryItem } from "@/types/inventory";

export interface InventoryStatsResult {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  categoryData: { name: string; value: number }[];
  topItems: { name: string; value: number }[];
}

/**
 * Converts price between INR and USD using the specified exchange rate.
 */
export function convertPrice(
  price: number,
  currency: "INR" | "USD",
  rate: number = 83.5
): number {
  if (currency === "USD") {
    return price / rate;
  }
  return price;
}

// Values are summed in integer paise, then converted once, so totals don't drift (0.1 + 0.2).
const toPaise = (inr: number) => Math.round(inr * 100);

/**
 * Aggregates portfolio metrics, category distribution, and top assets across inventory items.
 */
export function calculateInventoryStats(
  items: InventoryItem[],
  currency: "INR" | "USD" = "INR",
  conversionRate: number = 83.5
): InventoryStatsResult {
  const fromPaise = (paise: number) => convertPrice(paise / 100, currency, conversionRate);
  const categoryPaise: Record<string, number> = {};
  let totalPaise = 0;
  let totalItems = 0;

  const itemValues = items.map((item) => {
    const paise = toPaise(item.price * item.quantity); // round the line total, not the unit price
    totalPaise += paise;
    totalItems += item.quantity;
    categoryPaise[item.category] = (categoryPaise[item.category] || 0) + paise;
    return { name: item.name, paise };
  });

  const categoryChartData = Object.entries(categoryPaise)
    .sort((a, b) => b[1] - a[1])
    .map(([name, paise]) => ({ name, value: fromPaise(paise) }));

  const topItemsData = itemValues
    .sort((a, b) => b.paise - a.paise)
    .slice(0, 5)
    .map(({ name, paise }) => ({ name, value: fromPaise(paise) }));

  const lowStockAlerts = items.filter(
    (item) => item.quantity <= (item.lowStockThreshold ?? 10)
  ).length;

  return {
    totalValue: fromPaise(totalPaise),
    totalItems,
    lowStockCount: lowStockAlerts,
    categoryData: categoryChartData,
    topItems: topItemsData,
  };
}
