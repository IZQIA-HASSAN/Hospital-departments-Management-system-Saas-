# Round

**Round** is a hospital staff management platform that helps hospital admins set up their facility, manage staff schedules, and keep track of patient activity across ICU, OPD, and Emergency departments — all from one dashboard.

> ⚠️ This project is in active local development. No public deployment yet.

---

## What it does

- **Two account types, two experiences.** Admins set up and run a hospital; staff (nurses, doctors, etc.) join via invite and manage their own shifts and account.
- **Hospital setup in minutes.** An admin creates their hospital profile (name, address, city, phone) right from the dashboard — no separate onboarding flow to hunt down.
- **Invite-based staff onboarding.** Staff join through a tokenized invite link, which locks their role and ties them to the right hospital automatically.
- **Live department snapshots.** ICU, OPD, and Emergency charts give admins an at-a-glance read on patient activity per department.
- **Self-service account settings.** Every user can update their email and password; admins can additionally edit their hospital's info — all without needing another admin to intervene.
- **Session-aware, not just token-aware.** Auth state is synced against the server on load (not just trusted from a local cache), so the UI never lies to you about who's actually logged in.

---

## Tech stack

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router (`react-router-dom`)
- TanStack Query (`@tanstack/react-query`) for server state / caching
- GSAP for auth-screen animation
- `lucide-react` for icons

**Backend**
- Node.js (ESM) + Express
- Sequelize ORM
- JWT authentication via httpOnly cookies, with automatic refresh-on-401
- `bcryptjs` for password hashing
- `zod` for request validation

---

## Project structure

```
backend/
  app-backend/
    controllers/     # route handlers (auth, settings, hospital, staff, ICU/OPD/emergency)
    middleware/       # protect (auth), authorize (role check), resolveHospitalId
    models/            # Sequelize models
    routes/            # Express routers
    schemas/            # zod validation schemas
    server.js

frontend/
  src/
    api/                # centralized fetch layer (apiClient, authApi, settingsApi, hospitalApi)
    context/             # AuthContext / useAuth hook
    pages/                # route-level pages (Signup, Login, Admin dashboard, Staff dashboard, Settings)
    components/            # shared + feature components (charts, settings forms, etc.)
```

---

## Authentication model

Round uses **httpOnly cookie–based JWT auth** with a refresh flow:

1. On login/signup, the server sets an httpOnly `accessToken` cookie — never exposed to client-side JavaScript, closing off the usual XSS-token-theft vector.
2. A lightweight, non-sensitive **display object** (name, email, role) is cached in `localStorage` so the UI can render instantly without waiting on a network round trip.
3. On app load, the frontend calls `GET /api/auth/me` to reconcile that cached display object against the real server-side session — so a revoked or expired session doesn't leave the UI showing a stale "logged in" state.
4. If an API call returns `401`, the client automatically attempts a token refresh and retries the original request once, before giving up.

Two account types exist at the token level: `admin` and `staff`. Staff members carry an additional `title` field (e.g. "Ward Nurse", "Doctor") for display purposes — this is not a separate access-control tier.

---

## Getting started

### Prerequisites
- Node.js
- A running database instance compatible with your Sequelize config

### Backend

```bash
cd backend/app-backend
npm install
npm run dev
```

Set up your environment variables (create a `.env` in `backend/app-backend/`):

```
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
DATABASE_URL=your_database_connection_string
```

*(Adjust variable names above to match your actual `config/` setup.)*

### Frontend

```bash
cd frontend
npm install
npm run dev
```

By default the frontend expects the backend at `http://localhost:5000`.

---

## Roadmap / known follow-ups

- [ ] Route-level guarding (`<ProtectedRoute>`) for pages that currently assume an authenticated session
- [ ] Consolidate hospital read/create/update endpoints under a single `/api/hospitals` router
- [ ] Staff scheduling / shift assignment UI
- [ ] Notifications for shift changes and emergency alerts

---

## License

No license yet — private/internal project for now.
