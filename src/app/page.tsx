"use client";

import { useState } from "react";
import { useInventory } from "@/hooks/use-inventory";
import Header from "@/components/layout/header";
import InventoryActions from "@/components/inventory/inventory-actions";
import InventoryTable from "@/components/inventory/inventory-table";
import InventoryStats from "@/components/inventory/inventory-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ShieldCheck, LogIn, Lock } from "lucide-react";

export type Currency = "INR" | "USD";

export default function Home() {
  const {
    inventory,
    loading,
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
  
  // Approximate conversion rate
  const usdToInrRate = 83.5;

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    </div>
  );
}
