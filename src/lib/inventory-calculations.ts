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

/**
 * Aggregates portfolio metrics, category distribution, and top assets across inventory items.
 */
export function calculateInventoryStats(
  items: InventoryItem[],
  currency: "INR" | "USD" = "INR",
  conversionRate: number = 83.5
): InventoryStatsResult {
  const stats = items.reduce(
    (acc, item) => {
      const itemPrice = currency === "USD" ? item.price / conversionRate : item.price;
      const itemValue = itemPrice * item.quantity;
      acc.totalValue += itemValue;
      acc.totalItems += item.quantity;

      const categoryValue = (acc.categoryValues[item.category] || 0) + itemValue;
      acc.categoryValues[item.category] = categoryValue;

      acc.allItems.push({ name: item.name, value: itemValue });
      return acc;
    },
    {
      totalValue: 0,
      totalItems: 0,
      categoryValues: {} as Record<string, number>,
      allItems: [] as { name: string; value: number }[],
    }
  );

  const categoryChartData = Object.entries(stats.categoryValues)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topItemsData = stats.allItems.sort((a, b) => b.value - a.value).slice(0, 5);
  const lowStockAlerts = items.filter(
    (item) => item.quantity <= (item.lowStockThreshold ?? 10)
  ).length;

  return {
    totalValue: stats.totalValue,
    totalItems: stats.totalItems,
    lowStockCount: lowStockAlerts,
    categoryData: categoryChartData,
    topItems: topItemsData,
  };
}
