# Phase 2: Core Inventory Enhancements - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver critical operational features for inventory management: configurable low-stock thresholds with status badges and dashboard KPI alerts, an immutable stock movement audit trail (`/users/{uid}/movements`) with an interactive timeline modal, enhanced category and stock status filtering, and bulk CSV/Excel catalog import with pre-commit validation preview.

</domain>

<decisions>
## Implementation Decisions

### Low-Stock Thresholds & Alerting
- **D-01:** Extend `InventoryItem` type with optional `lowStockThreshold?: number` (defaults to 10 when unset). In `add-item-dialog.tsx` and `edit-item-dialog.tsx`, add a number input for "Low Stock Alert Threshold" with Zod validation.
- **D-02:** In `InventoryTable`, add a visual "Status" column or badge beside item quantity:
  - `Out of Stock` (destructive badge) when `quantity === 0`.
  - `Low Stock` (amber/warning badge) when `quantity > 0 && quantity <= (item.lowStockThreshold || 10)`.
  - `In Stock` (secondary/success badge) when `quantity > (item.lowStockThreshold || 10)`.
- **D-03:** In `InventoryStats`, add a dedicated "Low Stock Alerts" card displaying the number of items currently low or out of stock, linking attention directly to items needing restock.

### Stock Movement Audit Trail
- **D-04:** Create an immutable subcollection at `/users/{userId}/movements/{movementId}` with schema:
  - `id`: string
  - `itemId`: string
  - `itemName`: string
  - `type`: "addition" | "restock" | "reduction" | "sale" | "adjustment" | "creation" | "deletion"
  - `delta`: number (positive for increases, negative for decreases)
  - `previousQuantity`: number
  - `newQuantity`: number
  - `timestamp`: timestamp string / number
  - `note`: optional string
- **D-05:** Update `firestore.rules` to allow `isOwner(userId)` to read and create movements. Disallow update and delete operations so the audit log cannot be modified or erased.
- **D-06:** Whenever an item is created, edited (with quantity delta), or deleted via `use-inventory.ts`, record a corresponding movement entry.
- **D-07:** Provide an interactive "Movement History" dialog in the UI displaying recent stock operations chronologically with filterable/searchable history.

### Catalog Filtering & Search
- **D-08:** Enhance `InventoryActions` with a Category selector dropdown ("All Categories" + categories from `inventory-data.ts`) and a Stock Status dropdown ("All Items", "Low Stock", "Out of Stock", "In Stock").
- **D-09:** Search filtering in `page.tsx` evaluates name, category, and description concurrently with active dropdown filters.

### Bulk CSV / Excel Catalog Import
- **D-10:** Add an "Import Catalog" action in `InventoryActions` that accepts `.csv` and `.xlsx` files using `xlsx`.
- **D-11:** Implement a Pre-Import Preview Modal: parses uploaded rows, validates required fields (Name, Quantity, Price, Category), displays valid vs invalid counts with error explanations, and allows the user to click "Confirm & Import" to commit valid items in batch to Firestore and record initial movement records.
- **D-12:** Provide a downloadable sample CSV template so users know the expected column layout (`Name`, `Category`, `Price`, `Quantity`, `Threshold`, `Description`).

### the agent's Discretion
- Exact visual layout and animation of the Movement History dialog/drawer.
- Visual badge colors and iconography for status tags.
- Batch commit strategy (parallel non-blocking writes or Firestore writeBatch).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing:**

### Types & Data Hooks
- `src/types/inventory.ts` - Item and movement type definitions.
- `src/hooks/use-inventory.ts` - Core inventory hook to update with movement tracking and import support.
- `src/lib/inventory-data.ts` - Category definitions and defaults.

### UI Components
- `src/components/inventory/inventory-actions.tsx` - Search bar, category filter, stock status filter, export, and import triggers.
- `src/components/inventory/inventory-table.tsx` - Table rendering items with status badges.
- `src/components/inventory/inventory-stats.tsx` - Stats dashboard to receive Low Stock KPI card.
- `src/components/inventory/add-item-dialog.tsx` - Creation dialog to receive threshold input.
- `src/components/inventory/edit-item-dialog.tsx` - Edit dialog to receive threshold input and track quantity delta.

### Security Rules
- `firestore.rules` - Enforce immutable access for `/users/{userId}/movements/{movementId}`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `xlsx`: Already installed in `package.json` and utilized in `inventory-actions.tsx` for export.
- `src/components/ui/select.tsx`: Existing select component ready for Category and Status dropdowns.
- `src/components/ui/dialog.tsx`: Existing modal dialog ready for Import Preview and Movement History.
- `src/components/ui/badge.tsx`: Existing badge ready for In Stock / Low Stock / Out of Stock indicators.
- `src/hooks/use-toast.ts`: Toast notifications for import success and alerts.

### Established Patterns
- User data isolation under `/users/{user.uid}/...`.
- Client components using `"use client"`.
- Zod form validation with `react-hook-form`.

### Integration Points
- `firestore.rules`: Add match rule for `/users/{userId}/movements/{movementId}` allowing create and read for `isOwner(userId)`.
- `src/app/page.tsx`: Pass category and status filter states from `InventoryActions` down to filtered inventory view.

</code_context>

<deferred>
## Deferred Ideas

- **Phase 3:** Automated unit tests (Vitest) for calculation logic, threshold status determination, and import parsing.
- **Phase 3:** Playwright end-to-end testing for add/edit/import/filter flows.
- **Phase 3:** GitHub Actions CI workflow (lint, typecheck, build on push/PR).

</deferred>

---

*Phase: SP-02-core-inventory-enhancements*
*Context gathered: 2026-10-09*
