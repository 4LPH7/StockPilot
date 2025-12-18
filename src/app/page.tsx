"use client";

import { useInventory } from "@/hooks/use-inventory";
import Header from "@/components/layout/header";
import InventoryActions from "@/components/inventory/inventory-actions";
import InventoryTable from "@/components/inventory/inventory-table";
import InventoryStats from "@/components/inventory/inventory-stats";

export default function Home() {
  const {
    inventory,
    searchTerm,
    setSearchTerm,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
  } = useInventory();

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <InventoryStats items={inventory} />
        <InventoryActions
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAddItem={handleAddItem}
          inventory={filteredInventory}
        />
        <InventoryTable
          items={filteredInventory}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      </main>
    </div>
  );
}
