"use client";

import { useState } from "react";
import type { InventoryItem } from "@/types/inventory";
import { useCollection, useFirebase, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
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

  const handleAddItem = (item: Omit<InventoryItem, "id">) => {
    if (!itemsCollection) return;
    addDocumentNonBlocking(itemsCollection, item);
  };

  const handleUpdateItem = (
    itemId: string,
    updatedItem: Omit<InventoryItem, "id">
  ) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, "users", user.uid, "items", itemId);
    setDocumentNonBlocking(docRef, updatedItem, { merge: true });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, "users", user.uid, "items", itemId);
    deleteDocumentNonBlocking(docRef);
  };
  
  const loading = isUserLoading || (!!user && isInventoryLoading);

  return {
    inventory: inventory || [],
    loading,
    user,
    isUserLoading,
    searchTerm,
    setSearchTerm,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
  };
}
