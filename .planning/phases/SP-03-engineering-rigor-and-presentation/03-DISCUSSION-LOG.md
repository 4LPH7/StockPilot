# Phase 3 Discussion Log: Engineering Rigor & Presentation

**Date:** 2026-10-09
**Status:** Completed & Locked

## Areas Discussed & Locked

### 1. Test Runner Stack
- **Proposal:** Vitest for unit tests (math, validation, thresholds) + Playwright for UI flow testing.
- **Alternative:** Vitest only.
- **Decision:** **Vitest + Playwright** (D-01, D-02, D-03, D-04). Vitest gives blazing fast sub-second unit test execution for logic and calculations with zero bundle overhead, while Playwright provides high-fidelity automated smoke verification of critical UI flows.

### 2. GitHub Actions CI Strategy
- **Proposal:** Fast, deterministic CI running typecheck, lint, Vitest unit tests, and Next.js build.
- **Alternative:** Heavy CI suite with browser downloads and emulator setup.
- **Decision:** **Lightweight, bulletproof CI** (D-05). GitHub Actions executes `npm run typecheck`, `npm run lint`, `npm test` (Vitest), and `npm run build` on every push/PR to `main`. Fast feedback loop (< 2 minutes), no runner flakiness.

### 3. Firebase Emulator Configuration
- **Proposal:** `firebase.json` emulator configuration for Auth (port 9099) and Firestore (port 8080), plus conditional connection in `src/firebase/config.ts` and dev scripts.
- **Alternative:** Documentation-only without config files.
- **Decision:** **Full local emulator support** (D-06, D-07, D-08). Enables contributors to develop completely offline without connecting to live Firebase Cloud services.

### 4. Accessibility & Mobile Usability
- **Decision:** Audit and upgrade touch target dimensions to min 44x44px and ensure explicit ARIA tags on icon buttons to provide an effortless experience for storeroom warehouse mobile usage (D-09, D-10).

### 5. Portfolio README Showcase
- **Decision:** Update `README.md` with CI status badge, detailed test execution instructions, local emulator setup commands, and architecture diagrams (D-11).
