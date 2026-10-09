export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: string;
  price: number;
  lowStockThreshold?: number;
};

export type StockMovementType =
  | "creation"
  | "restock"
  | "reduction"
  | "adjustment"
  | "deletion";

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: StockMovementType;
  delta: number;
  previousQuantity: number;
  newQuantity: number;
  timestamp: number;
  note?: string;
}
