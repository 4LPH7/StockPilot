"use client";

import { useState } from "react";
import type { InventoryItem, StockMovement, StockMovementType } from "@/types/inventory";
import { useCollection, useFirebase, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, limit } from "firebase/firestore";
import { 
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking 
} from "@/firebase/non-blocking-updates";

export function useInventory() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const itemsCollection = useMemoFirebase(
    () => (firestore && user ? collection(firestore, "users", user.uid, "items") : null),
    [firestore, user]
  );
  
  const { data: inventory, isLoading: isInventoryLoading } = useCollection<InventoryItem>(itemsCollection);

  const movementsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, "users", user.uid, "movements"),
            orderBy("timestamp", "desc"),
            limit(100)
          )
        : null,
    [firestore, user]
  );

  const { data: movements, isLoading: isMovementsLoading } = useCollection<StockMovement>(movementsQuery);

  const handleAddItem = (item: Omit<InventoryItem, "id">) => {
    if (!itemsCollection || !firestore || !user) return;
    const itemPromise = addDocumentNonBlocking(itemsCollection, item);
    if (itemPromise) {
      itemPromise.then((docRef) => {
        if (!docRef) return;
        const movementsCol = collection(firestore, "users", user.uid, "movements");
        addDocumentNonBlocking(movementsCol, {
          itemId: docRef.id,
          itemName: item.name,
          type: "creation",
          delta: item.quantity,
          previousQuantity: 0,
          newQuantity: item.quantity,
          timestamp: Date.now(),
          note: "Item created in catalog",
        });
      });
    }
  };

  const handleUpdateItem = (
    itemId: string,
    updatedItem: Omit<InventoryItem, "id">
  ) => {
    if (!firestore || !user) return;
    const existing = inventory?.find((i) => i.id === itemId);
    const docRef = doc(firestore, "users", user.uid, "items", itemId);
    setDocumentNonBlocking(docRef, updatedItem, { merge: true });

    if (existing && existing.quantity !== updatedItem.quantity) {
      const delta = updatedItem.quantity - existing.quantity;
      const movementType: StockMovementType = delta > 0 ? "restock" : "reduction";
      const movementsCol = collection(firestore, "users", user.uid, "movements");
      addDocumentNonBlocking(movementsCol, {
        itemId,
        itemName: updatedItem.name,
        type: movementType,
        delta,
        previousQuantity: existing.quantity,
        newQuantity: updatedItem.quantity,
        timestamp: Date.now(),
        note: `Quantity changed from ${existing.quantity} to ${updatedItem.quantity}`,
      });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (!firestore || !user) return;
    const existing = inventory?.find((i) => i.id === itemId);
    const docRef = doc(firestore, "users", user.uid, "items", itemId);
    deleteDocumentNonBlocking(docRef);

    if (existing) {
      const movementsCol = collection(firestore, "users", user.uid, "movements");
      addDocumentNonBlocking(movementsCol, {
        itemId,
        itemName: existing.name,
        type: "deletion",
        delta: -existing.quantity,
        previousQuantity: existing.quantity,
        newQuantity: 0,
        timestamp: Date.now(),
        note: `Deleted from catalog (${existing.quantity} units)`,
      });
    }
  };
  
  const loading = isUserLoading || (!!user && isInventoryLoading);

  return {
    inventory: inventory || [],
    movements: movements || [],
    loading,
    loadingMovements: isMovementsLoading,
    user,
    isUserLoading,
    searchTerm,
    setSearchTerm,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
  };
}
