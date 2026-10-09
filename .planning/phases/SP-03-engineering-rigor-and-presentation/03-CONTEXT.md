# Phase 3: Engineering Rigor & Presentation - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish enterprise-grade development quality and portfolio excellence for StockPilot by adding automated Vitest unit test suites, a Playwright end-to-end verification spec, a GitHub Actions continuous integration pipeline, local Firebase Emulator support, storeroom mobile accessibility enhancements, and comprehensive README portfolio documentation with live CI status badges.

</domain>

<decisions>
## Implementation Decisions

### Unit Testing Architecture (Vitest)
- **D-01:** Configure Vitest with `jsdom` and `@testing-library/react` in `vite.config.ts` / `vitest.config.ts`.
- **D-02:** Implement high-coverage unit tests for:
  - `src/lib/import-utils.test.ts`: Header alias normalization, valid and invalid row validation (missing name, negative price, invalid quantity), and sample CSV generation.
  - `src/lib/inventory-calculations.test.ts`: Extract and test currency conversion, total valuation, and unit aggregation logic.
  - `src/lib/stock-status.test.ts`: Verify status categorization (`Out of Stock`, `Low Stock`, `In Stock`) at exact threshold boundaries (`quantity === 0`, `quantity === threshold`, `quantity > threshold`).

### End-to-End Testing (Playwright)
- **D-03:** Configure Playwright in `playwright.config.ts` targeting `http://localhost:3000`.
- **D-04:** Implement `e2e/catalog-flow.spec.ts` covering:
  - Welcome screen and authentication dialog trigger.
  - Action bar interactions: search input, category dropdown, and stock status filtering.
  - Audit log dialog opening and event filtering.
  - Sample CSV template download trigger.

### Continuous Integration (GitHub Actions)
- **D-05:** Create `.github/workflows/ci.yml` running on `push` and `pull_request` targeting `main`:
  - Node.js 20 environment with `npm ci`.
  - Steps:
    1. Typecheck: `npm run typecheck` (`tsc --noEmit`)
    2. Lint: `npm run lint` (`next lint`)
    3. Unit Tests: `npm test` (`vitest run`)
    4. Production Build: `npm run build` (`next build`)

### Local Firebase Emulator Development
- **D-06:** Provide `firebase.json` configuring local emulators:
  - Auth emulator on port 9099.
  - Firestore emulator on port 8080.
  - UI emulator on port 4000.
- **D-07:** In `src/firebase/config.ts`, conditionally connect to emulators (`connectFirestoreEmulator`, `connectAuthEmulator`) if `process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true"`.
- **D-08:** Add npm script `"emulators": "firebase emulators:start"` and `"dev:emulator": "NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true next dev"`.

### Mobile Usability & Storeroom Accessibility
- **D-09:** Audit and refine touch target sizes (minimum 44x44px for buttons, select triggers, and dialog close icons) for storeroom mobile usage on phone viewports.
- **D-10:** Add explicit `aria-label` tags and semantic landmarks on icon-only buttons (`DeleteItemButton`, `EditItemDialog`, `DialogClose`).

### Portfolio README Polish
- **D-11:** Update `README.md` with:
  - Live GitHub Actions CI status badge (`![CI](https://github.com/4LPH7/StockPilot/actions/workflows/ci.yml/badge.svg)`).
  - Test runner guide: instructions for running Vitest and Playwright.
  - Firebase Emulator local offline sandboxing guide.
  - Mobile accessibility and storeroom responsiveness notes.

### The Agent's Discretion
- Organization of test helper mock fixtures.
- Playwright viewport configurations (desktop & mobile emulation).
- Exact badge styles and formatting in README.

</decisions>

<canonical_refs>
## Canonical References

### Tested Modules
- `src/lib/import-utils.ts` - Spreadsheet ingestion, header normalization, and Zod row validation.
- `src/components/inventory/inventory-stats.tsx` - Stats calculation and valuation metrics.
- `src/components/inventory/inventory-table.tsx` - Threshold status badges.
- `src/firebase/config.ts` - Firebase client initialization and emulator hooks.

### Infrastructure & Config
- `package.json` - Test scripts and dependencies (`vitest`, `@testing-library/react`, `@playwright/test`).
- `.github/workflows/ci.yml` - CI pipeline definitions.
- `firebase.json` - Local emulator port bindings and security rules mapping.

</canonical_refs>

<deferred>
## Deferred Ideas

- Visual regression testing with Percy or Applitools (future milestone).
- Full multi-role permissions and organization multi-tenancy (future milestone).

</deferred>

---

*Phase: SP-03-engineering-rigor-and-presentation*
*Context gathered: 2026-10-09*
