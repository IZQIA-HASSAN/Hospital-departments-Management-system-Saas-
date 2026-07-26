# Patient Management Dashboard — Project Plan

## 1. Project Overview

A role-based SaaS dashboard for managing patients across hospital departments (ICU, OPD, and others as added later), tracking vitals, registering new patients, managing staff/team members, and visualizing weekly/monthly statistics.

**Core modules:**
- Authentication & role management (Admin, Doctor, Nurse/Staff)
- Patient registration & department assignment
- Vitals tracking per patient
- Team management (add/remove members, assign roles/departments)
- Analytics dashboard (weekly/monthly charts)

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React (Vite) | Fast dev server, no CRA overhead |
| State Management | Zustand | Use for auth state, current user, UI state. Server data (patients, vitals) is better fetched with **React Query / TanStack Query** on top of Zustand, so Zustand doesn't become a cache layer for server data |
| Styling | Tailwind CSS | Utility-first, fast to build dashboards with |
| Charts | Recharts or Chart.js | Recharts recommended — composes well with React |
| Backend | Node.js + Express | REST API |
| Auth | JWT (access + refresh token) + bcrypt for password hashing | Role-based middleware for Admin/Doctor/Staff |
| Database | PostgreSQL (recommended) | Patient/vitals/department data is relational — PostgreSQL handles relations, constraints, and time-series-ish vitals data better than a NoSQL store. (MongoDB is a viable alternative if you prefer schema flexibility, but you'll rebuild a lot of what SQL gives you for free here.) |
| ORM | Prisma | Type-safe queries, easy migrations |
| Validation | Zod (shared between frontend forms and backend request validation) | Keeps validation logic consistent |
| Deployment (future) | Frontend → Vercel/Netlify, Backend → Render/Railway, DB → Supabase/Neon/RDS | Only needed once you scale past local/dev |

**Assumption:** No database was specified — I'm recommending PostgreSQL + Prisma given the relational nature of patients/departments/vitals/teams. Let me know if you'd rather use MongoDB and I'll adjust the schema.

---

## 3. Data Model (initial schema)

```
User
- id, name, email, passwordHash, role (ADMIN | DOCTOR | STAFF), departmentId (nullable), createdAt

Department
- id, name (ICU, OPD, ...), createdAt

Patient
- id, name, age, gender, contact, departmentId, admittedAt, status (ACTIVE | DISCHARGED), assignedStaffId

Vital
- id, patientId, heartRate, bloodPressure, temperature, oxygenLevel, recordedAt, recordedBy (userId)

TeamMember (could reuse User table with role field, or separate if staff ≠ login users)
- id, userId, departmentId, joinedAt, removedAt (nullable — soft delete for history)
```

Vitals stored as time-stamped rows per patient makes weekly/monthly charting straightforward (group by date range).

---

## 4. API Structure (Express)

```
/api/auth
  POST   /register        (admin creates staff accounts)
  POST   /login
  POST   /refresh-token
  POST   /logout

/api/patients
  GET    /                (filter by department, status)
  POST   /                (register new patient)
  GET    /:id
  PUT    /:id
  DELETE /:id             (or mark discharged)

/api/vitals
  POST   /:patientId       (add vital reading)
  GET    /:patientId       (history)
  GET    /:patientId/stats?range=weekly|monthly  (aggregated for charts)

/api/departments
  GET    /
  POST   /                (admin only)

/api/team
  GET    /                (list members, filter by department)
  POST   /                (add member — admin only)
  DELETE /:id             (remove member — admin only)

/api/analytics
  GET    /overview         (dashboard summary: total patients, ICU vs OPD split, etc.)
  GET    /trends?range=weekly|monthly
```

Role-based middleware: Admin can manage team/departments; Doctors/Staff can manage patients & vitals within their department.

---

## 5. Frontend Structure

```
src/
  api/                  # axios instance + endpoint functions
  store/                # zustand stores (auth, ui)
  hooks/                # react-query hooks (usePatients, useVitals, etc.)
  components/
    ui/                 # buttons, inputs, modals (shared)
    patients/
    vitals/
    team/
    charts/
  pages/
    Login.jsx
    Dashboard.jsx
    Patients/ (List, Detail, Register)
    Team/
    Analytics/
  layouts/
    DashboardLayout.jsx (sidebar + topbar, role-aware nav)
  routes/
    AppRoutes.jsx        # protected routes by role
```

---

## 6. Execution Plan (Phased)

### Phase 1 — Foundations (Week 1)
- Backend: Express server, PostgreSQL + Prisma setup, User/Department models, JWT auth, role middleware
- Frontend: Vite + React + Tailwind setup, Zustand auth store, login page, protected route wrapper
- Deliverable: Working login with role redirect (Admin vs Staff dashboard shell)

### Phase 2 — Patient Management (Week 2)
- Patient model + CRUD API
- Frontend: patient list (filter by department), registration form, patient detail page
- Deliverable: Register a patient, assign to ICU/OPD, view/edit their record

### Phase 3 — Vitals Tracking (Week 2-3)
- Vitals model + API (add reading, fetch history)
- Frontend: vitals entry form on patient detail page, history table/timeline
- Deliverable: Doctors/staff can log and view vitals per patient

### Phase 4 — Team Management (Week 3)
- Team/member API (add/remove, department assignment)
- Frontend: team page — admin-only add/remove UI
- Deliverable: Admin can onboard/offboard staff and assign departments

### Phase 5 — Analytics & Charts (Week 4)
- Aggregation endpoints (weekly/monthly vitals trends, patient counts by department)
- Frontend: Recharts-based dashboard widgets on main Dashboard page
- Deliverable: Visual weekly/monthly stats on the landing dashboard

### Phase 6 — Polish, Testing, Deployment prep (Week 4-5)
- Form validation (Zod) end-to-end
- Error handling, loading states, empty states
- Basic tests for critical API routes (auth, patient CRUD)
- Deploy: backend to Render/Railway, frontend to Vercel, DB to Neon/Supabase
- Environment configs (.env for dev/staging/prod)

**Total estimate for MVP: ~4-5 weeks** for one developer working steadily; compresses with more hands on frontend/backend in parallel.

---

## 7. Scaling Considerations (since you mentioned future scale-up)

- **Departments are already modeled as a table, not hardcoded** — adding a new department (e.g., Pediatrics) later is just a new row, no schema change.
- **Soft deletes on TeamMember/Patient** (status flags instead of hard delete) preserve history for audit/reporting as usage grows.
- **Pagination from day one** on `/patients` and `/vitals` list endpoints — cheap now, saves a rewrite later.
- **Separate read-heavy analytics queries** from transactional writes early (even just via indexed columns on `recordedAt`, `departmentId`) so chart queries don't slow down as data grows.
- **Zustand stays UI/session-state only**; server data goes through React Query — this separation matters more as more screens and real-time-ish data get added.
- If real-time vitals monitoring (e.g., live ICU feeds) becomes a future requirement, plan for WebSockets (Socket.io) — not needed for MVP, but the Express server structure should keep routes decoupled enough to add this without a rewrite.

---

## 8. Open Questions to Confirm Before Starting

1. Do vitals get entered manually by staff, or will there be device/IoT integration eventually? (Affects whether you need a queue/ingestion layer later.)
2. Should discharged patients remain visible (read-only/history) or be archived out of the main view?
3. Any compliance requirement (e.g., data privacy standards for patient health data) that affects hosting/encryption choices?
