// @vitest-environment node
// Runs only against the emulator: `npm run test:rules` (skipped by plain `npm test`).
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { initializeApp, deleteApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signInAnonymously } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  collection,
  writeBatch,
  serverTimestamp,
  setDoc,
  deleteDoc,
  type Firestore,
} from "firebase/firestore";
import { IMPORT_BATCH_ITEMS } from "@/lib/import-utils";

const host = process.env.FIRESTORE_EMULATOR_HOST;

describe.skipIf(!host)("firestore.rules", () => {
  let app: FirebaseApp;
  let db: Firestore;
  let uid: string;

  beforeAll(async () => {
    app = initializeApp({ projectId: "demo-stockpilot", apiKey: "demo-key" }, "rules-test");
    const auth = getAuth(app);
    connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
    db = getFirestore(app);
    const [h, p] = host!.split(":");
    connectFirestoreEmulator(db, h, Number(p));
    uid = (await signInAnonymously(auth)).user.uid;
  });
  afterAll(() => deleteApp(app));

  const item = (quantity: number) => ({
    name: "Widget",
    description: "",
    category: "Other",
    price: 10,
    quantity,
    lowStockThreshold: 5,
  });
  const movement = (itemId: string, prev: number, next: number) => ({
    itemId,
    itemName: "Widget",
    type: "adjustment",
    delta: next - prev,
    previousQuantity: prev,
    newQuantity: next,
    timestamp: Date.now(),
    committedAt: serverTimestamp(),
  });
  const itemsCol = () => collection(db, "users", uid, "items");
  const movesCol = () => collection(db, "users", uid, "movements");

  function createBatch(n: number, quantity = 5) {
    const batch = writeBatch(db);
    const refs = [];
    for (let i = 0; i < n; i++) {
      const itemRef = doc(itemsCol());
      const moveRef = doc(movesCol());
      batch.set(itemRef, { ...item(quantity), lastMovementId: moveRef.id });
      batch.set(moveRef, movement(itemRef.id, 0, quantity));
      refs.push({ itemRef, moveRef });
    }
    return { batch, refs };
  }

  // Moves an item from prev to next with a fresh movement; returns the movement id.
  async function change(itemId: string, prev: number, next: number) {
    const batch = writeBatch(db);
    const moveRef = doc(movesCol());
    batch.set(doc(itemsCol(), itemId), { ...item(next), lastMovementId: moveRef.id });
    batch.set(moveRef, movement(itemId, prev, next));
    await batch.commit();
    return moveRef.id;
  }

  async function createOne(quantity: number) {
    const { batch, refs } = createBatch(1, quantity);
    await batch.commit();
    return refs[0].itemRef.id;
  }

  it(`allows a full import chunk of ${IMPORT_BATCH_ITEMS} audited items`, async () => {
    await expect(createBatch(IMPORT_BATCH_ITEMS).batch.commit()).resolves.toBeUndefined();
  });

  it("denies creating an item without its movement", async () => {
    await expect(setDoc(doc(itemsCol()), item(5))).rejects.toThrow(/permission/i);
  });

  it("denies a quantity change without a fresh movement", async () => {
    const id = await createOne(5);
    await expect(
      setDoc(doc(itemsCol(), id), item(9), { merge: true })
    ).rejects.toThrow(/permission/i);
  });

  it("denies a stale movement (previousQuantity != stored quantity)", async () => {
    const id = await createOne(5);
    await expect(change(id, 4, 6)).rejects.toThrow(/permission/i);
  });

  it("denies replaying an old movement whose numbers match", async () => {
    const id = await createOne(5);
    const fiveToThree = await change(id, 5, 3);
    await change(id, 3, 5);
    await expect(
      setDoc(doc(itemsCol(), id), { ...item(3), lastMovementId: fiveToThree })
    ).rejects.toThrow(/permission/i);
  });

  it("denies a stale duplicate whose target quantity is already stored", async () => {
    const id = await createOne(5);
    await change(id, 5, 6); // device A: +1
    await expect(change(id, 5, 6)).rejects.toThrow(/permission/i); // device B: same +1 from stale 5
  });

  it("allows edits that keep the quantity, without a movement", async () => {
    const id = await createOne(5);
    await expect(
      setDoc(doc(itemsCol(), id), { ...item(5), price: 12 }, { merge: true })
    ).resolves.toBeUndefined();
  });

  it("keeps movements immutable", async () => {
    const id = await createOne(5);
    const moveId = await change(id, 5, 4);
    await expect(
      setDoc(doc(movesCol(), moveId), { note: "edited" }, { merge: true })
    ).rejects.toThrow(/permission/i);
    await expect(deleteDoc(doc(movesCol(), moveId))).rejects.toThrow(/permission/i);
  });
});
