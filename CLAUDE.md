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
Seven roles are defined in `src/types/index.ts` as `type Role`:

| Role | Label | Color | Scope |
|---|---|---|---|
| `teacher` | Teacher | #10B981 (green) | School — core logging role |
| `paraprofessional` | Paraprofessional | #059669 (dark emerald) | School — same sidebar/permissions as teacher |
| `coach` | Coach | #3B82F6 (blue) | School — manages teacher caseload |
| `admin` | Principal of School | #F59E0B (amber) | School — sees only their school |
| `district_admin` | Principal of District | #EA580C (orange) | District — sees all schools in their district |
| `researcher` | Researcher | #8B5CF6 (purple) | Platform — all districts, full data access |
| `super_admin` | Platform Admin | #EF4444 (red) | Platform — adds districts/schools, all data |

### Organization Hierarchy
- **Super Admin** creates districts and schools; platform-level view of everything
- **district_admin** (Principal of District) manages one district; has `districtId` field set; `schoolId: 'DISTRICT'`
- **admin** (Principal of School) manages one school; `schoolId` points to their school
- **coach/teacher/paraprofessional** are school-scoped
- **researcher** has read access to all districts

## Key Components

### EBPSelector (`src/components/ui/EBPSelector.tsx`)
Two-level EBP picker. Props: `selectedEBPs`, `selectedComponents`, `onEBPsChange`, `onComponentsChange`. Uses `ebpHierarchy as const` from mockData for type safety (readonly tuple).

### FidelityTrendChart (`src/components/ui/FidelityTrendChart.tsx`)
Shared Recharts multi-line chart. Export type `TLPoint = { label, adherence, dosage, quality, responsiveness, composite }`. Props: `data: TLPoint[]`, `roleColor: string`.

### SchoolDistrictFidelity (`src/pages/shared/SchoolDistrictFidelity.tsx`)
Shows school fidelity table + district fidelity trend + student performance by school. Props: `role`, `currentSchoolId`, `roleColor`, `districtId?`. Researcher/super_admin see all schools; district_admin sees their district's schools (via `districtId` prop); others see only their school.

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

**District Admin (Principal of District):**
- Overview: District Dashboard, MTSS Monitoring, Fidelity Trends, Student Data
- Management: Schools, Users, Impl. Learning Labs
- Resources: Resource Library, Manage Resources
- Incentives: My Incentives
- Communication: Messages

**Super Admin (Platform Admin):**
- Platform: Platform Overview, Districts & Schools, All Users
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
- `test.teacher@demo.com` (teacher, SCH01)
- `test.coach@demo.com` (coach, SCH01)
- `test.admin@demo.com` (Principal of School, SCH01)
- `test.dist1@demo.com` (Principal of District, dist1 — Riverside Unified)
- `test.dist2@demo.com` (Principal of District, dist2 — Lakeside)
- `test.district@demo.com` (Platform Admin / super_admin)
- `test.researcher@demo.com` (researcher, all districts)

## Node Version
Use Node 20 via nvm: `source ~/.nvm/nvm.sh && nvm use 20.19.0`
