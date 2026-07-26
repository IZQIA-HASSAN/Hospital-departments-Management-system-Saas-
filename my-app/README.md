# Patient Management Dashboard

A role-based dashboard for managing hospital patients across departments (ICU, OPD, and more), tracking vitals, and managing staff — with weekly/monthly analytics.

## Features

- **Authentication & Roles** — Admin, Doctor, and Staff roles with role-based access control
- **Patient Management** — Register patients, assign to departments, view/edit records
- **Vitals Tracking** — Log and view patient vitals (heart rate, blood pressure, temperature, oxygen level) over time
- **Team Management** — Admins can add/remove staff and assign them to departments
- **Analytics Dashboard** — Weekly and monthly charts for patient counts, department load, and vitals trends

## Tech Stack

**Frontend**
- React (Vite)
- Zustand — auth/session & UI state
- TanStack Query (React Query) — server data fetching/caching
- Tailwind CSS — styling
- Recharts — charts
- Zod — form validation

**Backend**
- Node.js + Express — REST API
- PostgreSQL + Prisma — database & ORM
- JWT + bcrypt — authentication

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # axios instance + endpoint functions
│   │   ├── store/           # zustand stores
│   │   ├── hooks/            # react-query hooks
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   └── routes/
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/       # auth, role checks
│   │   ├── prisma/            # schema.prisma, migrations
│   │   └── utils/
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (local instance or a hosted DB like Neon/Supabase)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repo-url>
cd <project-folder>
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/patient_dashboard"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
PORT=5000
```

Run Prisma migrations:
```bash
npx prisma migrate dev
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
```

Create a `.env` file in `client/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

The app should now be running at `http://localhost:5173` (frontend) with the API at `http://localhost:5000` (backend).

## API Overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/login` | Login |
| `POST /api/auth/register` | Register a staff account (admin only) |
| `GET /api/patients` | List patients (filterable by department/status) |
| `POST /api/patients` | Register a new patient |
| `POST /api/vitals/:patientId` | Add a vital reading |
| `GET /api/vitals/:patientId/stats` | Weekly/monthly vitals stats |
| `GET /api/team` | List team members |
| `POST /api/team` | Add a team member (admin only) |
| `GET /api/analytics/overview` | Dashboard summary stats |

Full API details are documented in [`project-plan-patient-dashboard.md`](./project-plan-patient-dashboard.md).

## Roles

| Role | Permissions |
|---|---|
| **Admin** | Full access — manage team, departments, patients, vitals |
| **Doctor** | Manage patients & vitals within assigned department |
| **Staff** | Register patients, log vitals within assigned department |

## Roadmap

- [ ] Real-time vitals (WebSocket-based live ICU monitoring)
- [ ] Additional departments beyond ICU/OPD
- [ ] Patient discharge history/archive view
- [ ] Export analytics reports (PDF/CSV)

## License

Add your license here (e.g., MIT).