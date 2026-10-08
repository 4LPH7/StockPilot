# Phase 1: Security, Auth & Repository Hygiene - Research

**Researched:** 2026-10-08
**Domain:** Firebase Authentication, Firestore Security Rules, Next.js 15 Client Configuration, Netlify Deployment
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01: Data Path & Isolation:** Migrate inventory items from `/items/{itemId}` to `/users/{uid}/items/{itemId}`. Public reads disabled. Only the owner (`request.auth.uid == uid`) can read, list, create, update, or delete items.
- **D-02: Security Rules Schema Validation:** Add strict field validation functions in `firestore.rules`:
  - `name`: string, 1 to 100 characters.
  - `description`: optional string, max 500 characters.
  - `category`: string, non-empty, max 50 characters.
  - `quantity`: non-negative integer (`quantity >= 0`).
  - `price`: non-negative number (`price >= 0`).
- **D-03: Authentication Strategy:** Add Google Sign-In and Email/Password authentication. Header shows user status and profile/sign-out actions. Prompt unauthenticated users to sign in.
- **D-04: Credential Externalization:** Move hardcoded credentials from `src/firebase/config.ts` to `process.env.NEXT_PUBLIC_FIREBASE_*`.
- **D-05: Environment Templates:** Create `.env.example` with clear documentation.
- **D-06: Git Hygiene:** Update `.gitignore` to block all `.env` files, `.idx/`, and `.modified`.
- **D-07: Deployment Standardization:** Keep Netlify configuration (`netlify.toml`) and delete Firebase App Hosting (`apphosting.yaml`).
- **D-08: Studio Cleanup:** Delete `.idx/` directory and `.modified` file.
- **D-09: Unified Brand Identity:** Standardize app name to "StockPilot" across Header, `package.json`, layout metadata, and UI.
- **D-10: Documentation Rewrite:** Rewrite `README.md` into a high-converting portfolio presentation.

### the agent's Discretion
- Layout and styling of the Auth dialog in `src/components/layout/header.tsx` using shadcn components.
- Naming of Firestore rule helper functions (`isAuthenticated()`, `isUser(userId)`, `isValidItem()`).
- Landing state presentation when unauthenticated.

### Deferred Ideas (OUT OF SCOPE)
- Low-stock threshold warnings & dashboard alert cards (Phase 2).
- Stock movement audit history subcollection (`/users/{uid}/movements`) (Phase 2).
- Category filtering & CSV/Excel bulk import (Phase 2).
- Vitest unit tests, Playwright E2E automation, and GitHub Actions CI (Phase 3).
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| User Authentication | Client (Next.js) | Firebase Auth Service | Auth trigger happens in browser via Firebase Client SDK; session is verified by Firebase Auth |
| Access Control & Authorization | Database (Firestore Rules) | Client (Next.js) | Server-side enforcement in Firestore security rules guarantees data safety regardless of client behavior |
| Inventory Data Storage | Database (Firestore) | Client (React Hooks) | Real-time listeners bind user subcollections directly to client state |
| Environment Config | Build/Runtime (Next.js) | Client (Process Env) | `NEXT_PUBLIC_*` variables bundled into client build |
| Static Hosting | CDN / Edge (Netlify) | - | Next.js dynamic routing and assets served via Netlify plugin |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 1 establishes the security foundation, identity, and deployment stability for StockPilot. The existing project has active React 19 / Next.js 15 client architecture with Firebase 11 SDK, but was left in an insecure prototype state with anonymous global collection access and exposed credentials.

The standard pattern for multi-tenant Firebase web apps is user-scoped subcollections (`/users/{uid}/items/{itemId}`), secured by Firestore rules checking `request.auth.uid == userId`. Client credentials must be loaded via `NEXT_PUBLIC_FIREBASE_*` variables from `.env.local`. Netlify deployment with `@netlify/plugin-nextjs` is already configured in `netlify.toml`, so removing `apphosting.yaml` eliminates deployment ambiguity.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `firebase` | ^11.9.1 | Auth and Firestore SDK | Standard Google Firebase client SDK |
| `next` | 15.5.9 | React framework (App Router) | High-performance fullstack web framework |
| `zod` | ^3.24.2 | Runtime schema validation | TypeScript-first schema declaration and validation |
| `react-hook-form` | ^7.54.2 | Form state management | Performant, flexible forms with zod resolver |
| `@radix-ui/react-dialog` | ^1.1.6 | Accessible modals | Unstyled accessible primitives for auth dialog |
| `@radix-ui/react-dropdown-menu` | ^2.1.6 | Header user dropdown | Accessible menu for user profile and sign out |

### Environment Variables Required
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Per-User Subcollection Data Flow
```
User (Browser) 
  ├──> Firebase Auth: signInWithPopup(Google) or signInWithEmail
  │      └──> returns User { uid, email, displayName, photoURL }
  │
  ├──> useInventory Hook binds to:
  │      collection(firestore, "users", user.uid, "items")
  │
  └──> Firestore Security Rules:
         match /users/{userId}/items/{itemId}
           - allow read: if request.auth.uid == userId
           - allow write: if request.auth.uid == userId && isValidItem(request.resource.data)
```

### Firestore Security Rule Pattern
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidItem(data) {
      return data.name is string 
        && data.name.size() >= 1 
        && data.name.size() <= 100
        && (data.description == null || (data.description is string && data.description.size() <= 500))
        && data.category is string 
        && data.category.size() >= 1 
        && data.category.size() <= 50
        && data.quantity is int 
        && data.quantity >= 0
        && (data.price is int || data.price is float) 
        && data.price >= 0;
    }

    match /users/{userId}/items/{itemId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && isValidItem(request.resource.data);
      allow update: if isOwner(userId) && isValidItem(request.resource.data);
      allow delete: if isOwner(userId);
    }
  }
}
```

### Anti-Patterns to Avoid
- **Hardcoding Firebase Config:** Storing `apiKey` or `projectId` in tracked JavaScript source files.
- **Top-Level Flat Collection for Multi-Tenant Data:** Storing all user documents in `/items` without subcollection partitioning leads to accidental data leaks and complicated rule queries.
- **Client-Only Validation:** Validating inputs only in React forms with Zod while leaving Firestore rules wide open permits attackers using direct REST/SDK calls to inject invalid or malicious data.
</architecture_patterns>
