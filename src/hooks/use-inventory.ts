"use client";

import { useState } from "react";
import type { InventoryItem, StockMovement, StockMovementType } from "@/types/inventory";
import { useCollection, useFirebase, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, limit, writeBatch, runTransaction } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const reportWriteError = (path: string, operation: "create" | "update" | "delete", data?: unknown) => (error: unknown) => {
  errorEmitter.emit(
    "permission-error",
    new FirestorePermissionError({ path, operation, requestResourceData: data })
  );
  console.error(error);
};

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
    const itemRef = doc(itemsCollection);
    const movementRef = doc(collection(firestore, "users", user.uid, "movements"));
    const batch = writeBatch(firestore);
    batch.set(itemRef, { ...item, lastMovementId: movementRef.id });
    batch.set(movementRef, {
      itemId: itemRef.id,
      itemName: item.name,
      type: "creation",
      delta: item.quantity,
      previousQuantity: 0,
      newQuantity: item.quantity,
      timestamp: Date.now(),
      note: "Item created in catalog",
    });
    batch.commit().catch(reportWriteError(itemRef.path, "create", item));
  };

  const handleUpdateItem = (
    itemId: string,
    updatedItem: Omit<InventoryItem, "id">
  ) => {
    if (!firestore || !user) return;
    const itemRef = doc(firestore, "users", user.uid, "items", itemId);
    const movementRef = doc(collection(firestore, "users", user.uid, "movements"));
    // Transaction: reads the live quantity so concurrent edits can't record a stale delta.
    // ponytail: transactions need a connection; offline edits fail instead of queueing.
    runTransaction(firestore, async (tx) => {
      const snap = await tx.get(itemRef);
      const previousQuantity: number = snap.exists() ? snap.data().quantity : 0;
      if (previousQuantity === updatedItem.quantity) {
        tx.set(itemRef, updatedItem, { merge: true });
        return;
      }
      const delta = updatedItem.quantity - previousQuantity;
      const type: StockMovementType = delta > 0 ? "restock" : "reduction";
      tx.set(itemRef, { ...updatedItem, lastMovementId: movementRef.id }, { merge: true });
      tx.set(movementRef, {
        itemId,
        itemName: updatedItem.name,
        type,
        delta,
        previousQuantity,
        newQuantity: updatedItem.quantity,
        timestamp: Date.now(),
        note: `Quantity changed from ${previousQuantity} to ${updatedItem.quantity}`,
      });
    }).catch(reportWriteError(itemRef.path, "update", updatedItem));
  };

  const handleDeleteItem = (itemId: string) => {
    if (!firestore || !user) return;
    const existing = inventory?.find((i) => i.id === itemId);
    const itemRef = doc(firestore, "users", user.uid, "items", itemId);
    const batch = writeBatch(firestore);
    batch.delete(itemRef);
    if (existing) {
      batch.set(doc(collection(firestore, "users", user.uid, "movements")), {
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
    batch.commit().catch(reportWriteError(itemRef.path, "delete"));
  };

  const bulkAddItems = async (items: Omit<InventoryItem, "id">[]): Promise<number> => {
    if (!firestore || !user || items.length === 0) return 0;

    const chunkSize = 200;
    let committedCount = 0;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(firestore);

      for (const item of chunk) {
        const itemRef = doc(collection(firestore, "users", user.uid, "items"));
        const movementRef = doc(collection(firestore, "users", user.uid, "movements"));
        batch.set(itemRef, { ...item, lastMovementId: movementRef.id });
        batch.set(movementRef, {
          itemId: itemRef.id,
          itemName: item.name,
          type: "creation",
          delta: item.quantity,
          previousQuantity: 0,
          newQuantity: item.quantity,
          timestamp: Date.now(),
          note: "Bulk imported via spreadsheet",
        });
      }

      await batch.commit();
      committedCount += chunk.length;
    }

    return committedCount;
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
    bulkAddItems,
  };
}
