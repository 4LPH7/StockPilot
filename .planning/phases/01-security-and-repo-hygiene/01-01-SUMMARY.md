---
phase: 01-security-and-repo-hygiene
plan: "01"
subsystem: security-and-auth
tags: [firebase, firestore-rules, auth, env, security]
provides:
  - Per-user Firestore subcollection data isolation under /users/{uid}/items
  - Server-side schema validation rules in firestore.rules
  - Externalized Firebase credentials via .env.local and .env.example
  - Google, Email, and Guest authentication via AuthDialog and Header
affects: [01-02, inventory-crud, auth]
tech-stack:
  added: []
  patterns: [per-user-data-isolation, non-blocking-auth, env-externalization]
key-files:
  created: [.env.example, src/components/auth/auth-dialog.tsx]
  modified: [firestore.rules, src/firebase/config.ts, src/firebase/non-blocking-login.tsx, src/hooks/use-inventory.ts, src/components/layout/header.tsx, src/app/page.tsx, .gitignore]
key-decisions:
  - "D-01: Isolate catalog data in /users/{uid}/items/{itemId}"
  - "D-02: Enforce strict type and range validations in firestore.rules"
  - "D-03: Implement Google, Email, and Guest auth with account dropdown in header"
  - "D-04: Externalize Firebase config keys into environment variables"
completed: 2026-10-08
status: complete
---

# Plan 01-01 Summary: Security Rules, Per-User Data Isolation, and Authentication

**Hardened database access controls, isolated inventory data per user UID, externalized Firebase configuration to environment variables, and added a multi-provider Authentication modal.**

## Performance & Verification
- **Tasks:** 3 completed
- **Typecheck:** Clean (`tsc --noEmit` passed with 0 errors)
- **Lint:** Clean (`next lint` passed)
- **Build:** Clean (`next build` compiled all routes statically and optimized)

## Changes Delivered
1. **Firestore Rules:** Replaced open write permissions with strict owner checks (`request.auth.uid == userId`) and `isValidItem()` schema checks enforcing non-negative prices, integer quantities, and valid string lengths.
2. **Environment Variables:** Credentials moved from source code to `NEXT_PUBLIC_FIREBASE_*`. Created `.env.example` and committed `.gitignore` protection.
3. **Authentication:** Implemented `AuthDialog` supporting Google popup, Email & Password sign-in/up, and anonymous Guest sandbox mode. Header now features an account dropdown with user avatar and sign-out controls.
4. **Per-User Scoped Data:** Updated `use-inventory.ts` to dynamically bind to `/users/{user.uid}/items` with real-time sync. Unauthenticated visitors are presented with a sign-in card.
