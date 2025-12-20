"use client";

import { useState } from "react";
import { useInventory } from "@/hooks/use-inventory";
import Header from "@/components/layout/header";
import InventoryActions from "@/components/inventory/inventory-actions";
import InventoryTable from "@/components/inventory/inventory-table";
import InventoryStats from "@/components/inventory/inventory-stats";
import { Skeleton } from "@/components/ui/skeleton";

export type Currency = "INR" | "USD";

export default function Home() {
  const {
    inventory,
    loading,
    searchTerm,
    setSearchTerm,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
  } = useInventory();
  const [currency, setCurrency] = useState<Currency>("INR");
  
  // Approximate conversion rate, can be fetched from an API in the future
  const usdToInrRate = 83.5;

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header currency={currency} onCurrencyChange={setCurrency} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : (
          <InventoryStats items={inventory} currency={currency} conversionRate={usdToInrRate} />
        )}
        <InventoryActions
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAddItem={handleAddItem}
          inventory={filteredInventory}
        />
        {loading ? (
            <Skeleton className="h-[400px] w-full" />
        ) : (
            <InventoryTable
                items={filteredInventory}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                currency={currency}
                conversionRate={usdToInrRate}
            />
        )}
      </main>
    </div>
  );
}
