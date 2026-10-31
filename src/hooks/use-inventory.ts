"use client";

import { useRef, useState } from "react";
import type { InventoryItem, StockMovement, StockMovementType } from "@/types/inventory";
import { useCollection, useFirebase, useUser, useMemoFirebase } from "@/firebase";
import {
  collection,
  doc,
  query,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  getDoc,
  getDocFromCache,
  type DocumentReference,
} from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { IMPORT_BATCH_ITEMS } from "@/lib/import-utils";
import { buildDemoPlan } from "@/lib/demo-seed";

type ItemData = Omit<InventoryItem, "id">;

const reportWriteError = (path: string, operation: "create" | "update" | "delete", data?: unknown) => (error: unknown) => {
  errorEmitter.emit(
    "permission-error",
    new FirestorePermissionError({ path, operation, requestResourceData: data })
  );
  console.error(error);
};

// committedAt lets firestore.rules check the movement was written in the same batch as the item.
const movementDoc = (m: {
  itemId: string;
  itemName: string;
  previousQuantity: number;
  newQuantity: number;
  unitPrice: number;
  note: string;
  type?: StockMovementType;
  timestamp?: number;
}) => ({
  type: m.newQuantity > m.previousQuantity ? "restock" : "reduction",
  timestamp: Date.now(),
  ...m,
  delta: m.newQuantity - m.previousQuantity,
  committedAt: serverTimestamp(),
});

// Cache first so edits work offline; the server rejects the write if the cached quantity was stale.
const readItem = (ref: DocumentReference) => getDocFromCache(ref).catch(() => getDoc(ref));

export function useInventory() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

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

  const movementsCol = () => collection(firestore!, "users", user!.uid, "movements");

  const handleAddItem = (item: ItemData) => {
    if (!itemsCollection || !firestore || !user) return;
    const itemRef = doc(itemsCollection);
    const movementRef = doc(movementsCol());
    const batch = writeBatch(firestore);
    batch.set(itemRef, { ...item, lastMovementId: movementRef.id });
    batch.set(movementRef, movementDoc({
      itemId: itemRef.id,
      itemName: item.name,
      type: "creation",
      previousQuantity: 0,
      newQuantity: item.quantity,
      unitPrice: item.price,
      note: "Item created in catalog",
    }));
    batch.commit().catch(reportWriteError(itemRef.path, "create", item));
  };

  // Single write path for edits and quick adjusts. Batch (not transaction) so it queues offline;
  // the rules require previousQuantity == stored quantity, so another device's stale write is rejected.
  // Changes run one after another so rapid taps each read the previous tap's local result.
  const changeItem = (itemId: string, toPatch: (current: ItemData) => Partial<ItemData>, note?: string) => {
    if (!firestore || !user) return;
    const itemRef = doc(firestore, "users", user.uid, "items", itemId);
    const step = writeQueue.current.then(async () => {
      const snap = await readItem(itemRef);
      if (!snap.exists()) return;
      const current = snap.data() as ItemData;
      const patch = toPatch(current);
      const newQuantity = patch.quantity ?? current.quantity;
      if (newQuantity < 0) return;
      const batch = writeBatch(firestore);
      if (newQuantity === current.quantity) {
        batch.set(itemRef, patch, { merge: true });
      } else {
        const movementRef = doc(movementsCol());
        batch.set(itemRef, { ...patch, lastMovementId: movementRef.id }, { merge: true });
        batch.set(movementRef, movementDoc({
          itemId,
          itemName: patch.name ?? current.name,
          previousQuantity: current.quantity,
          newQuantity,
          unitPrice: patch.price ?? current.price,
          note: note ?? `Quantity changed from ${current.quantity} to ${newQuantity}`,
        }));
      }
      // Wrapped so the queue waits for the local write only, not the server (offline taps still queue).
      return { serverAck: batch.commit() };
    });
    writeQueue.current = step.then(() => undefined, () => undefined);
    step.then((r) => r?.serverAck).catch(reportWriteError(itemRef.path, "update"));
  };

  const handleUpdateItem = (itemId: string, updatedItem: ItemData) =>
    changeItem(itemId, () => updatedItem);

  const adjustQuantity = (itemId: string, delta: number, note?: string) =>
    changeItem(itemId, (current) => ({ quantity: current.quantity + delta }), note);

  const handleDeleteItem = (itemId: string) => {
    if (!firestore || !user) return;
    const existing = inventory?.find((i) => i.id === itemId);
    const itemRef = doc(firestore, "users", user.uid, "items", itemId);
    const batch = writeBatch(firestore);
    batch.delete(itemRef);
    if (existing) {
      batch.set(doc(movementsCol()), movementDoc({
        itemId,
        itemName: existing.name,
        type: "deletion",
        previousQuantity: existing.quantity,
        newQuantity: 0,
        unitPrice: existing.price,
        note: `Deleted from catalog (${existing.quantity} units)`,
      }));
    }
    batch.commit().catch(reportWriteError(itemRef.path, "delete"));
  };

  const bulkAddItems = async (
    items: ItemData[],
    onProgress?: (done: number, total: number) => void
  ): Promise<number> => {
    if (!itemsCollection || !firestore || !user || items.length === 0) return 0;

    let committedCount = 0;
    // ponytail: sequential 20-item batches (~250 round trips for 5,000 rows); run a few in parallel if imports feel slow.
    for (let i = 0; i < items.length; i += IMPORT_BATCH_ITEMS) {
      const chunk = items.slice(i, i + IMPORT_BATCH_ITEMS);
      const batch = writeBatch(firestore);

      for (const item of chunk) {
        const itemRef = doc(itemsCollection);
        const movementRef = doc(movementsCol());
        batch.set(itemRef, { ...item, lastMovementId: movementRef.id });
        batch.set(movementRef, movementDoc({
          itemId: itemRef.id,
          itemName: item.name,
          type: "creation",
          previousQuantity: 0,
          newQuantity: item.quantity,
          unitPrice: item.price,
          note: "Bulk imported via spreadsheet",
        }));
      }

      await batch.commit();
      committedCount += chunk.length;
      onProgress?.(committedCount, items.length);
    }

    return committedCount;
  };

  // Replays 30 days of history through the same audited writes the app uses: one batch per step.
  const seedDemoWarehouse = async () => {
    if (!itemsCollection || !firestore || !user) return;
    const plan = buildDemoPlan();
    const refs = plan.map(() => doc(itemsCollection));

    let batch = writeBatch(firestore);
    plan.forEach(({ item, openingQuantity, createdAt }, i) => {
      const movementRef = doc(movementsCol());
      batch.set(refs[i], { ...item, quantity: openingQuantity, lastMovementId: movementRef.id });
      batch.set(movementRef, movementDoc({
        itemId: refs[i].id,
        itemName: item.name,
        type: "creation",
        previousQuantity: 0,
        newQuantity: openingQuantity,
        unitPrice: item.price,
        timestamp: createdAt,
        note: "Opening stock",
      }));
    });
    await batch.commit();

    const stepCount = Math.max(...plan.map((p) => p.steps.length));
    for (let k = 0; k < stepCount; k++) {
      batch = writeBatch(firestore);
      plan.forEach(({ item, steps }, i) => {
        const step = steps[k];
        if (!step) return;
        const movementRef = doc(movementsCol());
        batch.set(refs[i], { quantity: step.newQuantity, lastMovementId: movementRef.id }, { merge: true });
        batch.set(movementRef, movementDoc({
          itemId: refs[i].id,
          itemName: item.name,
          unitPrice: item.price,
          ...step,
        }));
      });
      await batch.commit();
    }
  };

  const loading = isUserLoading || (!!user && isInventoryLoading);

  return {
    inventory: inventory || [],
    inventoryReady: inventory !== null,
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
    adjustQuantity,
    bulkAddItems,
    seedDemoWarehouse,
  };
}
