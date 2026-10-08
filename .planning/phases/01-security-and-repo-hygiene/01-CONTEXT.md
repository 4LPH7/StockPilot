# Phase 1: Security, Auth & Repository Hygiene - Context

**Gathered:** 2026-10-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Secure user inventory with Firestore per-user data isolation and server-side schema validation, introduce proper authentication (Google/Email sign-in), externalize Firebase configuration credentials into environment variables, clean up Firebase Studio leftovers (`.idx`, `.modified`, `apphosting.yaml`), standardize application identity to StockPilot, and rewrite the README into a high-converting portfolio presentation.

</domain>

<decisions>
## Implementation Decisions

### Data Architecture & Firestore Security
- **D-01:** Migrate inventory items from the flat `/items/{itemId}` root collection to per-user isolated subcollections:
  `/users/{uid}/items/{itemId}`
  Public read is completely disabled. Only the authenticated owner (`request.auth.uid == uid`) can read, list, create, update, or delete items.
- **D-02:** Implement strict schema and type validation in `firestore.rules`:
  - `name`: string, 1 to 100 characters.
  - `description`: optional string, max 500 characters.
  - `category`: string, non-empty, max 50 characters.
  - `quantity`: non-negative integer (`quantity >= 0`).
  - `price`: non-negative number (`price >= 0`).
  - Strict field allowlist preventing arbitrary extra document properties.

### Authentication & User Experience
- **D-03:** Implement real Firebase Authentication support:
  - Google Sign-In and Email/Password authentication.
  - Header displays user status: when logged in, shows user Avatar / email and a "Sign Out" option; when logged out, shows a "Sign In" button that opens an auth dialog.
  - Unauthenticated visitors see an inviting landing prompt explaining the app and prompting them to sign in to access or create their private inventory.

### Credential Security & Environment Configuration
- **D-04:** Externalize all Firebase configuration credentials in `src/firebase/config.ts` to `process.env.NEXT_PUBLIC_FIREBASE_*`.
- **D-05:** Create `.env.example` with documented environment variable keys.
- **D-06:** Ensure `.gitignore` covers `.env`, `.env.local`, and all variants.

### Repository Cleanup & Deployment Standard
- **D-07:** Standardize on Netlify as the primary deployment target (`netlify.toml`). Delete `apphosting.yaml`.
- **D-08:** Delete Google Project IDX / Firebase Studio artifacts (`.idx/` directory and `.modified` file) and add `.idx/` and `.modified` to `.gitignore`.

### Branding & Documentation
- **D-09:** Standardize app name to **StockPilot** across all components:
  - Header brand text updated from "Investo" to "StockPilot".
  - `package.json` name updated from `"nextn"` to `"stockpilot"`.
  - App metadata in `src/app/layout.tsx` updated to "StockPilot - Modern Inventory Management".
- **D-10:** Completely rewrite `README.md` to replace the "Firebase Studio starter" text with a comprehensive portfolio README featuring:
  - Value proposition and one-line elevator pitch.
  - Tech stack overview (Next.js 15, Turbopack, React 19, Tailwind CSS, shadcn/ui, Firebase).
  - Key features list and architecture overview.
  - Step-by-step local setup instructions with `.env` guide.
  - Live Netlify demo link.

### the agent's Discretion
- UI design and layout of the Auth modal / dropdown in `src/components/layout/header.tsx` using shadcn components.
- Exact helper function names in `firestore.rules` (`isValidItem()`, `isOwner()`, etc.).
- Styling of the unauthenticated empty/prompt state on the main dashboard.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing:**

### Security & Firestore Rules
- `firestore.rules` - Existing insecure ruleset to be replaced with user-scoped validated rules.
- `src/firebase/config.ts` - Hardcoded configuration to be migrated to environment variables.
- `src/firebase/provider.tsx` - Firebase React Context providing Auth and Firestore instances.

### Data Hooks & Application State
- `src/hooks/use-inventory.ts` - Core inventory hook to update to user-scoped subcollection `/users/{uid}/items`.
- `src/app/page.tsx` - Main page rendering layout, stats, actions, and inventory table.

### Branding & Configuration
- `src/components/layout/header.tsx` - Header component requiring branding update and Auth UI integration.
- `package.json` - Project metadata requiring package name update.
- `netlify.toml` - Netlify deployment configuration.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/dialog.tsx`, `dropdown-menu.tsx`, `avatar.tsx`, `button.tsx`: Existing shadcn UI components ready for Auth integration.
- `src/components/inventory/add-item-dialog.tsx`: Existing Zod schema defining the expected fields and validation rules.
- `src/lib/placeholder-images.ts`: Existing placeholder images for empty states.

### Established Patterns
- Client components using `"use client"`.
- Asynchronous non-blocking updates via `src/firebase/non-blocking-updates.tsx`.
- Toast notifications via `src/hooks/use-toast.ts`.

### Integration Points
- `src/firebase/non-blocking-login.tsx`: Currently handles anonymous sign-in; extend or complement with Google / Email auth helpers.
- `src/hooks/use-inventory.ts`: Change collection reference to `collection(firestore, "users", user.uid, "items")` when authenticated.

</code_context>

<deferred>
## Deferred Ideas

- **Phase 2:** Low-stock threshold badges and alert notifications card.
- **Phase 2:** Stock movement audit trail (`/users/{uid}/movements`) logging every quantity change.
- **Phase 2:** Category filter dropdown and bulk CSV/Excel import.
- **Phase 3:** Vitest logic unit tests and Playwright E2E workflow test.
- **Phase 3:** GitHub Actions CI workflow (lint, typecheck, build).
- **Phase 3:** Open source MIT license and GitHub repository topics polish.

</deferred>

---

*Phase: 01-security-and-repo-hygiene*
*Context gathered: 2026-10-08*
