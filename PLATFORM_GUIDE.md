# MathImpl Platform Guide
### A Complete Reference for Understanding How the Platform Works
*For non-technical readers — no coding knowledge required*

---

## Table of Contents

1. [What Is MathImpl?](#1-what-is-mathimpl)
2. [Who Uses It? — The Five Roles](#2-who-uses-it--the-five-roles)
3. [How the Platform Is Organized](#3-how-the-platform-is-organized)
4. [User Journeys — Step by Step](#4-user-journeys--step-by-step)
   - [Teacher Journey](#41-teacher-journey)
   - [Coach Journey](#42-coach-journey)
   - [Admin Journey](#43-admin-journey)
   - [Researcher Journey](#44-researcher-journey)
   - [Super Admin Journey](#45-super-admin-journey)
5. [Core Concepts Explained](#5-core-concepts-explained)
   - [Implementation Logs](#51-implementation-logs)
   - [Fidelity Checks](#52-fidelity-checks)
   - [Adaptations](#53-adaptations)
   - [MTSS Tiers](#54-mtss-tiers)
   - [Coaching Cycles](#55-coaching-cycles)
6. [How Scores & Metrics Are Calculated](#6-how-scores--metrics-are-calculated)
   - [Log Completion Rate](#61-log-completion-rate)
   - [Fidelity Score](#62-fidelity-score)
   - [Fidelity Status Labels](#63-fidelity-status-labels)
   - [Adaptation Consistency](#64-adaptation-consistency)
7. [Incentives & Earnings — How They Work](#7-incentives--earnings--how-they-work)
   - [Teacher Incentives](#71-teacher-incentives)
   - [Admin Incentives](#72-admin-incentives)
   - [Approval Flow](#73-incentive-approval-flow)
8. [MTSS Monitoring — School Health Indicators](#8-mtss-monitoring--school-health-indicators)
9. [Data & Research Analytics](#9-data--research-analytics)
10. [Notifications — How the System Alerts Users](#10-notifications--how-the-system-alerts-users)
11. [Permissions — Who Can See What](#11-permissions--who-can-see-what)
12. [Visual Flow Diagrams](#12-visual-flow-diagrams)
13. [Glossary](#13-glossary)

---

## 1. What Is MathImpl?

**MathImpl** is a digital platform that helps K–8 schools implement mathematics instruction the right way, consistently, across all classrooms. It connects teachers, coaches, school administrators, and researchers in one shared system.

Think of it as a **logbook + coaching tool + research dashboard** — all in one place.

### What problem does it solve?

When schools adopt a new instructional approach (like a math intervention program), it's hard to know:
- Are teachers actually using it?
- How well are they using it?
- Where do teachers need help?
- Is it working for students?

MathImpl answers all of these questions by collecting data at the classroom level every day and surfacing it to the right people.

### The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MATHIMPL PLATFORM                       │
│                                                                 │
│   TEACHER          COACH           ADMIN        RESEARCHER      │
│   ───────         ───────         ───────       ──────────      │
│   Logs daily  →  Supports    →   Monitors  →   Analyzes        │
│   lessons        teachers        school         district-       │
│                                  health         wide trends     │
│                                                                 │
│           All data flows up → enabling decisions at each level  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Who Uses It? — The Five Roles

Each person in the system has a **role** that determines what they can see and do. Roles are color-coded throughout the platform so you always know whose perspective you're in.

| Role | Color | Who They Are | Primary Goal |
|------|-------|-------------|--------------|
| 🟢 **Teacher** | Green | Classroom teachers | Log lessons, track their own implementation |
| 🔵 **Coach** | Blue | Implementation coaches | Support teachers, monitor caseload |
| 🟡 **Admin** | Amber/Gold | School principals/admins | Monitor school health, manage staff |
| 🟣 **Researcher** | Purple | Research team members | Analyze data, manage budget & incentives |
| 🔴 **Super Admin** | Red | District-level administrators | Manage all schools and users |

> **Important:** Every person logs in with their own email and password. The platform automatically shows them only the pages and data relevant to their role.

---

## 3. How the Platform Is Organized

### Schools & Users

```
District
└── School (e.g., Lincoln K-8)
    ├── Teachers
    │   ├── Anna Carter  (assigned to Coach: Rachel Stone)
    │   ├── Brian Lee    (assigned to Coach: Rachel Stone)
    │   └── Carla Nguyen (assigned to Coach: Rachel Stone)
    ├── Coach
    │   └── Rachel Stone
    └── Admin
        └── Monica Hill
```

Each teacher is **assigned to one coach**. The coach can see all of their assigned teachers' data. Admins see their entire school. Researchers and Super Admins see everything.

### Navigation (Sidebar)

Each role has a customized sidebar with only the pages they need:

**Teacher Sidebar:**
- My Work: Plan Session, Daily Log, My Logs, Coaching, Student Data
- Resources: Resource Library, My Training
- Insights: My Dashboard, My Incentives
- Communication: Messages

**Coach Sidebar:**
- Caseload: My Teachers, Feedback Queue
- Resources: Resource Library
- Insights: Coach Dashboard, Fidelity Trends, Incentives
- Communication: Messages

**Admin Sidebar:**
- Overview: School Overview, MTSS Monitoring, Fidelity Trends
- Management: Organization, Roles & Permissions, PD Planning
- Resources: Resource Library, Manage Resources
- Incentives: My Incentives
- Communication: Messages

**Researcher Sidebar:**
- Analytics: Research Analytics, Longitudinal View, Log Aggregation, Fidelity Trends, DSAII Pathway
- Data: Data Browser, Export Data, Resource Library, Manage Resources
- Budget: Budget & Incentives
- Communication: Messages

---

## 4. User Journeys — Step by Step

### 4.1 Teacher Journey

A teacher's day on MathImpl typically follows this path:

```
MORNING
   │
   ▼
[1] PLAN SESSION (optional)
    Teacher creates a lesson plan for today or future dates
    - Picks instructional routine, strategy, duration
    - Selects MTSS tier (Tier 1/2/3/SPED)
    - Sets a lesson goal
    │
    ▼
[2] TEACH THE LESSON
    (The actual classroom instruction happens here — offline)
    │
    ▼
[3] LOG THE LESSON (Daily Log)
    Teacher records what happened:
    - Date & time
    - What routine they taught
    - How long it lasted
    - Whether the lesson was completed (fully / partially / not completed)
    - Notes and reflections
    │
    ├── Did an adaptation occur?
    │   YES → Fill out Adaptation Sub-Form (see Section 5.3)
    │   NO  → Continue
    │
    ▼
[4] FIDELITY SELF-CHECK
    Teacher rates their own implementation on 5 dimensions (1–5 scale)
    - Adherence, Dosage, Quality, Responsiveness, Confidence
    │
    ▼
[5] REVIEW DASHBOARD
    Teacher sees their own stats:
    - Log completion rate
    - Average fidelity score
    - Adaptations this month
    - Coaching messages
    - Training attendance
    │
    ▼
[6] CHECK COACHING THREAD
    Teacher reads messages from their coach
    Ask questions → Coach replies
    │
    ▼
[7] VIEW INCENTIVES
    Teacher sees how much they've earned based on their logging behavior
```

**Teacher Dashboard Widgets:**

| Widget | What It Shows |
|--------|--------------|
| Log Completion | % of lessons marked "fully completed" |
| Avg Fidelity | Average score across all 5 dimensions (1–5) |
| Adaptations | Number of adaptations documented this month |
| Messages | Total coaching messages, with unread count |
| Training | Sessions attended out of total available |

---

### 4.2 Coach Journey

A coach manages a **caseload** of assigned teachers and supports their implementation:

```
[1] COACH DASHBOARD
    Overview of entire caseload:
    - How many teachers are "On Track" (fidelity ≥ 4.0)
    - Average log rate across all teachers
    - Response rate to coaching messages
    - Number of fidelity concerns (below 3.0)
    - Recent implementation logs from all teachers
    │
    ▼
[2] VIEW CASELOAD (My Teachers)
    List of all assigned teachers with:
    - Status badge: On Track / Needs Support / At Risk
    - Log rate, fidelity score, adaptation count
    - Last contact date
    - Quick actions: Message, View Logs, Details, Flag
    │
    ├── Click a teacher → Teacher Detail Page
    │   Full dashboard view of that teacher's data
    │
    ▼
[3] FEEDBACK QUEUE
    Teachers' questions appear here
    Coach reads question → Types reply → Marks resolved
    │
    ▼
[4] SUPPORT ACTIONS
    - Flag a teacher for priority follow-up
    - View individual logs in detail
    - Create action items in coaching cycle
    - Communicate via coaching thread
```

**How Coach Sees Teacher Health:**

```
Fidelity Score → Status Label
─────────────────────────────
4.0 – 5.0      = 🟢 On Track
3.0 – 3.9      = 🟡 Needs Support
Below 3.0      = 🔴 At Risk
```

---

### 4.3 Admin Journey

An admin monitors the health of their entire school:

```
[1] SCHOOL OVERVIEW
    High-level snapshot:
    - School name and ID
    - Overall log rate
    - Training participation rate
    - Average fidelity score
    - Weekly log submission chart
    │
    ▼
[2] MTSS MONITORING
    Six health indicators (called "Determinants"):
    - Leadership Support
    - Coaching Access
    - Staffing Stability
    - MTSS Maturity
    - Resource Availability
    - Implementation Climate
    
    Each shows a % score and Green/Amber/Red status
    Click any indicator → detailed notes + action options
    │
    ▼
[3] FIDELITY TRENDS
    See fidelity scores over time across the school
    │
    ▼
[4] ORGANIZATION MANAGEMENT
    View and manage staff roster
    │
    ▼
[5] INCENTIVE MANAGEMENT
    See each teacher's log rate and projected earnings
    Review pending incentive awards for the school
    │
    ▼
[6] PD PLANNING
    Manage professional development sessions
    Track enrollment and attendance
```

---

### 4.4 Researcher Journey

A researcher has the broadest data access and manages the study:

```
[1] RESEARCH ANALYTICS
    District-wide summary:
    - Total schools, log entries, adaptations, data completeness
    - Longitudinal fidelity trajectory chart (Sep–May)
    - DSAII Pathway Indicators (5 key drivers of implementation)
    - School comparison table (real school names and metrics)
    - Recent implementation logs with teacher names
    │
    ▼
[2] LONGITUDINAL VIEW
    Month-by-month fidelity trends per school
    - Compare all schools side by side
    - See which dimensions are strongest/weakest
    - Click any school for detailed breakdown
    │
    ▼
[3] LOG AGGREGATION
    View all implementation logs across all schools
    Filter by school, tier, completion status, date
    │
    ▼
[4] DATA BROWSER
    Browse all users by school
    - Click any teacher → Full Teacher Detail Page
    - View their logs, fidelity checks, student data
    │
    ▼
[5] BUDGET & INCENTIVES
    Manage the entire incentive program:
    - View formula-based earnings for all roles
    - Approve/reject pending incentive awards
    - View award history by semester
    - Award ad-hoc incentives manually
    │
    ▼
[6] EXPORT DATA
    Download datasets for external analysis
```

---

### 4.5 Super Admin Journey

The super admin manages the entire district infrastructure:

```
[1] DISTRICT OVERVIEW
    High-level stats:
    - Total schools
    - Total staff (teachers, coaches, admins, researchers)
    - Total logs and completion rate
    - Log activity chart by school
    │
    ▼
[2] MANAGE SCHOOLS
    Add, view, or edit schools
    See per-school staff breakdown
    │
    ▼
[3] MANAGE USERS
    Full roster of all users in the district
    Add new users, edit roles, deactivate accounts
```

---

## 5. Core Concepts Explained

### 5.1 Implementation Logs

An **implementation log** is a record of one lesson a teacher taught. Think of it as a digital teaching journal entry.

**Every log captures:**

| Field | What It Means |
|-------|--------------|
| Date | When the lesson happened |
| Instructional Routine | The specific math activity taught (e.g., "Number Talk", "Counting Collections") |
| Implementation Strategy | How the teacher delivered it (e.g., "Think-aloud", "Guided Practice") |
| EBP Component | The evidence-based practice element used (e.g., CRA = Concrete-Representational-Abstract) |
| MTSS Tier | Which group of students (Tier 1 = all students, Tier 2 = at-risk, Tier 3 = intensive, SPED) |
| Duration | How many minutes the lesson lasted (1–180) |
| Lesson Completion | Was it fully done, partially done, or not completed? |
| Adaptation Occurred | Did the teacher change anything from the original plan? |
| Notes | Optional teacher reflections |

**Lesson Completion Options:**

```
✅ Fully Completed    → Lesson went as planned, fully delivered
⚠️ Partially Completed → Lesson started but cut short or modified mid-way
❌ Not Completed       → Lesson didn't happen (time ran out, disruption, etc.)
```

---

### 5.2 Fidelity Checks

A **fidelity check** is a self-assessment teachers complete after teaching. It answers the question: *"How well did I implement this lesson?"*

Teachers rate themselves on **5 core dimensions**, each scored 1–5:

```
CORE FIDELITY DIMENSIONS
─────────────────────────────────────────────────────
Dimension          1 (Low)                5 (High)
─────────────────────────────────────────────────────
Adherence          Not following          Fully following
                   the protocol           the protocol

Dosage             Far below the          Meets or exceeds
                   intensity target       the target

Quality            Poor delivery          Exemplary delivery

Responsiveness     Students not           Students highly
                   engaged                engaged

Confidence         Not confident          Very confident
                   at all                 in delivery
─────────────────────────────────────────────────────
```

There are also **3 optional context dimensions:**

```
CONTEXT DIMENSIONS
─────────────────────────────────────────────────────
Feasibility        How realistic is this to implement here?
Acceptability      Does the staff accept this approach?
Sustainment        Can we maintain this long-term?
─────────────────────────────────────────────────────
```

---

### 5.3 Adaptations

An **adaptation** is any change a teacher makes to the planned lesson. Adaptations are expected and encouraged — what matters is *why* they happened and whether they maintained the spirit of the instruction.

**When logged:** Only when a teacher marks "Adaptation Occurred: Yes" in their daily log.

**Every adaptation documents:**

| Field | Options | What It Means |
|-------|---------|--------------|
| Planned vs. Reactive | Planned / Reactive | Was this change pre-planned, or made on-the-fly? |
| Fidelity Type | Consistent / Inconsistent | Did the change maintain the protocol's intent? |
| What Was Modified | Materials, Grouping, Pace, Duration, Content, etc. | What part of the lesson changed? |
| Reasons | Student behavior, Time constraints, Missing materials, etc. | Why was the change made? |
| Description | Free text | Full narrative of the adaptation |

**Fidelity Type Explained:**

```
✅ Consistent Adaptation
   The change SUPPORTS the instructional protocol
   Example: Switching from whole-class to small groups because
   students needed more support — still delivering the same math concept

❌ Inconsistent Adaptation
   The change DEVIATES from the instructional protocol
   Example: Skipping the concrete phase of CRA because of time pressure
   — changes the fundamental structure of the approach
```

---

### 5.4 MTSS Tiers

**MTSS** stands for *Multi-Tiered System of Supports*. It's a framework for matching the level of instructional support to what each student needs.

```
MTSS TIER STRUCTURE
──────────────────────────────────────────────────────
                    ▲
                   /│\
                  / │ \    TIER 3 (Intensive)
                 /   │  \  Individual students needing
                /    │   \ intensive, tailored support
               ──────────
              /           \
             /   TIER 2    \ Targeted groups of students
            /   (Targeted)  \ at risk of falling behind
           ────────────────
          /                  \
         /      TIER 1        \ ALL students
        / (Universal/Core)     \ Core classroom instruction
       ─────────────────────────

SPED = Students receiving special education services
──────────────────────────────────────────────────────
```

| Tier | Who | Description |
|------|-----|-------------|
| Tier 1 | All students | Core math instruction every student receives |
| Tier 2 | ~15–20% of students | Additional targeted support for at-risk students |
| Tier 3 | ~5% of students | Intensive individualized intervention |
| SPED | IEP students | Special education math services |

When teachers log a lesson, they tag it with the MTSS tier of the students they were teaching.

---

### 5.5 Coaching Cycles

A **coaching cycle** is an ongoing support relationship between one coach and one teacher. It's not a one-time event — it's a continuous process.

**Components of a Coaching Cycle:**

```
COACHING CYCLE
──────────────────────────────────────────────
│  Goal          │ What are we working on?    │
│                │ (e.g., "Improve Tier 2     │
│                │  dosage and confidence")   │
├────────────────┼────────────────────────────┤
│  Messages      │ Back-and-forth between     │
│                │ coach and teacher          │
├────────────────┼────────────────────────────┤
│  Action Items  │ Specific tasks with        │
│                │ due dates (e.g., "Watch    │
│                │ the CRA video by Friday")  │
│                │ Can be: Open / Overdue /   │
│                │ Completed                  │
├────────────────┼────────────────────────────┤
│  Feedback Q&A  │ Teacher asks a quick       │
│                │ question → Coach replies   │
│                │ → Appears in Feedback Queue│
└────────────────┴────────────────────────────┘
```

**Feedback Question Flow:**

```
Teacher types question
        │
        ▼
Feedback Item created (status: Pending)
        │
        ▼
Coach receives notification → opens Feedback Queue
        │
        ▼
Coach types reply → submits
        │
        ▼
Reply added to Coaching Thread messages
Feedback Item marked: Resolved ✅
Teacher can see the reply in their coaching page
```

---

## 6. How Scores & Metrics Are Calculated

### 6.1 Log Completion Rate

The **Log Completion Rate** tells you what percentage of a teacher's lessons were fully completed.

**Formula:**

```
                  Number of "Fully Completed" logs
Log Rate (%) = ─────────────────────────────────── × 100
                       Total number of logs
```

**Example:**
- Teacher has 20 total logs
- 15 are marked "Fully Completed"
- 3 are "Partially Completed"
- 2 are "Not Completed"

```
Log Rate = 15 / 20 × 100 = 75%
```

> **Note:** "Partially Completed" and "Not Completed" are both counted as non-full in this calculation. Only "Fully Completed" counts toward the rate.

---

### 6.2 Fidelity Score

The **average fidelity score** summarizes a teacher's implementation quality across all five dimensions.

**Per-Check Formula:**

```
                Adherence + Dosage + Quality + Responsiveness + Confidence
Composite =  ─────────────────────────────────────────────────────────────
                                        5
```

**Overall Average Formula:**

```
                  Sum of all composite scores
Avg Fidelity = ─────────────────────────────
                   Number of fidelity checks
```

**Example:**
A teacher has 3 fidelity checks:
- Check 1: (4 + 3 + 4 + 3 + 3) / 5 = 3.4
- Check 2: (4 + 4 + 4 + 4 + 3) / 5 = 3.8
- Check 3: (5 + 4 + 4 + 4 + 4) / 5 = 4.2

```
Avg Fidelity = (3.4 + 3.8 + 4.2) / 3 = 3.8
```

---

### 6.3 Fidelity Status Labels

The platform automatically assigns a label based on the fidelity score:

```
Score Range    Status Label       Badge Color   Meaning
──────────────────────────────────────────────────────────
4.0 – 5.0      On Track           🟢 Green      Implementation is strong
3.0 – 3.9      Needs Support      🟡 Amber      Coaching attention needed
Below 3.0      At Risk            🔴 Red        Priority intervention needed
──────────────────────────────────────────────────────────
```

These labels appear on:
- The coach's caseload list (next to each teacher's name)
- The coach's dashboard summary cards
- The teacher detail page

---

### 6.4 Adaptation Consistency

When viewing adaptation data, the platform tracks what percentage of all adaptations were **fidelity-consistent**:

**Formula:**

```
                    Number of "Consistent" adaptations
% Consistent = ──────────────────────────────────────── × 100
                       Total number of adaptations
```

**Why it matters:** A high % consistent means teachers are flexibly adapting *within* the framework. A low % means adaptations are taking them away from the intended approach — which is a coaching flag.

---

## 7. Incentives & Earnings — How They Work

The platform includes an **incentive program** that rewards teachers, coaches, and school leaders for consistent implementation and strong outcomes. There are two types of incentives:

- **Logging incentives** — based on how consistently teachers record their lessons
- **Performance incentives** — based on how well students are doing and how well teachers are implementing

---

### 7.1 Teacher Incentives

A teacher's total incentive earnings for a semester are calculated from **five components**:

```
┌──────────────────────────────────────────────────────────────┐
│                    TEACHER INCENTIVE FORMULA                 │
│                                                              │
│  1. Base Participation Incentive:    $50 / semester          │
│                                                              │
│  2. 2-Week Perfect Log Bonus:        $5 per 2-week period    │
│     (all logs in that window = "Fully Completed")            │
│                                                              │
│  3. Log Rate Tier Bonus:                                     │
│     ┌──────────────┬───────────┐                            │
│     │ Log Rate     │ Bonus     │                            │
│     ├──────────────┼───────────┤                            │
│     │ 81 – 100%    │ +$30      │                            │
│     │ 71 – 80%     │ +$20      │                            │
│     │ 60 – 70%     │ +$10      │                            │
│     │ Below 60%    │ $0        │                            │
│     └──────────────┴───────────┘                            │
│                                                              │
│  4. Student Growth Bonus: (performance incentive)            │
│     ┌──────────────────────┬───────────┐                    │
│     │ Avg Student Growth   │ Bonus     │                    │
│     ├──────────────────────┼───────────┤                    │
│     │ ≥ 20% avg growth     │ +$50      │                    │
│     │ ≥ 10% avg growth     │ +$30      │                    │
│     │ ≥ 5% avg growth      │ +$15      │                    │
│     │ Below 5%             │ $0        │                    │
│     └──────────────────────┴───────────┘                    │
│                                                              │
│  5. Benchmark Achievement Bonus: (performance incentive)     │
│     ≥ 80% of students at or above benchmark → +$25          │
│     Below 80%                               → $0            │
│                                                              │
│  TOTAL = Base + 2-Wk Bonus + Rate Bonus                     │
│        + Student Growth Bonus + Benchmark Bonus             │
└──────────────────────────────────────────────────────────────┘
```

**What "Student Growth" means:**
- Teachers upload student assessment data (e.g., CBM scores, unit tests)
- Each record has a **baseline** (starting score) and a **current** score
- Growth = Current score minus Baseline score
- The platform averages growth across all records the teacher submitted in that semester
- Higher average growth = higher bonus

**What "Benchmark Achievement" means:**
- When uploading student data, teachers record how many students scored at or above the district benchmark
- If 80% or more of assessed students are at/above benchmark → teacher earns +$25

**Example Calculation:**

Teacher "Anna Carter" in Fall semester:
- Log Rate: 78% → Rate Bonus = **$20**
- 3 perfect 2-week periods → 2-Week Bonus = 3 × $5 = **$15**
- Avg student growth: 12% → Student Growth Bonus = **$30**
- 85% of students at/above benchmark → Benchmark Bonus = **$25**
- Base = **$50**
- **Total = $50 + $15 + $20 + $30 + $25 = $140**

---

### 7.2 Coach Incentives

Coaches earn based on **their caseload's log behavior** and **how well their teachers are implementing** (fidelity performance):

```
┌──────────────────────────────────────────────────────────────┐
│                    COACH INCENTIVE FORMULA                   │
│                                                              │
│  1. Base Participation Incentive:    $100 / semester         │
│                                                              │
│  2. Caseload Log Rate Bonus:                                 │
│     ┌──────────────────────┬───────────┐                    │
│     │ Caseload Avg Log Rate│ Bonus     │                    │
│     ├──────────────────────┼───────────┤                    │
│     │ 81 – 100%            │ +$30      │                    │
│     │ 71 – 80%             │ +$20      │                    │
│     │ 60 – 70%             │ +$10      │                    │
│     │ Below 60%            │ $0        │                    │
│     └──────────────────────┴───────────┘                    │
│                                                              │
│  3. Teacher Fidelity Performance Bonus: (performance)        │
│     ┌──────────────────────────┬───────────┐                │
│     │ Caseload Avg Fidelity    │ Bonus     │                │
│     ├──────────────────────────┼───────────┤                │
│     │ ≥ 4.0 / 5               │ +$50      │                │
│     │ ≥ 3.5 / 5               │ +$30      │                │
│     │ ≥ 3.0 / 5               │ +$15      │                │
│     │ Below 3.0               │ $0        │                │
│     └──────────────────────────┴───────────┘                │
│                                                              │
│  4. All Teachers On Track Bonus: (performance)               │
│     Every teacher in caseload has avg fidelity ≥ 4.0        │
│     → +$25 bonus                                            │
│                                                              │
│  TOTAL = Base + Log Rate Bonus                              │
│        + Fidelity Bonus + All On Track Bonus                │
└──────────────────────────────────────────────────────────────┘
```

**What "Teacher Fidelity Performance Bonus" means:**
- The platform averages the fidelity scores of all teachers in the coach's caseload
- If the caseload average is high, the coach is rewarded — because strong fidelity reflects effective coaching
- This directly links coaching quality to teacher implementation quality

**What "All Teachers On Track Bonus" means:**
- If *every single teacher* in the coach's caseload has an average fidelity ≥ 4.0 ("On Track"), the coach earns an additional flat $25
- This rewards coaches who have lifted their entire caseload to a high level, not just a few

**Example Calculation:**

Coach "Rachel Stone" in Fall semester:
- Caseload avg log rate: 76% → Log Rate Bonus = **$20**
- Caseload avg fidelity: 3.8 → Fidelity Bonus = **$30**
- Not all teachers at ≥ 4.0 → All On Track Bonus = **$0**
- Base = **$100**
- **Total = $100 + $20 + $30 + $0 = $150**

---

### 7.3 Admin Incentives

School administrators earn based on how well their *whole school* performs on logging:

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN INCENTIVE FORMULA              │
│                                                         │
│  Base Participation Incentive:     $200 / semester      │
│                                                         │
│  + School Average Log Rate Bonus:                       │
│    ┌───────────────────┬───────────┐                    │
│    │ School Avg Rate   │ Bonus     │                    │
│    ├───────────────────┼───────────┤                    │
│    │ 81 – 100%         │ +$100     │                    │
│    │ 71 – 80%          │ +$80      │                    │
│    │ 60 – 70%          │ +$50      │                    │
│    └───────────────────┴───────────┘                    │
│                                                         │
│  TOTAL = $200 + Rate Bonus                              │
└─────────────────────────────────────────────────────────┘
```

The school average log rate is the **average of all teachers' individual log rates** in that school.

---

### 7.4 Performance Incentives — How the Chain Works

The performance incentive system creates a **linked chain of accountability**:

```
STUDENTS DO WELL
       │
       ▼ (student data shows growth + benchmark achievement)
TEACHER EARNS PERFORMANCE BONUS
       │
       ▼ (teachers' fidelity scores are high)
COACH EARNS FIDELITY PERFORMANCE BONUS
       │
       ▼ (all teachers in caseload are "On Track")
COACH EARNS ALL-ON-TRACK BONUS
```

In plain English:
- **Teachers** are rewarded when their **students improve** and meet benchmarks
- **Coaches** are rewarded when their **teachers implement well** (high fidelity)
- This means coaches are motivated to support teachers who are struggling, not just teachers who are already performing well

---

### 7.5 Incentive Approval Flow

Incentives go through a **3-step process** before funds are confirmed:

```
Step 1: CALCULATED / AWARDED
   The platform calculates formula-based earnings automatically
   OR a user manually awards an incentive (researcher can award anyone)
   Status: "Pending"
        │
        ▼
Step 2: RESEARCHER REVIEW
   Researcher logs in → Goes to Budget & Incentives
   Reviews the pending list
   Can APPROVE or REJECT each item
        │
        ▼
Step 3: APPROVED ✅
   Incentive marked as "Approved"
   Timestamp and approver ID recorded
   Appears in Award History
```

**Incentive Categories:**

| Category | Description | Who It Applies To |
|----------|-------------|------------------|
| Training | Compensation for attending PD sessions, coaching, or labs | All roles |
| Performance | Student growth, benchmark achievement, fidelity bonuses | Teachers, Coaches |
| Logging | Formula-based earnings from log completion rates | Teachers, Coaches, Admins |

**Who can see what:**

| Role | Can See | Can Award |
|------|---------|-----------|
| Teacher | Own incentives only | No |
| Coach | Own incentives + caseload teacher projections | No |
| Admin | Own incentives + school teacher projections | No |
| Researcher | Everyone's incentives + full budget | Yes — can approve/reject/award |

---

## 8. MTSS Monitoring — School Health Indicators

The **MTSS Monitoring** page (visible to Admins and Researchers) shows the overall health of implementation at a school or district level. It uses two sets of indicators:

### Capacity Indicators ("Determinants")

These six factors measure the **environment** that supports or hinders implementation:

```
CAPACITY INDICATOR          STATUS   WHAT IT MEASURES
─────────────────────────────────────────────────────────────
Leadership Support    72%   🟡       Is school leadership actively
                                     supporting implementation?

Coaching Access       85%   🟢       Do teachers have enough coach
                                     contact hours each month?

Staffing Stability    64%   🟡       Has staff turnover disrupted
                                     continuity?

MTSS Maturity         58%   🔴       How established is the MTSS
                                     framework at each school?

Resource Availability 79%   🟢       Are materials, subs, and budget
                                     available to support implementation?

Implementation        70%   🟡       Is the school culture supportive
Climate                              of this instructional approach?
─────────────────────────────────────────────────────────────
Status: 🟢 On Track  🟡 Monitoring  🔴 Needs Attention
```

Each indicator is clickable and shows detailed notes, explanations, and recommended actions.

### Tier Coverage Indicators

These show what percentage of students are receiving **documented** support at each MTSS level:

```
Tier 1 (Universal)    88%  🟢  Target: 100% of students
Tier 2 (Targeted)     71%  🟡  Target: all identified students
Tier 3 (Intensive)    45%  🔴  Below target of 70%
SPED Services         38%  🔴  Only 38% have co-teaching logged
```

---

## 9. Data & Research Analytics

### What Researchers See

The **Research Analytics** page pulls together data from the entire district into one view:

```
TOP STATS (computed live from real data)
────────────────────────────────────────
Schools in Study       Total active schools
Log Entries            Total implementation logs across all schools
Adaptations            Total FRAME-IS adaptation records
Completeness           Average % of expected data that's been entered

LONGITUDINAL FIDELITY CHART
────────────────────────────────────────
Shows average adherence score month-by-month (September → May)
Can be filtered by: Days | Weeks | Year (time period selector)

DSAII PATHWAY INDICATORS
────────────────────────────────────────
Five key drivers of implementation success, shown as % bars:
• Leadership Support (Determinant)     72%
• Coaching Access (Strategy)           85%
• Adaptation Rate                      67%
• Implementation Fidelity              78%
• Student Outcome Trend                54%

SCHOOL COMPARISON TABLE
────────────────────────────────────────
Real school names and real metrics:
• School name
• Log Rate (% of fully completed logs)
• Avg Fidelity score (out of 5)
• Number of adaptations
• % Consistent adaptations
• Data Completeness (% of expected data received)

RECENT IMPLEMENTATION LOGS
────────────────────────────────────────
Last 6 logs across the district
Shows: Teacher name, date, routine, tier badge, completion badge
Click any log → full detail view
```

### Student Data Records

Researchers and teachers can upload **student assessment data** to track learning outcomes:

| Assessment Type | What It Measures |
|----------------|-----------------|
| CBM-Math Concepts & Applications | Curriculum-based math concepts |
| Unit Assessment | End-of-unit test results |
| CBM-Math Computation | Computation-focused skills |
| Goal-Specific Progress Monitoring | Progress toward a specific goal |
| IEP Math Goal Probe | Special education goal progress |
| Intervention Skill Probe | Specific intervention skill |
| Intensive Intervention Probe | High-frequency intensive monitoring |

**Key Data Points Tracked:**
- **Baseline Average**: Where students started
- **Current Average**: Where students are now
- **Growth**: Current minus Baseline (positive = improvement)
- **At/Above Benchmark**: How many students met the target
- **Below Benchmark**: How many students need more support

---

## 10. Notifications — How the System Alerts Users

The platform proactively alerts users when something needs their attention. Notifications appear as a badge count in the sidebar.

| Notification Type | Who Gets It | When |
|------------------|-------------|------|
| Missing Log | Teacher | Teacher hasn't logged in several days |
| Fidelity Due | Teacher | Reminder to complete a fidelity self-check |
| Coaching Follow-up | Coach | Teacher asked a question in feedback queue |
| Training Deadline | Teacher | Upcoming required PD session |
| Student Data Due | Teacher | Student data collection period is due |
| Adaptation Incomplete | Teacher | Logged adaptation but didn't document it |

**Automatic Notification Trigger Example:**

```
Teacher logs a lesson:
   ↓
Teacher checks "Adaptation Occurred: Yes"
   ↓
System immediately creates notification:
"Don't forget to document your adaptation from today's log."
   ↓
Notification appears in teacher's notification badge
   ↓
Teacher opens adaptation form → fills it out → notification resolved
```

---

## 11. Permissions — Who Can See What

The platform uses a **permission system** to control access. Each role has a set of permissions granted to it.

### Permission Summary by Role

| Permission | Teacher | Coach | Admin | Researcher | Super Admin |
|-----------|---------|-------|-------|-----------|-------------|
| Edit/submit logs | ✅ | ❌ | ❌ | ❌ | ✅ |
| View fidelity data | ✅ | ✅ | ✅ | ✅ | ✅ |
| Respond to coaching | ✅ | ✅ | ❌ | ❌ | ✅ |
| View reports/dashboards | ✅ | ✅ | ✅ | ✅ | ✅ |
| View users/caseload | ❌ | ✅ | ✅ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ | ❌ | ✅ |
| Manage org/school | ❌ | ❌ | ✅ | ✅ | ✅ |
| Export data | ❌ | ❌ | ❌ | ✅ | ✅ |
| View student data | ✅ | ❌ | ❌ | ✅ | ✅ |
| Generate reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage schools | ❌ | ❌ | ❌ | ❌ | ✅ |

> If a user does not have a permission, the page or button simply doesn't appear for them — they never see it.

---

## 12. Visual Flow Diagrams

### Full Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW OVERVIEW                         │
└─────────────────────────────────────────────────────────────────┘

  TEACHER                 COACH                  ADMIN
  ───────                ───────                ───────
  1. Plans lesson    →   Sees caseload       →  Sees school
  2. Logs lesson         activity               overview
  3. Rates fidelity      ↓                      ↓
  4. Documents       →  Sends messages       → Reviews
     adaptations        Creates actions        incentives
  5. Answers             Resolves questions     Monitors
     coaching Q's                               MTSS health
       ↓                    ↓                      ↓
       └────────────────────┴──────────────────────┘
                            │
                            ▼
                      RESEARCHER
                      ──────────
                      Sees everything:
                      - Longitudinal trends
                      - Cross-school comparison
                      - Budget management
                      - Data exports
```

### Teacher Logging Flow

```
START
  │
  ▼
Was a Lesson Plan created?
  YES ─────────────────→ Log pre-filled with plan details
  NO  ─────────────────→ Start fresh daily log form
              │
              ▼
Fill out log details
(routine, strategy, tier, duration, completion)
              │
              ▼
Did adaptation occur?
  YES ─────────────────→ Fill adaptation sub-form
  │                       (planned/reactive, consistent/inconsistent,
  │                        what changed, why)
  │
  ├── NO  ─────────────→ Skip adaptation form
  │
  ▼
Submit log
  │
  ├── If adaptation: Notification sent to teacher to document
  │
  ▼
Complete Fidelity Check
(Rate 5 dimensions 1–5)
  │
  ▼
Data available to:
  ├── Teacher: on own dashboard
  ├── Coach: on caseload + teacher detail page
  ├── Admin: on school overview
  └── Researcher: on analytics pages
```

### Incentive Approval Flow

```
Formula runs each semester
           │
           ▼
Earnings calculated per teacher
           │
           ▼
Incentive record created (Status: PENDING)
           │
           ▼
Researcher opens Budget & Incentives → Pending Approvals tab
           │
     ┌─────┴─────┐
   APPROVE      REJECT
     │             │
     ▼             ▼
Status: APPROVED  Removed from list
Timestamp saved
Appears in Award History
```

### Coaching Communication Flow

```
TEACHER                           COACH
───────                          ───────
Types question                        │
in Feedback section                   │
      │                               │
      ▼                               │
FeedbackItem created                  │
(Status: Pending)                     │
      │                               │
      │     ◄── Notification ─────────┤
      │                               │
      │                        Opens Feedback Queue
      │                               │
      │                        Reads question
      │                               │
      │                        Types reply
      │                               │
      │     ◄── Reply visible ────────┤
      │
      ▼
Feedback marked: RESOLVED ✅
Reply appears in Coaching Thread
```

---

## 13. Glossary

| Term | Plain English Definition |
|------|------------------------|
| **Adaptation** | A change a teacher makes to a planned lesson (can be consistent or inconsistent with the protocol) |
| **Adherence** | How closely a teacher follows the instructional protocol |
| **CBM** | Curriculum-Based Measurement — a quick standardized assessment used for progress monitoring |
| **Coaching Cycle** | An ongoing structured relationship between a coach and teacher, with a shared goal and action items |
| **Composite Score** | A single average number combining all 5 fidelity dimension scores |
| **CRA** | Concrete-Representational-Abstract — a math instructional sequence moving from hands-on to abstract |
| **Determinant** | A factor in the school environment that supports or hinders implementation success |
| **Dosage** | The amount and intensity of instruction students receive |
| **EBP** | Evidence-Based Practice — an instructional approach proven effective through research |
| **Fidelity** | How accurately and consistently teachers implement an instructional approach |
| **FRAME-IS** | The framework used to document and evaluate instructional adaptations |
| **IEP** | Individualized Education Program — a legal document outlining special education services for a student |
| **Implementation Log** | A daily record of a lesson a teacher taught |
| **Benchmark Achievement Bonus** | A teacher incentive of +$25 when ≥80% of assessed students score at or above the district benchmark |
| **All Teachers On Track Bonus** | A coach incentive of +$25 when every teacher in the caseload has an average fidelity ≥ 4.0 |
| **Incentive** | A financial reward tied to logging behavior, implementation quality, or student outcomes |
| **Log Completion Rate** | % of lessons marked "Fully Completed" out of all logged lessons |
| **MTSS** | Multi-Tiered System of Supports — a framework for matching student support to need level |
| **PD / PDSession** | Professional Development — training sessions for educators |
| **Planned Adaptation** | A change decided before the lesson began |
| **Reactive Adaptation** | A change made on-the-spot during the lesson |
| **Responsiveness** | How engaged and participatory students are during the lesson |
| **Semester** | Half-year period (Fall or Spring) used for calculating incentives |
| **SPED** | Special Education — services for students with identified learning disabilities or needs |
| **Sustainment** | The likelihood that an instructional approach will continue being used long-term |
| **Tier 1 / 2 / 3** | MTSS support levels (1=all students, 2=at-risk, 3=intensive support) |

---

*Last updated: June 2026*
*Platform: MathImpl — K–8 Mathematics Implementation Dashboard*
