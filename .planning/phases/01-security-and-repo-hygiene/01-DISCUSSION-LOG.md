# Phase 1: Security, Auth & Repository Hygiene - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-10-08
**Phase:** 01-security-and-repo-hygiene
**Areas discussed:** Identity & Branding, Deployment Target, Authentication & Data Security Model, Roadmap Phasing

---

## Identity & Branding

| Option | Description | Selected |
|--------|-------------|----------|
| StockPilot (Recommended) | Standardize all branding across Header, package.json, layout metadata, and docs on StockPilot | ✓ |
| Investo / Invisto | Rebrand whole repo and metadata to Investo | |

**User's choice:** Standardize everything on StockPilot.
**Notes:** Resolved inconsistencies where folder is StockPilot, header was Investo, package.json was nextn, and Netlify domain was invisto.

---

## Deployment Target

| Option | Description | Selected |
|--------|-------------|----------|
| Netlify (Recommended) | Retain netlify.toml and remove apphosting.yaml | ✓ |
| Firebase App Hosting | Retain apphosting.yaml and remove netlify.toml | |

**User's choice:** Netlify.
**Notes:** Netlify is already active with live deployment configuration; redundant Firebase App Hosting config to be removed.

---

## Authentication & Firestore Security Model

| Option | Description | Selected |
|--------|-------------|----------|
| Real Auth + Per-User Subcollections (Recommended) | Google/Email auth, data under `/users/{uid}/items`, strict owner check and field validation | ✓ |
| Anonymous sandbox | Retain auto-anonymous login but isolate data per anonymous UID | |
| Shared root collection with ownerId | Keep `/items` root with `ownerId` field check | |

**User's choice:** Real Auth + Per-User Subcollections (`/users/{uid}/items/{itemId}`).
**Notes:** Guarantees zero cross-tenant contamination, prevents unauthenticated data wiping, and satisfies production portfolio standards.

---

## Roadmap Phasing

| Option | Description | Selected |
|--------|-------------|----------|
| 3-Phase Roadmap (Recommended) | Phase 1 (Security & Hygiene) → Phase 2 (Core Inventory Features) → Phase 3 (Testing & Presentation) | ✓ |
| Security Only | Execute only security rules and stop | |
| Single Mega-Phase | Execute all 6 review areas at once | |

**User's choice:** 3-Phase Roadmap, starting with Phase 1.
**Notes:** Allows systematic, verifiable execution with high quality gates at each milestone.

---

## the agent's Discretion

- UI design and layout of Auth trigger and modal dialog in Header.
- Exact validation helper structure in `firestore.rules`.
- Visual design of the unauthenticated state on the main dashboard.

## Deferred Ideas

- Low-stock threshold badges and alert summary cards (Phase 2).
- Stock movement audit trail logging (Phase 2).
- Category filtering dropdown and CSV/Excel import (Phase 2).
- Vitest unit test suite and Playwright E2E automation (Phase 3).
- GitHub Actions CI workflow (Phase 3).

---

*Phase: 01-security-and-repo-hygiene*
*Discussion log generated: 2026-10-08*
