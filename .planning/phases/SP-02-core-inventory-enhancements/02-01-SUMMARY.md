---
phase: SP-02-core-inventory-enhancements
plan: "01"
subsystem: inventory-alerts-and-filters
tags: [thresholds, status-badges, alerts, filtering, categories]
provides:
  - Per-item configurable low-stock threshold with default of 10
  - Schema validation in firestore.rules for optional lowStockThreshold
  - Dynamic status badges (Out of Stock, Low Stock, In Stock) in InventoryTable
  - Low Stock Alerts KPI dashboard card in InventoryStats
  - Synchronized Category and Stock Status multi-filter dropdowns in InventoryActions
affects: [02-02, 02-03, inventory-table, inventory-stats, inventory-actions]
tech-stack:
  added: []
  patterns: [threshold-alerting, multi-criteria-filtering, status-tagging]
key-files:
  created: []
  modified:
    - src/types/inventory.ts
    - firestore.rules
    - src/components/inventory/add-item-dialog.tsx
    - src/components/inventory/edit-item-dialog.tsx
    - src/components/inventory/inventory-table.tsx
    - src/components/inventory/inventory-stats.tsx
    - src/components/inventory/inventory-actions.tsx
    - src/app/page.tsx
key-decisions:
  - "D-01: Extend InventoryItem with configurable lowStockThreshold (default 10) in Add and Edit dialogs"
  - "D-02: Display visual status badges (Out of Stock, Low Stock, In Stock) based on quantity vs threshold"
  - "D-03: Add Low Stock Alerts KPI card in InventoryStats with AlertTriangle indicator"
  - "D-08 & D-09: Synchronize Category, Stock Status, and text search filtering across the catalog"
completed: 2026-10-09
status: complete
---

# Plan 02-01 Summary: Low-Stock Thresholds, Status Indicators, and Enhanced Filtering

**Equipped StockPilot with proactive inventory alerting, dynamic status badges, dashboard KPI alerts, and synchronized multi-criteria catalog filtering.**

## Performance & Verification
- **Tasks:** 4 completed
- **Typecheck:** Clean (`tsc --noEmit` passed with 0 errors)
- **Lint:** Clean (`next lint` passed)
- **Build:** Clean (`next build` compiled all routes statically in 19.4s)

## Changes Delivered
1. **Model & Rules Schema:** Extended `InventoryItem` with optional `lowStockThreshold?: number`. Updated `firestore.rules` helper `isValidItem()` to validate optional `lowStockThreshold >= 0`.
2. **Item Dialogs:** Added "Low Stock Alert" input to both `AddItemDialog` and `EditItemDialog` with default value of 10 and Zod integer validation.
3. **Status Badges in Table:** Added a dedicated "Status" column to `InventoryTable` with color-coded badges:
   - `Out of Stock` (destructive badge when `quantity === 0`)
   - `Low Stock` (amber warning badge when `quantity <= lowStockThreshold`)
   - `In Stock` (emerald outline badge when `quantity > lowStockThreshold`)
4. **Dashboard Alerts KPI:** Added a "Low Stock Alerts" metric card to `InventoryStats` featuring the `AlertTriangle` icon and live count of items at or below threshold.
5. **Multi-Filter Navigation:** Added Category and Stock Status dropdown selectors to `InventoryActions`. In `page.tsx`, search terms, categories, and stock health statuses filter concurrently in real time.
