"use client";

import { useState, useMemo } from "react";
import { useInventory } from "@/hooks/use-inventory";
import Header from "@/components/layout/header";
import InventoryActions from "@/components/inventory/inventory-actions";
import InventoryTable from "@/components/inventory/inventory-table";
import InventoryStats from "@/components/inventory/inventory-stats";
import { MovementHistoryDialog } from "@/components/inventory/movement-history-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ShieldCheck, LogIn, Lock } from "lucide-react";
import { categories as defaultCategories } from "@/lib/inventory-data";

export type Currency = "INR" | "USD";

export default function Home() {
  const {
    inventory,
    movements,
    loading,
    loadingMovements,
    user,
    isUserLoading,
    searchTerm,
    setSearchTerm,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
  } = useInventory();
  const [currency, setCurrency] = useState<Currency>("INR");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Approximate conversion rate
  const usdToInrRate = 83.5;

  const allCategories = useMemo(() => {
    const customCats = Array.from(new Set(inventory.map((item) => item.category).filter(Boolean)));
    const merged = Array.from(new Set([...defaultCategories, ...customCats]));
    return merged.sort();
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // 1. Text search across name, category, and description
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;

      // 2. Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter !== "all") {
        const threshold = item.lowStockThreshold ?? 10;
        if (statusFilter === "out_of_stock" && item.quantity !== 0) return false;
        if (statusFilter === "low_stock" && (item.quantity === 0 || item.quantity > threshold)) return false;
        if (statusFilter === "in_stock" && item.quantity <= threshold) return false;
      }

      return true;
    });
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header currency={currency} onCurrencyChange={setCurrency} />
      
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {!isUserLoading && !user && (
          <Card className="border-primary/30 bg-primary/5 shadow-sm">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-semibold tracking-tight sm:text-lg">
                    Private & Isolated Inventory
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sign in with Google, Email, or Guest session to store and manage your personal stock securely.
                  </p>
                </div>
              </div>
              <Button onClick={() => setAuthDialogOpen(true)} className="gap-2 shrink-0">
                <LogIn className="h-4 w-4" />
                Sign In to Get Started
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Skeleton className="h-28" />
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
          selectedCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          categories={allCategories}
          onAddItem={handleAddItem}
          onOpenHistory={() => setHistoryDialogOpen(true)}
          inventory={filteredInventory}
        />

        {loading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : !user ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Sign In Required</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Your inventory is protected with bank-grade per-user isolation. Sign in to view and manage your items.
              </p>
              <Button onClick={() => setAuthDialogOpen(true)} className="mt-2 gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </CardContent>
          </Card>
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

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <MovementHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        movements={movements}
        loading={loadingMovements}
      />
    </div>
  );
}
