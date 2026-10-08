# Roadmap: StockPilot

## Overview

Transform StockPilot from a Firebase Studio starter project into a hardened, secure, multi-tenant inventory management system with robust test coverage, rich stock analytics, and portfolio-ready documentation.

## Phases

- [x] **Phase 1: Security, Auth & Repository Hygiene** - Enforce Firestore data isolation, environment variables, real authentication, repo cleanup, and initial README overhaul.
- [ ] **Phase 2: Core Inventory Enhancements** - Implement low-stock alerts, movement audit logs, category filters, and CSV/Excel import.
- [ ] **Phase 3: Engineering Rigor & Presentation** - Add unit & E2E tests, GitHub Actions CI workflow, license, and portfolio polish.

---

## Phase Details

### Phase 1: Security, Auth & Repository Hygiene
**Goal**: Secure user data with Firestore rules and per-user collections, externalize credentials, provide real authentication, clean up legacy Studio files, and standardize on StockPilot branding with Netlify deployment.
**Depends on**: Nothing (first phase)
**Requirements**:
  - SEC-01: Isolate inventory items under `/users/{uid}/items/{itemId}` so no user can access another's catalog.
  - SEC-02: Write Firestore security rules enforcing authentication and strict field validations (types, non-negative quantity/price, string length limits).
  - SEC-03: Move hardcoded Firebase keys in `src/firebase/config.ts` to environment variables (`.env.local`) and provide `.env.example`.
  - AUTH-01: Support user authentication (Google Sign-In / Email auth with clean header UI showing user avatar and sign in/out).
  - CLN-01: Remove legacy `.idx/` directory and `.modified` file, and ensure `.gitignore` excludes them.
  - CLN-02: Retain `netlify.toml` and remove redundant `apphosting.yaml`.
  - BRD-01: Standardize branding to StockPilot across header title, `package.json`, page metadata, and UI.
  - DOC-01: Rewrite `README.md` with product pitch, tech stack, environment variable guide, and setup instructions.
**Success Criteria**:
  1. Unauthenticated users cannot read or modify any inventory data directly in Firestore.
  2. Authenticated users can only read, create, update, and delete their own inventory under `/users/{uid}/items`.
  3. No secrets or project IDs are hardcoded in source files.
  4. Repository is cleanly configured for Netlify without Firebase Studio remnants.
  5. Application branding is consistent as "StockPilot" across UI and metadata.
**Plans**: 2 plans

Plans:
- [x] 01-01: Security Rules, Per-User Data Isolation, and Authentication
- [x] 01-02: Repository Cleanup, Brand Unification, and Portfolio README

### Phase 2: Core Inventory Enhancements
**Goal**: Provide critical inventory workflows including low-stock alerts, stock movement audit trail, category filtering, and bulk data import.
**Depends on**: Phase 1
**Requirements**:
  - STK-01: Add low-stock threshold configuration to items and highlight items below threshold in table & stat cards.
  - AUD-01: Track stock movement history (audit trail for restocks, adjustments, deletions) with timestamps and change deltas.
  - FLT-01: Add category-based filtering dropdown and advanced search in catalog actions.
  - IMP-01: Implement CSV/Excel file import to bulk populate inventory items alongside the existing export.
**Success Criteria**:
  1. Low-stock items are visually highlighted and summarized in a dedicated dashboard stat card.
  2. Changes to item quantities create immutable audit records in a movements subcollection.
  3. Users can filter items by category and import catalogs via CSV or XLSX.

### Phase 3: Engineering Rigor & Presentation
**Goal**: Establish enterprise-grade development standards with automated testing, CI pipeline, accessibility audits, and open-source licensing.
**Depends on**: Phase 2
**Requirements**:
  - TST-01: Implement Vitest unit tests for calculations, conversions, and validation logic.
  - TST-02: Implement Playwright end-to-end test verifying item creation, editing, and stat updates.
  - CI-01: Add GitHub Actions CI workflow running typecheck, lint, and tests on push and PR.
  - POL-01: Add MIT License, GitHub topics, mobile accessibility refinements, and emulator guide.
**Success Criteria**:
  1. Automated tests pass locally and in GitHub Actions CI.
  2. Zero typecheck or linting errors in strict mode.
  3. Full open-source portfolio polish with license and badges.
