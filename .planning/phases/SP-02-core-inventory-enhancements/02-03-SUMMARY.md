---
phase: SP-02-core-inventory-enhancements
plan: "03"
subsystem: catalog-import-and-batching
tags: [bulk-import, sheetjs, xlsx, csv, pre-commit-validation, writebatch]
provides:
  - In-browser spreadsheet parsing (.csv, .xlsx, .xls) with flexible header normalization
  - Row-level validation using Zod schema
  - Downloadable sample CSV template generator
  - Atomic bulkAddItems with writeBatch chunking and audit movement generation
  - Interactive Pre-Commit Validation Preview modal displaying valid vs rejected items
affects: [use-inventory, inventory-actions, home-page]
tech-stack:
  added: []
  patterns: [in-browser-spreadsheet-parsing, pre-commit-validation-preview, chunked-batch-writes]
key-files:
  created:
    - src/lib/import-utils.ts
    - src/components/inventory/import-dialog.tsx
  modified:
    - src/hooks/use-inventory.ts
    - src/components/inventory/inventory-actions.tsx
    - src/app/page.tsx
key-decisions:
  - "D-10: In-browser spreadsheet ingestion supporting CSV and XLSX formats"
  - "D-11: Pre-commit preview modal displaying valid items alongside rejected rows and error reasons"
  - "D-12: Downloadable sample CSV template with standard column headers"
completed: 2026-10-09
status: complete
---

# Plan 02-03 Summary: Bulk Catalog Import with SheetJS, Pre-commit Validation Preview, and Sample CSV

**Enabled high-speed catalog onboarding through in-browser spreadsheet parsing, pre-commit validation preview, downloadable sample templates, and chunked atomic batch writes with audit trail logging.**

## Performance & Verification
- **Tasks:** 3 completed
- **Typecheck:** Clean (`tsc --noEmit` passed with 0 errors)
- **Lint:** Clean (`next lint` passed)
- **Build:** Clean (`next build` compiled all routes statically in 7.5s)

## Changes Delivered
1. **Spreadsheet Ingestion & Validation:** Created `src/lib/import-utils.ts` parsing `.csv`, `.xlsx`, and `.xls` files directly in-browser. Implemented case-insensitive header normalization (`Name`, `Category`, `Price`, `Quantity`, `Threshold`, `Description`) and row-by-row Zod schema validation.
2. **Template Generator:** Added `downloadSampleCsvTemplate()` allowing users to download a verified CSV template (`stockpilot_inventory_template.csv`) with sample rows in one click.
3. **Atomic Batch Ingestion:** Added `bulkAddItems()` in `use-inventory.ts` using Firestore `writeBatch`. Batches are safely chunked into 200 items (400 operations including audit movements, well within Firestore's 500 operation limit) and committed sequentially with `'creation'` audit records.
4. **Pre-Commit Preview Modal:** Built `ImportDialog` with file dropzone, summary cards (Total, Ready to Import, Rejected), tabs previewing valid items and itemizing rejection causes, and a confirmed import action with loading spinners and toast notifications.
5. **Action Bar Integration:** Connected the "Import" action in `InventoryActions` and wired data flows through `src/app/page.tsx`.
