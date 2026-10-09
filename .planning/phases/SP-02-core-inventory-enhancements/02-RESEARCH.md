# Phase 2: Core Inventory Enhancements - Research

**Researched:** 2026-10-09
**Domain:** Inventory Telemetry, Real-time Auditing, SheetJS File Ingestion, Firestore Batching
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Extend `InventoryItem` with `lowStockThreshold?: number` (default 10). Add threshold input to `add-item-dialog.tsx` and `edit-item-dialog.tsx`.
- **D-02:** Add dynamic badges in `InventoryTable`: Out of Stock (0), Low Stock (1 to threshold), In Stock (> threshold).
- **D-03:** Add "Low Stock Alerts" card to `InventoryStats`.
- **D-04:** Dedicated subcollection `/users/{userId}/movements/{movementId}` with full delta, previous/new quantity, and type.
- **D-05:** Security rule: `isOwner(userId)` can read and create movements; updates and deletes are blocked (`allow update, delete: if false`).
- **D-06:** Auto-record movements on item creation, quantity adjustment, and deletion.
- **D-07:** "Movement History" dialog with chronological timeline.
- **D-08 & D-09:** Multi-filter bar with Category dropdown, Stock Status dropdown, and text search.
- **D-10 & D-11:** Bulk CSV/XLSX import with SheetJS and pre-commit validation preview modal.
- **D-12:** Downloadable sample CSV template helper.

### the agent's Discretion
- Layout of Movement History dialog.
- Badge color styling.
- Batch write strategy (`writeBatch`).

### Deferred Ideas (OUT OF SCOPE)
- Vitest unit tests (Phase 3).
- Playwright E2E automation (Phase 3).
- GitHub Actions CI workflow (Phase 3).
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Low-Stock Alerting | Client (React) | Firestore Rules | Client evaluates item quantity vs threshold; rules permit threshold persistence |
| Audit Trail Persistence | Database (Firestore) | Client (React Hooks) | Immutable movement records stored in Firestore subcollection; client dispatches on mutations |
| Audit Trail Immutability | Database (Firestore Rules) | - | Server-side security rule denies updates and deletes |
| Multi-Filter Filtering | Client (React State) | - | In-memory real-time filtering across active dataset |
| File Ingestion & Parsing | Client (SheetJS) | - | In-browser parsing of CSV/XLSX avoiding server upload overhead |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 2 turns StockPilot from a basic CRUD catalog into an operational inventory telemetry tool. The architecture preserves the user isolation established in Phase 1 (`/users/{uid}/...`) while adding two new data capabilities: configurable thresholds and immutable movement auditing.

SheetJS (`xlsx`) is already available in dependencies and provides synchronous parsing of binary array buffers from `<input type="file" />`. Combining this with an interactive preview modal ensures users never commit malformed spreadsheets into their database.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose |
|---------|---------|---------|
| `xlsx` | ^0.18.5 | In-browser CSV and XLSX parsing and template generation |
| `lucide-react` | ^0.475.0 | Alert icons (`AlertTriangle`, `History`, `UploadCloud`, `FileSpreadsheet`) |
| `firebase/firestore` | ^11.9.1 | `writeBatch` for atomic bulk imports and subcollection persistence |
| `zod` | ^3.24.2 | Row-level validation for CSV imports and dialog forms |

### Firestore Security Rule Pattern
```firestore
// Movement logs subcollection
match /users/{userId}/movements/{movementId} {
  allow read: if isOwner(userId);
  allow create: if isOwner(userId);
  allow update, delete: if false; // Immutable audit log
}
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Movement Audit Trail Flow
```
User Action (Add / Edit / Delete)
  ├──> Firestore Update (/users/{uid}/items/{itemId})
  └──> Firestore Create (/users/{uid}/movements/{movementId})
         ├── itemId, itemName, type ('restock' | 'sale' | 'adjustment' | 'creation' | 'deletion')
         ├── delta, previousQuantity, newQuantity
         └── timestamp (Date.now())
```

### Bulk Import Validation Pipeline
```
File Upload (.csv, .xlsx)
  └──> SheetJS ArrayBuffer Parse
         └──> Header Normalization (Name, Category, Price, Quantity, Threshold)
                └──> Row Validation via Zod Schema
                       ├── Valid Rows (green pill, ready for import)
                       └── Invalid Rows (red alert, error reason)
                              └──> User Confirmation -> writeBatch commit to Firestore
```
</architecture_patterns>
