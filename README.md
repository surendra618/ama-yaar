# AMA-YAAR

E-commerce marketplace platform. MERN stack, backend organized as a **modular monolith**, frontend/admin organized **feature-wise**.

Full functional spec: [PROJECT_SPEC.md](./PROJECT_SPEC.md)

## Structure

```
ama-yaar/
├── backend/    Node.js + Express modular monolith (REST API, MongoDB/Mongoose)
├── frontend/   Customer website — React + Vite + Redux Toolkit + Tailwind (feature folders)
└── admin/      Admin panel — React + Vite + Redux Toolkit + Tailwind (feature folders)
```

## Backend module map

Each business capability lives in `backend/src/modules/<name>/` with its own
model, service, controller, routes, and validation — one folder per domain,
one Express app, one deployable unit (modular monolith, not microservices).

Modules: `auth, user, product, category, cart, wishlist, order, payment,
review, coupon, banner, address, returnRequest, notification, admin,
upload, report`.

## Getting started

```bash
npm install                     # installs all three workspaces
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
npm run dev                     # runs backend + frontend + admin together
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Admin: http://localhost:5174

## Status

Structural scaffold only — routes, models (with field shapes from the spec),
and stubbed controllers/services/pages are wired end-to-end, but business
logic (payment integration, order flow, analytics, etc.) is not yet
implemented. Each stub is marked `// TODO`.
