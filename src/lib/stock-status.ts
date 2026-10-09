export type StockStatus = "out_of_stock" | "low_stock" | "in_stock";

/**
 * Determines whether an inventory item is out of stock, low on stock, or sufficiently stocked.
 *
 * @param quantity Current unit count
 * @param lowStockThreshold Minimum stock alert threshold (defaults to 10)
 */
export function getItemStockStatus(
  quantity: number,
  lowStockThreshold: number = 10
): StockStatus {
  if (quantity <= 0) {
    return "out_of_stock";
  }
  if (quantity <= lowStockThreshold) {
    return "low_stock";
  }
  return "in_stock";
}

/**
 * Returns UI badge styling attributes for a given stock status.
 */
export function getStatusBadgeDetails(status: StockStatus) {
  switch (status) {
    case "out_of_stock":
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
        className: "font-normal text-xs",
      };
    case "low_stock":
      return {
        label: "Low Stock",
        variant: "secondary" as const,
        className:
          "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-normal text-xs",
      };
    case "in_stock":
    default:
      return {
        label: "In Stock",
        variant: "outline" as const,
        className:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-normal text-xs",
      };
  }
}
