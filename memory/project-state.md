---
name: project-state
description: Current feature set and role architecture in the MathImpl dashboard
metadata:
  type: project
---

Auth, org management, and roles features added to the dashboard.

Super admin role (`super_admin`) added with full district-level management capabilities.

**Why:** Users requested a super admin able to manage schools and assign users to schools; researchers and school admins needed scoped data access.

**How to apply:** When working on role-based features, note the 5 roles: teacher, coach, admin, researcher, super_admin.

## Role architecture
- **super_admin** (color: `#EF4444` red) — District Office level; can add schools and add users (teacher/coach/admin/researcher) to any school. Routes: `/super-admin/dashboard`, `/super-admin/schools`, `/super-admin/users`. Demo login: `superadmin@example.org` / `demo1234`.
- **admin** — School-scoped; SchoolOverview filters to their `schoolId`. SA001 at `DISTRICT`, A001 at SCH01, A002 at SCH02.
- **researcher** — Cross-school read access; ResearchAnalytics shows all sites.
- **teacher/coach** — School-scoped operations.

## Super admin pages
- `src/pages/super_admin/SuperAdminDashboard.tsx` — district stats + school table
- `src/pages/super_admin/SchoolManagement.tsx` — add/view schools
- `src/pages/super_admin/UserManagement.tsx` — filter/view/add users
- `src/pages/super_admin/AddUserModal.tsx` — sub-component for add user form

## Store additions
- `schools: School[]` — mutable, initialized from mockData
- `users: User[]` — mutable, initialized from mockData (login uses store state, not static import)
- `credentials: MockCredential[]` — mutable, supports dynamically added users
- `addSchool(school)` — adds to schools
- `addUser(user, email)` — adds to users + orgMembers + credentials (default password: demo1234)

## usePermissions
super_admin always returns `() => true` (bypasses all permission gates).
