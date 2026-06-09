# MathImpl Project

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Type check: `npm run type-check`

## Stack
- Vite + React 18 + TypeScript + Tailwind CSS v4
- React Router v6 for routing
- Zustand for global state (`src/store/useAppStore.ts`)
- Recharts for data visualization
- Lucide React for icons
- React Hook Form for forms

## Rules
- All mock data lives in `src/data/mockData.ts` — never hardcode data in components
- All types in `src/types/index.ts`
- Role color must come from `roleColors` map in `src/constants/roles.ts`, never hardcoded in components
- Never use inline styles — Tailwind classes only (exception: dynamic colors from roleColors map)
- Every page component must be under 200 lines — extract sub-components as needed
- Forms use React Hook Form — no uncontrolled inputs
- Charts use Recharts — no other charting library
- No `any` types — strict TypeScript throughout
- Add `.claude/` to `.gitignore` — worktree dirs get committed as git submodule references otherwise

## Roles
Six roles are defined in `src/types/index.ts` as `type Role`:

| Role | Color | Notes |
|---|---|---|
| `teacher` | #10B981 (green) | Core logging role |
| `paraprofessional` | #059669 (dark emerald) | Same sidebar/permissions as teacher |
| `coach` | #3B82F6 (blue) | Manages teacher caseload |
| `admin` | #F59E0B (amber) | School-level admin |
| `super_admin` | #EF4444 (red) | District-level admin |
| `researcher` | #8B5CF6 (purple) | Full data access, manages budget |

## Key Components

### EBPSelector (`src/components/ui/EBPSelector.tsx`)
Two-level EBP picker. Props: `selectedEBPs`, `selectedComponents`, `onEBPsChange`, `onComponentsChange`. Uses `ebpHierarchy as const` from mockData for type safety (readonly tuple).

### FidelityTrendChart (`src/components/ui/FidelityTrendChart.tsx`)
Shared Recharts multi-line chart. Export type `TLPoint = { label, adherence, dosage, quality, responsiveness, composite }`. Props: `data: TLPoint[]`, `roleColor: string`.

### SchoolDistrictFidelity (`src/pages/shared/SchoolDistrictFidelity.tsx`)
Shows school fidelity table + district fidelity trend + student performance by school. Props: `role`, `currentSchoolId`, `roleColor`. Researcher/super_admin see all schools; others see only their school.

### StudentPerfSummary (`src/pages/teacher/StudentPerfSummary.tsx`)
Teacher-side student performance summary card. Groups records by MTSS tier. Returns `null` if teacher has no student data records.

### StudentsPerformanceTab (`src/pages/super_admin/StudentsPerformanceTab.tsx`)
Super admin page tab: district-level stat cards + per-school table + per-teacher table.

## Daily Log Structure (teacher/paraprofessional)
Five sections rendered as cards in a single scrolling form (`src/pages/teacher/DailyLog.tsx`):
1. Pre-Instruction Planning — session goal + pre-instruction notes
2. Instructional Implementation — date/time, routine, strategy, duration, tier, setting, EBPSelector, lesson completion, notes
3. Post Instruction Reflections — FidelitySection (fidelityType + description)
4. Adaptation — AdaptationSubForm
5. Coach Communication — coachMessage textarea

Below the form: `<StudentPerfSummary />` (shows teacher's own student data)

## Sidebar Structure per Role

**Teacher / Paraprofessional:**
- My Work: Daily Log, Past Logs, Student Data
- Resources: Coaching, Impl. Learning Labs, Resource Library
- Insights: My Dashboard, My Incentives
- Communication: Messages

**Coach:**
- Caseload: My Teachers, Feedback Queue, Student Data
- Resources: Resource Library, Impl. Learning Labs
- Insights: Coach Dashboard, Fidelity Trends, Incentives
- Communication: Messages

**Admin:**
- Overview: School Overview, MTSS Monitoring, Fidelity Trends, Student Data
- Management: Organization, Roles & Permissions, Impl. Learning Labs
- Resources: Resource Library, Manage Resources
- Incentives: My Incentives
- Communication: Messages

**Super Admin:**
- District: Overview, Schools, Users
- Resources: Impl. Learning Labs
- Communication: Messages

**Researcher:**
- Analytics: Research Analytics, Longitudinal View, Log Aggregation, Fidelity Trends, DSAII Pathway, Impl. Learning Labs
- Data: Student Data, Data Browser, Export Data, Resource Library, Manage Resources
- Budget: Budget & Incentives
- Communication: Messages

## Data Architecture
Two districts (`dist1`, `dist2`) with four schools (`SCH01`–`SCH04`) in mock data. `dist1` has SCH01/SCH02; `dist2` has SCH03/SCH04.

## Test Accounts
All use password `demo1234`:
- `test.teacher@demo.com`
- `test.coach@demo.com`
- `test.admin@demo.com`
- `test.district@demo.com` (super_admin)
- `test.researcher@demo.com`

## Node Version
Use Node 20 via nvm: `source ~/.nvm/nvm.sh && nvm use 20.19.0`
