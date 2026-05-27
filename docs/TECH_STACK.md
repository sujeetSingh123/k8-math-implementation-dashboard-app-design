# MathImpl — Full-Stack Tech Stack Documentation

> K-8 Mathematics Implementation Research Dashboard  
> Covers the complete technology decisions for frontend (current), backend (to build), and infrastructure layers.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Frontend Stack](#2-frontend-stack)
3. [Backend Stack](#3-backend-stack)
4. [Database Layer](#4-database-layer)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Real-Time Layer](#6-real-time-layer)
7. [File Storage & Export](#7-file-storage--export)
8. [API Design](#8-api-design)
9. [Background Jobs](#9-background-jobs)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Development Tooling](#12-development-tooling)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│   Browser (React SPA)  ·  Mobile Browser  ·  Future Mobile App  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / WSS
┌──────────────────────────────▼──────────────────────────────────┐
│                       CDN / Edge Layer                           │
│              Cloudflare (static assets + DDoS protection)        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                     Load Balancer (NGINX)                        │
└────────────┬───────────────────────────────────────┬────────────┘
             │                                       │
┌────────────▼────────────┐             ┌────────────▼────────────┐
│   API Server (Node.js)  │             │  WebSocket Server        │
│   REST + File Upload    │             │  (Socket.io)             │
│   Port 3001             │             │  Port 3002               │
└────────────┬────────────┘             └────────────┬────────────┘
             │                                       │
┌────────────▼───────────────────────────────────────▼────────────┐
│                      Application Services                        │
│   Auth  ·  Logs  ·  Incentives  ·  Export  ·  Notifications     │
└────────────────────┬─────────────────────┬───────────────────────┘
                     │                     │
         ┌───────────▼───┐       ┌─────────▼──────┐
         │  PostgreSQL   │       │  Redis          │
         │  Primary DB   │       │  Cache+Sessions │
         └───────────────┘       └────────────────┘
                     │
         ┌───────────▼───┐
         │  S3-compatible│
         │  File Storage │
         └───────────────┘
```

### Deployment Topology

| Environment | Purpose | Update Cadence |
|---|---|---|
| `local` | Developer machines | On save (HMR) |
| `staging` | QA + stakeholder review | Per PR merge |
| `production` | Live platform | Weekly releases |

---

## 2. Frontend Stack

> The frontend is already implemented. This section documents the current stack and extensions needed when the backend is wired up.

### Core Framework

| Package | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI component tree |
| **TypeScript** | 6.x | Type safety throughout |
| **Vite** | 8.x | Dev server + production bundler |
| **React Router DOM** | 7.x | Client-side routing with `<BrowserRouter>` |

### State Management

| Package | Version | Purpose |
|---|---|---|
| **Zustand** | 5.x | Global app state (`useAppStore`) |
| **React Hook Form** | 7.x | Form state + validation (all forms) |

**Migration plan when backend is added:**
- Replace mock `initialUsers/schools/credentials` in `mockData.ts` with API calls
- Add a `useQuery`/`useMutation` layer (TanStack Query) for server state
- Keep Zustand for UI-only state (modals, filters, current user session)

Recommended addition:

```bash
npm install @tanstack/react-query
```

```ts
// Wrap App in QueryClientProvider
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } }
})
```

### Styling

| Package | Purpose |
|---|---|
| **Tailwind CSS v4** | Utility-first CSS via Vite plugin |
| Lucide React | Icon library (consistent set, tree-shakeable) |
| Inline style (exception) | Dynamic role colors from `roleColors` map only |

**Color system (role-based):**

```ts
teacher:    '#10B981'  // emerald
coach:      '#3B82F6'  // blue
admin:      '#F59E0B'  // amber
researcher: '#8B5CF6'  // purple
super_admin:'#EF4444'  // red
```

### Data Visualization

| Package | Purpose |
|---|---|
| **Recharts** | All charts — LineChart, BarChart, RadarChart, AreaChart |

No other charting library is permitted.

### Build Output

```
dist/index.html           ~0.45 kB
dist/assets/index.css     ~39 kB  (gzip: 7.8 kB)
dist/assets/index.js      ~983 kB (gzip: 266 kB)
```

**Bundle optimization (to do before production):**

```ts
// vite.config.ts — add code splitting
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        charts: ['recharts'],
        store: ['zustand'],
      }
    }
  }
}
```

---

## 3. Backend Stack

### Runtime & Framework

| Technology | Choice | Rationale |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Matches frontend tooling; single language across stack |
| **Language** | TypeScript 5.x | Shared type definitions with frontend via a `packages/shared` workspace |
| **Framework** | **Fastify** | ~65k req/s throughput; built-in schema validation; JSON schema aligns with TS types |
| **Alternative** | Express.js | Simpler; lower ceiling; viable for teams unfamiliar with Fastify |

```bash
# Backend project init
npm init -y
npm install fastify @fastify/cors @fastify/jwt @fastify/multipart @fastify/rate-limit
npm install -D typescript @types/node tsx nodemon
```

### Project Structure

```
backend/
├── src/
│   ├── server.ts            # Fastify instance + plugin registration
│   ├── config/
│   │   ├── env.ts           # zod-validated environment variables
│   │   └── db.ts            # Prisma client singleton
│   ├── plugins/
│   │   ├── auth.ts          # JWT verify hook
│   │   ├── cors.ts
│   │   └── rateLimit.ts
│   ├── modules/
│   │   ├── auth/            # login, refresh, logout
│   │   ├── users/           # CRUD, role assignment
│   │   ├── schools/         # school management
│   │   ├── logs/            # implementation logs
│   │   ├── fidelity/        # fidelity checks
│   │   ├── adaptations/     # adaptation records
│   │   ├── coaching/        # coaching cycles + messages
│   │   ├── studentData/     # student performance records
│   │   ├── incentives/      # awards + formula calc
│   │   ├── notifications/   # push + in-app
│   │   ├── resources/       # file library
│   │   └── export/          # CSV/XLSX data export
│   ├── shared/
│   │   ├── types.ts         # mirrors src/types/index.ts
│   │   ├── permissions.ts   # permission ID constants
│   │   └── incentiveCalc.ts # mirrors src/utils/incentiveCalc.ts
│   └── jobs/
│       ├── missingLogAlert.ts
│       └── weeklyReport.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
└── tsconfig.json
```

### ORM

| Choice | **Prisma** |
|---|---|
| Version | 5.x |
| Rationale | Type-safe queries, auto-generated client from schema, excellent migration tooling |

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

### Environment Configuration

```bash
# .env (never committed)
DATABASE_URL="postgresql://user:pass@localhost:5432/mathimpl"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="minimum-32-char-secret-here"
JWT_REFRESH_SECRET="different-32-char-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
S3_BUCKET="mathimpl-uploads"
S3_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://app.mathimpl.org"
```

Use **Zod** to validate all env vars at startup — fail fast if misconfigured.

---

## 4. Database Layer

### Primary Database: PostgreSQL 16

**Why PostgreSQL:**
- JSONB columns for flexible arrays (EBP components, permission IDs)
- Full-text search for resource library
- Row-level security for multi-tenant school scoping
- Reliable `ACID` transactions for incentive calculations
- Native `UUID` type

### Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model School {
  id         String   @id @default(uuid())
  name       String
  districtId String
  createdAt  DateTime @default(now())
  users      User[]
  @@map("schools")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  initials  String   @db.Char(2)
  role      Role
  schoolId  String
  coachId   String?
  school    School   @relation(fields: [schoolId], references: [id])
  coach     User?    @relation("CoachTeachers", fields: [coachId], references: [id])
  teachers  User[]   @relation("CoachTeachers")
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("users")
}

enum Role {
  teacher
  coach
  admin
  researcher
  super_admin
}

model ImplementationLog {
  id                    String   @id @default(uuid())
  teacherId             String
  schoolId              String
  date                  String   @db.Date
  startTime             String?
  instructionalRoutine  String
  ebpComponent          String[] // JSONB array
  implementationStrategy String
  tier                  Tier
  durationMinutes       Int
  lessonCompletion      LessonCompletion
  adaptationOccurred    Boolean  @default(false)
  notes                 String?
  createdAt             DateTime @default(now())
  teacher               User     @relation(fields: [teacherId], references: [id])
  adaptation            Adaptation?
  studentData           StudentDataRecord[]
  @@map("implementation_logs")
}

enum Tier { Tier1 Tier2 Tier3 SPED }
enum LessonCompletion { fully partially not_completed }

model StudentDataRecord {
  id                   String         @id @default(uuid())
  teacherId            String
  logId                String?
  date                 String         @db.Date
  week                 Int?
  grade                String?
  instructionalSetting Tier
  measureType          MeasureType
  studentsCount        Int?
  baselineAvg          Float?
  currentAvg           Float
  growth               Float?
  medianPct            Float?
  atOrAboveBenchmark   Float?
  belowBenchmark       Float?
  interventionGroupAvg Float?
  comparisonGroupAvg   Float?
  goalPct              Float?
  metGoal              Boolean?
  dataSource           DataSource?
  uploadStatus         UploadStatus   @default(Submitted)
  researchExportId     String?
  notes                String?
  createdAt            DateTime       @default(now())
  teacher              User           @relation(fields: [teacherId], references: [id])
  log                  ImplementationLog? @relation(fields: [logId], references: [id])
  @@map("student_data_records")
}

enum MeasureType {
  CBM_Math_Concepts_Applications  @map("CBM-Math Concepts & Applications")
  Unit_Assessment                 @map("Unit Assessment")
  CBM_Math_Computation            @map("CBM-Math Computation")
  Goal_Specific_Progress_Monitoring @map("Goal-Specific Progress Monitoring")
  IEP_Math_Goal_Probe             @map("IEP Math Goal Probe")
  Intervention_Skill_Probe        @map("Intervention Skill Probe")
  Intensive_Intervention_Probe    @map("Intensive Intervention Probe")
}

enum DataSource { Teacher_upload Research_team_entry Data_system_import }
enum UploadStatus { Submitted Needs_review Verified }

model Incentive {
  id            String            @id @default(uuid())
  recipientId   String
  recipientRole RecipientRole
  category      IncentiveCategory
  amount        Int
  reason        String
  awardedAt     DateTime          @default(now())
  awardedById   String
  recipient     User              @relation(fields: [recipientId], references: [id])
  @@map("incentives")
}

enum RecipientRole  { teacher coach }
enum IncentiveCategory { training performance logging }

model RolePermissions {
  id            String   @id @default(uuid())
  role          Role     @unique
  permissionIds String[] // stored as JSONB
  @@map("role_permissions")
}

model Conversation {
  id             String          @id @default(uuid())
  participantIds String[]
  createdAt      DateTime        @default(now())
  messages       DirectMessage[]
  @@map("conversations")
}

model DirectMessage {
  id             String       @id @default(uuid())
  conversationId String
  senderId       String
  body           String
  createdAt      DateTime     @default(now())
  readAt         DateTime?
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  @@map("direct_messages")
}
```

### Indexes

```sql
-- High-frequency query indexes
CREATE INDEX idx_impl_logs_teacher_date   ON implementation_logs(teacher_id, date DESC);
CREATE INDEX idx_impl_logs_school        ON implementation_logs(school_id);
CREATE INDEX idx_student_data_teacher    ON student_data_records(teacher_id, date DESC);
CREATE INDEX idx_incentives_recipient    ON incentives(recipient_id);
CREATE INDEX idx_dm_conversation         ON direct_messages(conversation_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
```

### Cache: Redis 7

| Use case | TTL | Key pattern |
|---|---|---|
| JWT refresh token blocklist | 7 days | `token:revoked:{jti}` |
| User session data | 15 min | `session:{userId}` |
| Incentive formula totals | 1 hour | `incentive:formula:{schoolId}` |
| School aggregates | 30 min | `agg:school:{schoolId}` |
| Export job status | 24 hours | `export:job:{jobId}` |

```bash
npm install ioredis
```

---

## 5. Authentication & Authorization

### Strategy: JWT with Refresh Token Rotation

```
POST /api/auth/login
  → { accessToken (15m), refreshToken (7d), user }

POST /api/auth/refresh
  → { accessToken (15m), refreshToken (7d, rotated) }

POST /api/auth/logout
  → blacklist refreshToken in Redis
```

**Access token payload:**
```json
{
  "sub": "user-uuid",
  "role": "teacher",
  "schoolId": "school-uuid",
  "iat": 1716000000,
  "exp": 1716000900
}
```

**Password hashing:** `bcrypt` with `saltRounds: 12`

### Role-Based Access Control (RBAC)

Mirrors the existing `rolePermissions` table. Each API route declares required permission IDs:

```ts
// Fastify route with permission guard
fastify.get('/api/logs', {
  preHandler: [verifyJWT, requirePermission('p_view_logs')],
}, async (req, reply) => { ... })
```

**Permission IDs** (matches existing frontend constants):

| ID | Scope |
|---|---|
| `p_edit_logs` | Create/update implementation logs |
| `p_view_logs` | Read all logs (researcher, coach, admin) |
| `p_view_fidelity` | Fidelity checks + trends |
| `p_respond_coaching` | Coaching messages |
| `p_view_users` | See user lists |
| `p_assign_roles` | Modify role permissions |
| `p_manage_org` | School/org management |
| `p_export_data` | Data export endpoints |
| `p_view_reports` | Dashboard analytics |
| `p_view_student_data` | Student performance records |

**Data scoping middleware:**

```ts
// School-scoped queries — admin sees only their school
function scopeToSchool(req: FastifyRequest) {
  if (req.user.role === 'admin') return req.user.schoolId
  if (req.user.role === 'researcher' || req.user.role === 'super_admin') return null // all schools
  return req.user.schoolId
}
```

---

## 6. Real-Time Layer

**Technology:** Socket.io 4.x over WebSockets (fallback to long-polling)

**Events architecture:**

```ts
// Rooms by user and school
socket.join(`user:${userId}`)
socket.join(`school:${schoolId}`)

// Events emitted by server
'notification:new'       // { notification }
'message:new'            // { conversationId, message }
'log:submitted'          // { teacherId, log } → coach's room
'feedback:replied'       // { feedbackItemId } → teacher's room
```

**Redis adapter** for multi-instance Socket.io:

```bash
npm install socket.io @socket.io/redis-adapter
```

---

## 7. File Storage & Export

### Upload Storage: S3-compatible

**Production:** AWS S3  
**Self-hosted alternative:** MinIO (Docker)

```
Bucket structure:
mathimpl-uploads/
  resources/{schoolId}/{filename}     # PD resources
  student-data/{teacherId}/{filename} # CSV uploads
  exports/{userId}/{jobId}.xlsx       # Generated exports
```

- File size limit: 25 MB per upload
- Accepted MIME types: `text/csv`, `application/pdf`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/msword`
- Signed URLs with 1-hour expiry for downloads

### Data Export

**Format:** XLSX (preferred) + CSV fallback  
**Library:** `exceljs` for XLSX generation

```bash
npm install exceljs
```

**Export scopes:**
- Teacher logs (own or scoped by researcher)
- Fidelity check history
- Student data records (researcher: all schools)
- Incentive earnings summary
- DSAII pathway metrics

Exports run as **background jobs** (see §9) and deliver a signed download URL via WebSocket notification.

---

## 8. API Design

### REST Conventions

```
Base URL:  https://api.mathimpl.org/api/v1

GET     /schools                         # list (super_admin)
POST    /schools                         # create (super_admin)
GET     /schools/:id/users               # users in school
POST    /users                           # create user (super_admin, admin)

GET     /logs                            # filtered by role scope
POST    /logs                            # teacher creates log
GET     /logs/:id                        # single log detail
PATCH   /logs/:id                        # update log

GET     /student-data                    # ?teacherId=&week=&tier=
POST    /student-data                    # upload record
PATCH   /student-data/:id/status        # researcher verifies

GET     /incentives/formula              # calculated earnings (read-only)
GET     /incentives/awards               # manual awards list
POST    /incentives/awards               # researcher awards incentive

GET     /fidelity-checks                 # by teacher/school
POST    /fidelity-checks

GET     /coaching/cycles                 # coach's caseload
POST    /coaching/cycles/:id/messages   # send message

GET     /notifications                   # current user's
PATCH   /notifications/:id/read

POST    /export                          # async export job
GET     /export/:jobId                   # poll status / get URL

POST    /auth/login
POST    /auth/refresh
POST    /auth/logout
```

### Response Envelope

```ts
// Success
{ success: true, data: T, meta?: { total, page, pageSize } }

// Error
{ success: false, error: { code: string, message: string, details?: unknown } }
```

### Pagination

```
GET /logs?page=1&pageSize=25&teacherId=xxx&from=2025-01-01&to=2025-06-30
```

---

## 9. Background Jobs

**Library:** BullMQ (Redis-backed job queues)

```bash
npm install bullmq
```

| Queue | Job | Trigger | Schedule |
|---|---|---|---|
| `notifications` | Missing log alert | Daily cron | 8 PM school TZ |
| `notifications` | Student data due reminder | Weekly cron | Monday 7 AM |
| `reports` | Weekly summary email | Weekly cron | Friday 4 PM |
| `exports` | Generate XLSX file | On-demand | User request |
| `incentives` | Recalc formula cache | After log save | Async, ~10s delay |

---

## 10. Monitoring & Observability

| Layer | Tool | What it tracks |
|---|---|---|
| **Logging** | Pino (built into Fastify) | Request logs, error traces, job output |
| **APM** | Sentry | Backend exceptions + frontend JS errors |
| **Metrics** | Prometheus + Grafana | Request latency, DB pool usage, queue depth |
| **Uptime** | Better Uptime / UptimeRobot | /healthz endpoint ping every 60s |
| **DB Insights** | pganalyze (optional) | Slow query tracking |

```ts
// Health check endpoint
GET /healthz
→ { status: 'ok', db: 'connected', redis: 'connected', uptime: 12345 }
```

---

## 11. CI/CD Pipeline

**Platform:** GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  frontend:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build

  backend:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx prisma generate
      - run: npm run type-check
      - run: npm test   # Jest + supertest integration tests

  deploy-staging:
    needs: [frontend, backend]
    if: github.ref == 'refs/heads/main'
    # Deploy to staging server
    # Run Prisma migrations
    # Restart PM2 / Kubernetes rollout
```

---

## 12. Development Tooling

### Node Version

```bash
# .nvmrc
20.19.0
```

Always activate via: `source ~/.nvm/nvm.sh && nvm use`

### Monorepo Structure (recommended)

```
mathimpl/
├── apps/
│   ├── web/          # current frontend (Vite + React)
│   └── api/          # new backend (Fastify)
├── packages/
│   └── shared/       # shared TypeScript types + incentiveCalc
├── package.json      # workspaces: ["apps/*", "packages/*"]
└── turbo.json        # Turborepo task graph
```

```bash
npm install -D turbo
```

### Local Development

```bash
# Start everything
turbo dev

# Frontend only: localhost:5173
# Backend only:  localhost:3001
# DB:            docker compose up postgres redis
```

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: mathimpl
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address :9001
```

### Code Quality

| Tool | Config | Scope |
|---|---|---|
| ESLint | `eslint.config.js` | TypeScript + React hooks rules |
| Prettier | `.prettierrc` | Consistent formatting |
| Husky + lint-staged | pre-commit hook | Lint + type-check before commit |
| Commitlint | `commitlint.config.js` | Conventional commit messages |

---

## Package Summary

### Frontend (current)

```json
{
  "react": "^19.2.6",
  "react-dom": "^19.2.6",
  "react-router-dom": "^7.15.1",
  "zustand": "^5.0.13",
  "react-hook-form": "^7.76.0",
  "recharts": "^3.8.1",
  "tailwindcss": "^4.3.0",
  "lucide-react": "^1.16.0"
}
```

### Frontend (add for backend integration)

```json
{
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x",
  "socket.io-client": "^4.x"
}
```

### Backend (new)

```json
{
  "fastify": "^5.x",
  "@fastify/cors": "^9.x",
  "@fastify/jwt": "^9.x",
  "@fastify/multipart": "^8.x",
  "@fastify/rate-limit": "^9.x",
  "@prisma/client": "^5.x",
  "bcrypt": "^5.x",
  "ioredis": "^5.x",
  "bullmq": "^5.x",
  "socket.io": "^4.x",
  "@socket.io/redis-adapter": "^8.x",
  "exceljs": "^4.x",
  "zod": "^3.x",
  "pino": "^9.x"
}
```
