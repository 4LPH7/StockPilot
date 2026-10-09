# Phase 2: Core Inventory Enhancements - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-10-09
**Phase:** SP-02-core-inventory-enhancements
**Areas discussed:** Low-Stock Thresholds & Alerting, Stock Movement Audit Trail, Bulk CSV/Excel Catalog Import, Catalog Filtering & Search

---

## Low-Stock Thresholds & Alerting

| Option | Description | Selected |
|--------|-------------|----------|
| Configurable Per-Item Threshold (Recommended) | Each item has configurable threshold (default 10), table status badges (In Stock / Low Stock / Out of Stock), and Low Stock Alerts KPI card | ✓ |
| Global Threshold | Hardcoded threshold (e.g. quantity <= 5) without item-specific custom values | |

**User's choice:** Configurable Per-Item Threshold.
**Notes:** Provides flexibility for items with different reorder points (e.g., fast-moving vs slow-moving inventory).

---

## Stock Movement Audit Trail

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Subcollection /movements (Recommended) | Immutable log in `/users/{uid}/movements` with interactive timeline modal/drawer | ✓ |
| Embedded History Array | History stored in item document array | |

**User's choice:** Dedicated `/users/{uid}/movements` subcollection.
**Notes:** Avoids document size limits and guarantees immutability via Firestore rules.

---

## Bulk CSV / Excel Catalog Import

| Option | Description | Selected |
|--------|-------------|----------|
| Drag-and-Drop with Preview Modal (Recommended) | CSV/XLSX file upload with SheetJS, pre-commit validation preview table, sample template | ✓ |
| Direct CSV Upload | Unvalidated instant CSV upload without review | |

**User's choice:** Drag-and-Drop with Preview Modal.
**Notes:** Protects against bad data imports by letting the user review parsed records and validation errors before committing.

---

## Catalog Filtering & Search

| Option | Description | Selected |
|--------|-------------|----------|
| Integrated Multi-Filter Bar (Recommended) | Category dropdown, stock status dropdown (All / Low / Out / In), and search input | ✓ |
| Category Tabs | Horizontal tab bar above table | |

**User's choice:** Integrated Multi-Filter Bar.
**Notes:** Compact, responsive layout that handles growing categories without tab overflow issues.

---

## the agent's Discretion

- Styling and visual design of the Movement History dialog.
- Badge variant mappings for stock status.
- Batch write strategy for imported items.

## Deferred Ideas

- Vitest unit test suite (Phase 3).
- Playwright E2E automation (Phase 3).
- GitHub Actions CI workflow (Phase 3).

---

*Phase: SP-02-core-inventory-enhancements*
*Discussion log generated: 2026-10-09*
