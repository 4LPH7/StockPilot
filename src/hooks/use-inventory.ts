"use client";

import { useState } from "react";
import type { InventoryItem } from "@/types/inventory";
import { initialInventory } from "@/lib/inventory-data";

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddItem = (item: Omit<InventoryItem, "id">) => {
    setInventory((prev) => [
      ...prev,
      { ...item, id: crypto.randomUUID() },
    ]);
  };

  const handleUpdateItem = (
    itemId: string,
    updatedItem: Omit<InventoryItem, "id">
  ) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...updatedItem } : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== itemId));
  };

  return {
    inventory,
    searchTerm,
    setSearchTerm,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
  };
}
