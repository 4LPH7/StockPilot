# Phase 3: Engineering Rigor & Presentation - Research

**Researched:** 2026-10-09
**Domain:** Automated Testing, CI Automation, Firebase Emulation, Accessibility & Documentation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01 & D-02:** Vitest for sub-second logic & calculation unit tests (`import-utils.test.ts`, calculation math, threshold boundaries).
- **D-03 & D-04:** Playwright for automated E2E smoke testing of critical catalog workflows (`playwright.config.ts`, `e2e/catalog-flow.spec.ts`).
- **D-05:** Fast, deterministic GitHub Actions CI workflow running `typecheck`, `lint`, `test`, and `build` on every push/PR to `main`.
- **D-06, D-07, D-08:** Local Firebase Emulator configuration (`firebase.json`, `connectFirestoreEmulator`, `connectAuthEmulator`) for offline development.
- **D-09 & D-10:** Storeroom mobile accessibility (min 44px tap targets, semantic ARIA labels).
- **D-11:** Portfolio-grade README showcase with live CI status badge, local development guides, and architecture explanations.

</user_constraints>

<standard_stack>
## Standard Stack

### Testing Stack
| Package | Version Range | Purpose |
|---------|---------------|---------|
| `vitest` | `^3.0.0` | Ultra-fast Vite-native unit test runner |
| `@testing-library/react` | `^16.0.0` | React component and hook testing utilities |
| `jsdom` | `^26.0.0` | Headless DOM environment for Vitest |
| `@playwright/test` | `^1.50.0` | Browser automation and end-to-end smoke testing |

### CI & Dev Tooling
| Tool | Configuration | Purpose |
|------|---------------|---------|
| GitHub Actions | `.github/workflows/ci.yml` | Multi-step quality gate (typecheck, lint, test, build) |
| Firebase CLI / Emulator | `firebase.json` | Local emulators for Auth (9099) and Firestore (8080) |

</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Testing Separation Pattern
```
Tests
├── Unit Tests (Vitest)
│   ├── src/lib/import-utils.test.ts (CSV/XLSX parsing, alias normalization, Zod validation)
│   ├── src/lib/inventory-calculations.test.ts (Aggregation, currency conversions, sorting)
│   └── src/lib/stock-status.test.ts (Threshold boundaries: Out of Stock, Low Stock, In Stock)
└── End-to-End Tests (Playwright)
    └── e2e/catalog-flow.spec.ts (Catalog UI, search/filters, modal interactions)
```

### GitHub Actions Pipeline
```
GitHub Push / PR
  └──> actions/checkout@v4
         └──> actions/setup-node@v4 (Node 20, npm cache)
                └──> npm ci
                       ├──> npm run typecheck (tsc --noEmit)
                       ├──> npm run lint (next lint)
                       ├──> npm test (vitest run)
                       └──> npm run build (next build)
```

### Emulator Conditional Connection Flow
```
Firebase Init (src/firebase/config.ts)
  └──> Check process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
         ├── YES -> connectFirestoreEmulator(localhost:8080) & connectAuthEmulator(localhost:9099)
         └── NO  -> connect to live Firebase Cloud project
```
</architecture_patterns>
