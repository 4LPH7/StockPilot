# StockPilot

## What This Is

StockPilot is a modern, real-time web inventory management system built with Next.js 15 (Turbopack, App Router), TypeScript, Tailwind CSS, shadcn/ui, and Firebase (Authentication & Firestore). It empowers businesses and operators to manage stock items, view real-time valuation and category statistics, search and filter catalog data, and export records with bank-grade multi-tenant data isolation.

## Core Value

Reliable, secure, and intuitive inventory tracking where every user's catalog is completely protected and isolated with strict access controls and real-time responsiveness.

## Requirements

### Validated

- Real-time catalog viewing with responsive tabular layout
- Add, update, and delete inventory item operations
- Live financial and inventory analytics (total value, units, top 5 items, category breakdown)
- Multi-currency toggle (INR / USD conversion)
- Excel export of current inventory dataset
- Client-side form validation via Zod and React Hook Form

### Active (Feedback & Hardening Roadmap)

- Strict security rules with per-user data isolation (`/users/{uid}/items/{itemId}`) and server-side schema validation
- Secure Firebase credentials configuration via `.env.local` / `.env.example`
- Production-grade authentication (Google Sign-In / Email authentication alongside guest mode)
- Standardized identity and repository cleanup (unify to StockPilot, remove Firebase Studio artifacts, keep Netlify)
- Low-stock threshold tracking, visual indicators, and dashboard alerts
- Stock movement audit history (`/users/{uid}/movements`)
- Enhanced search, category filters, and CSV/Excel import
- Engineering rigor: Vitest unit tests, Playwright end-to-end tests, and GitHub Actions CI workflow
- Portfolio-grade README with live link, architecture diagram, feature showcase, and setup guide
