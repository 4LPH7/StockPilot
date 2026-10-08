# 📦 StockPilot

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=flat&logo=netlify)](https://invisto.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **StockPilot** is a real-time web inventory management system designed for businesses and store operators. Built with Next.js 15 App Router, React 19, and Firebase Firestore, it provides multi-tenant data isolation, real-time financial telemetry, currency conversion, and instantaneous catalog exports.

🔗 **Live Demo:** [invisto.netlify.app](https://invisto.netlify.app)

---

## ✨ Features

- **🔐 Bank-Grade Data Isolation:** Every user's catalog is segregated into personal Firestore subcollections (`/users/{uid}/items/{itemId}`). Zero cross-tenant data leakage.
- **🛡️ Strict Server-Side Validation:** Firestore security rules validate data types, non-negative quantities, pricing, and string lengths before writes commit.
- **⚡ Real-Time Telemetry & Sync:** Instantaneous updates across devices using Firebase Firestore real-time listeners.
- **📊 Financial Analytics Dashboard:** Reactive KPI cards for Total Valuation, Stock Units, Top 5 Items by Value (Bar Chart), and Category Allocation (Donut Chart).
- **💱 Multi-Currency Engine:** Seamless one-click switching between INR (₹) and USD ($) with automatic recalculation.
- **🔑 Flexible Authentication:** Support for Google Sign-In, Email/Password authentication, and an instant Guest Sandbox session.
- **📥 Excel Data Export:** One-click XLSX export of current catalog with calculated valuations.
- **🎨 Modern Dark UI:** Designed with shadcn/ui, Radix primitives, and Tailwind CSS.

---

## 🏗️ Architecture

```
User (Browser Client)
  ├──> Next.js 15 App Router (React 19 + Turbopack)
  │      ├──> Header (Auth Controls & Currency Toggle)
  │      ├──> InventoryStats (Recharts Analytics)
  │      ├──> InventoryActions (Search & XLSX Export)
  │      └──> InventoryTable (CRUD & Modal Dialogs)
  │
  ├──> Firebase Auth
  │      └──> Google / Email / Anonymous Session (User UID)
  │
  └──> Cloud Firestore (Scoped Data Security)
         └──> /users/{userId}/items/{itemId}
                ├── Owner Read/Write Rule: request.auth.uid == userId
                └── Field Validation: isValidItem(data)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (Turbopack, App Router) |
| **UI Library** | React 19, Radix UI Primitives, Lucide Icons |
| **Styling** | Tailwind CSS, class-variance-authority, tailwindcss-animate |
| **Charts** | Recharts (Responsive Bar & Pie Charts) |
| **Database & Auth** | Google Firebase (Firestore & Authentication SDK v11) |
| **Form Validation** | Zod v3, React Hook Form |
| **Data Export** | SheetJS (xlsx) |
| **Hosting & CI** | Netlify (`@netlify/plugin-nextjs`) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- A Firebase project with Authentication & Firestore enabled

### 1. Clone the repository

```bash
git clone https://github.com/your-username/StockPilot.git
cd StockPilot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your Firebase project credentials in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. Deploy Firestore Security Rules

Deploy the included `firestore.rules` to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

### 5. Run the local development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality Scripts

- **Typecheck:** `npm run typecheck` - Validates TypeScript types across the entire project.
- **Lint:** `npm run lint` - Runs Next.js ESLint validation.
- **Build:** `npm run build` - Compiles and optimizes production assets.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
