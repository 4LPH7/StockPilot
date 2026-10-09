# 📦 StockPilot

[![CI](https://github.com/4LPH7/StockPilot/actions/workflows/ci.yml/badge.svg)](https://github.com/4LPH7/StockPilot/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-FCC72B?style=flat&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.50-2EAD33?style=flat&logo=playwright)](https://playwright.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=flat&logo=netlify)](https://invisto.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **StockPilot** is an enterprise-grade, real-time inventory telemetry and stock auditing platform. Built with Next.js 15, React 19, and Firebase Firestore, it delivers bank-grade multi-tenant data isolation, immutable movement audit trails, proactive low-stock alerting, in-browser spreadsheet ingestion, and comprehensive financial analytics.

🔗 **Live Demo:** [invisto.netlify.app](https://invisto.netlify.app)

---

## ✨ Key Capabilities

- **🔐 Bank-Grade Per-User Data Isolation:** Every user's catalog and movement history are strictly partitioned under `/users/{uid}/items` and `/users/{uid}/movements`. Zero cross-tenant data exposure.
- **📜 Immutable Stock Movement Audit Trail:** Complete tamper-proof change history (`allow update, delete: if false`). Every creation, restock, reduction, or deletion is logged with transition deltas and timestamps, viewable in an interactive timeline modal.
- **⚠️ Configurable Low-Stock Alerting:** Per-item configurable alert thresholds with dynamic table status badges (`In Stock`, `Low Stock`, `Out of Stock`) and a dedicated dashboard restock alerts KPI card.
- **📊 Financial Analytics Dashboard:** Reactive telemetry computing Total Valuation, Unit Counts, Low Stock Alerts, Top 5 Assets by Value (Bar Chart), and Category Allocation (Donut Chart).
- **🔎 Multi-Criteria Catalog Filtering:** Synchronized real-time filtering across Category dropdown, Stock Health Status dropdown, and keyword search across item names, categories, and descriptions.
- **📥 In-Browser Spreadsheet Import (.csv & .xlsx):** SheetJS-powered catalog import with automatic header alias normalization, Zod row-level schema validation, pre-commit validation preview tabs (valid vs. rejected with error explanations), and sample template download.
- **📱 Storeroom Mobile Ergonomics:** Engineered for storeroom warehouse usage on phones and tablets with WCAG-compliant touch targets (min 44px) and full ARIA accessibility.
- **💱 Dual-Currency Support:** Instantaneous one-click conversion between INR (₹) and USD ($).

---

## 🏗️ Architecture & Security Model

```
Browser Client (Next.js 15 App Router + React 19)
  │
  ├──> Header (Auth Controls, User Profile, Currency Switcher)
  ├──> InventoryStats (Domain Valuations, KPI Cards, Recharts Telemetry)
  ├──> InventoryActions (Search, Category/Status Dropdowns, Audit Log, Import, Export)
  └──> InventoryTable (Interactive Stock Table, Edit/Delete Modals, Dynamic Badges)
         │
         ├──> Firebase Auth
         │      └──> Google / Email / Anonymous Session (User UID)
         │
         └──> Cloud Firestore (Owner-Only Security Rules)
                ├── /users/{userId}/items/{itemId}
                │     ├── allow read, write: if request.auth.uid == userId
                │     └── isValidItem: strict types, ranges (price >= 0, qty >= 0, threshold >= 0)
                │
                └── /users/{userId}/movements/{movementId}
                      ├── allow read, create: if request.auth.uid == userId
                      └── allow update, delete: if false  <-- IMMUTABLE AUDIT TRAIL
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (Turbopack, App Router) |
| **Language & Typing** | TypeScript 5 (Strict Mode) |
| **UI Components** | React 19, Radix UI Primitives, Lucide Icons |
| **Styling** | Tailwind CSS, class-variance-authority |
| **Analytics & Charts** | Recharts (Responsive Bar & Donut Visualizations) |
| **Database & Auth** | Google Firebase (Firestore & Auth SDK v11) |
| **Spreadsheet Engine** | SheetJS (`xlsx`) for CSV/XLSX parsing and generation |
| **Validation** | Zod v3 Schema Validation, React Hook Form |
| **Unit Testing** | Vitest 3, jsdom |
| **E2E Testing** | Playwright Test |
| **CI Automation** | GitHub Actions (`.github/workflows/ci.yml`) |
| **Deployment** | Netlify (`@netlify/plugin-nextjs`) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Firebase project (or use the local Firebase Emulator)

### 1. Clone & Install

```bash
git clone https://github.com/4LPH7/StockPilot.git
cd StockPilot
npm install
```

### 2. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env.local
```

Populate your Firebase configuration in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Local Firebase Emulator (Offline Sandboxing)

StockPilot includes full local emulator support via `firebase.json` for development and automated testing without hitting cloud infrastructure:

```bash
# 1. Start local Firebase Emulators (Auth on 9099, Firestore on 8080, UI on 4000)
npm run emulators

# 2. Run Next.js with emulator connection enabled
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npm run dev
```

---

## 🚦 Quality Gates & Automated Testing

StockPilot enforces strict testing and type verification:

```bash
# Run unit tests (Vitest sub-second test runner)
npm test

# Run unit tests in watch mode
npm run test:watch

# Run Playwright end-to-end smoke tests
npm run test:e2e

# Run TypeScript strict type verification
npm run typecheck

# Run Next.js ESLint checks
npm run lint

# Build optimized production bundle
npm run build
```

### Continuous Integration (GitHub Actions)

Every pull request and push to `main` triggers `.github/workflows/ci.yml` running:
1. TypeScript strict typecheck (`npm run typecheck`)
2. ESLint code validation (`npm run lint`)
3. Vitest unit test suite execution (`npm test`)
4. Production bundle compilation (`npm run build`)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
