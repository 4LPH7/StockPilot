"use client";

import { useState } from "react";
import type { InventoryItem } from "@/types/inventory";
import { initialInventory } from "@/lib/inventory-data";
import Header from "@/components/layout/header";
import InventoryActions from "@/components/inventory/inventory-actions";
import InventoryTable from "@/components/inventory/inventory-table";
import InventoryStats from "@/components/inventory/inventory-stats";

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddItem = (item: Omit<InventoryItem, "id">) => {
    setInventory((prev) => [
      ...prev,
      { ...item, id: crypto.randomUUID() },
    ]);
  };

  const handleUpdateQuantity = (itemId: string, amount: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + amount) }
          : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== itemId));
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header onAddItem={handleAddItem} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <InventoryStats items={inventory} />
        <InventoryActions 
          searchTerm={searchTerm} 
          onSearch={setSearchTerm}
          inventory={filteredInventory}
        />
        <InventoryTable
          items={filteredInventory}
          onUpdateQuantity={handleUpdateQuantity}
          onDeleteItem={handleDeleteItem}
        />
      </main>
    </div>
  );
}
