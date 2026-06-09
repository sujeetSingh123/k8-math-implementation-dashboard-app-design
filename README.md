# MathImpl — K–8 Mathematics Implementation Dashboard

A React + TypeScript prototype for tracking K–8 math instruction implementation across schools. Supports six user roles (teacher, paraprofessional, coach, admin, super_admin, researcher) with role-specific dashboards, daily implementation logging, fidelity tracking, student performance data, and incentive management.

---

## Quick Start

```bash
# Requires Node 20 via nvm
source ~/.nvm/nvm.sh && nvm use 20.19.0

npm install
npm run dev       # http://localhost:5173
```

## Test Accounts

All use password **`demo1234`**:

| Email | Role |
|-------|------|
| test.teacher@demo.com | Teacher |
| test.coach@demo.com | Coach |
| test.admin@demo.com | Admin |
| test.district@demo.com | Super Admin (District Admin) |
| test.researcher@demo.com | Researcher |

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (HMR) |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript check without emit |
| `npm run lint` | ESLint |

---

## Tech Stack

- **React 18** + **TypeScript** (strict) + **Vite**
- **Tailwind CSS v4** for styling
- **React Router v6** for routing
- **Zustand** for global state
- **React Hook Form** for forms
- **Recharts** for charts
- **Lucide React** for icons

---

## Project Structure

```
src/
├── components/
│   ├── layout/        # Sidebar, ProtectedLayout, AppShell
│   └── ui/            # Shared UI: Card, Button, Badge, Table, Modal,
│                      #   EBPSelector, FidelityTrendChart, StatCard, …
├── constants/         # roles.ts (roleColors, roleLabels)
├── data/              # mockData.ts — all mock data lives here
├── hooks/             # usePermissions.ts
├── pages/
│   ├── teacher/       # DailyLog, StudentPerfSummary, StudentData, …
│   ├── coach/         # CoachDashboard, Caseload, FeedbackQueue, …
│   ├── admin/         # SchoolOverview, MTSSMonitoring, …
│   ├── super_admin/   # SuperAdminDashboard, UserManagement,
│   │                  #   StudentsPerformanceTab, …
│   ├── researcher/    # ResearchAnalytics, LongitudinalView, …
│   └── shared/        # FidelityAdaptationView, SchoolDistrictFidelity
├── store/             # useAppStore.ts (Zustand)
└── types/             # index.ts — all TypeScript types
```

---

## Roles & Permissions

| Role | Color | Description |
|------|-------|-------------|
| `teacher` | #10B981 | Logs lessons, tracks own implementation |
| `paraprofessional` | #059669 | Same as teacher |
| `coach` | #3B82F6 | Supports teacher caseload |
| `admin` | #F59E0B | School-level oversight |
| `super_admin` | #EF4444 | District-level admin across all schools |
| `researcher` | #8B5CF6 | Full data access, manages budget & incentives |

Permissions are defined in `src/constants/roles.ts` (`rolePermissions`) and enforced via `PermissionGate` component and `usePermissions` hook.

---

## Key Features

- **Daily Log** — 5-section scrolling form: Pre-Instruction Planning → Instructional Implementation → Post Instruction Reflections → Adaptation → Coach Communication
- **EBP Selector** — Two-level evidence-based practice picker (EBP category + sub-component)
- **Fidelity Tracking** — Self-assessment across adherence, dosage, quality, responsiveness dimensions
- **Impl. Learning Labs** — PD session management available to all roles
- **Student Performance** — Per-teacher data with MTSS tier breakdown; district/school rollup for admins
- **Incentive System** — Formula-based earnings with researcher approval flow
- **MTSS Monitoring** — Six capacity indicators with traffic-light status
- **Multi-district Data** — Two districts (dist1/dist2), four schools (SCH01–SCH04)

---

## Documentation

- [`PLATFORM_GUIDE.md`](PLATFORM_GUIDE.md) — Non-technical platform guide (roles, journeys, concepts, formulas)
- [`TECH_STACK.md`](TECH_STACK.md) — Full tech stack and deployment specifications
- [`CLAUDE.md`](CLAUDE.md) — Developer reference (rules, component map, role structure)
