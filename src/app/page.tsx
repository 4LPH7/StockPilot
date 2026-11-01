"use client";

import { useState, useMemo, useEffect } from "react";
import { useInventory } from "@/hooks/use-inventory";
import Header from "@/components/layout/header";
import InventoryActions from "@/components/inventory/inventory-actions";
import InventoryTable from "@/components/inventory/inventory-table";
import InventoryStats from "@/components/inventory/inventory-stats";
import { MovementHistoryDialog } from "@/components/inventory/movement-history-dialog";
import { ImportDialog } from "@/components/inventory/import-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ShieldCheck, LogIn, Lock, Warehouse, Loader2 } from "lucide-react";
import { categories as defaultCategories } from "@/lib/inventory-data";
import { useFirebase } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { useToast } from "@/hooks/use-toast";
import { useUsdInrRate } from "@/hooks/use-fx-rate";

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
    adjustQuantity,
    bulkAddItems,
    seedDemoWarehouse,
    inventoryReady,
  } = useInventory();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const [currency, setCurrency] = useState<Currency>("INR");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const usdToInrRate = useUsdInrRate();
  const [demoRequested, setDemoRequested] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Demo: sign in as a guest if needed, then seed once the (empty) catalog has loaded.
  const launchDemo = () => {
    setDemoRequested(true);
    if (!user && auth) {
      initiateAnonymousSignIn(auth).catch((error) => {
        setDemoRequested(false);
        toast({ variant: "destructive", title: "Couldn't start the demo", description: error.message });
      });
    }
  };

  useEffect(() => {
    if (!demoRequested || !user || !inventoryReady) return;
    setDemoRequested(false);
    if (inventory.length > 0) return; // never mix demo data into a real catalog
    setSeeding(true);
    seedDemoWarehouse()
      .then(() =>
        toast({ title: "Demo warehouse ready", description: "15 SKUs with 30 days of stock movements." })
      )
      .catch((error) => toast({ variant: "destructive", title: "Demo setup failed", description: error.message }))
      .finally(() => setSeeding(false));
  }, [demoRequested, user, inventoryReady, inventory.length, seedDemoWarehouse, toast]);

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
      <Header currency={currency} onCurrencyChange={setCurrency} usdToInrRate={usdToInrRate} />
      
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
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button variant="outline" onClick={launchDemo} disabled={demoRequested || seeding} className="gap-2 shrink-0">
                  {demoRequested || seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Warehouse className="h-4 w-4" />}
                  Launch Demo Warehouse
                </Button>
                <Button onClick={() => setAuthDialogOpen(true)} className="gap-2 shrink-0">
                  <LogIn className="h-4 w-4" />
                  Sign In to Get Started
                </Button>
              </div>
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
          onOpenImport={() => setImportDialogOpen(true)}
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
            onAdjustQuantity={adjustQuantity}
            onLoadDemo={inventory.length === 0 ? launchDemo : undefined}
            demoLoading={demoRequested || seeding}
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
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportItems={bulkAddItems}
      />
    </div>
  );
}
