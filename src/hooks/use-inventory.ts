"use client";

import { useState, useEffect, useMemo } from "react";
import type { InventoryItem } from "@/types/inventory";
import { useCollection, useFirebase, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { 
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking 
} from "@/firebase/non-blocking-updates";


export function useInventory() {
  const { firestore, auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const itemsCollection = useMemoFirebase(() => firestore ? collection(firestore, "items") : null, [firestore]);
  const { data: inventory, isLoading: isInventoryLoading } = useCollection<InventoryItem>(itemsCollection);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const handleAddItem = (item: Omit<InventoryItem, "id">) => {
    if (!itemsCollection) return;
    addDocumentNonBlocking(itemsCollection, item);
  };

  const handleUpdateItem = (
    itemId: string,
    updatedItem: Omit<InventoryItem, "id">
  ) => {
    if (!firestore) return;
    const docRef = doc(firestore, "items", itemId);
    setDocumentNonBlocking(docRef, updatedItem, { merge: true });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "items", itemId);
    deleteDocumentNonBlocking(docRef);
  };
  
  const loading = isInventoryLoading || isUserLoading;

  return {
    inventory: inventory || [],
    loading,
    searchTerm,
    setSearchTerm,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
  };
}
