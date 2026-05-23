import type {
  User,
  School,
  ImplementationLog,
  Adaptation,
  FidelityCheck,
  CoachingCycle,
  FeedbackItem,
  TrainingSession,
  TrainingAttendance,
  Notification,
  StudentDataRecord,
  PDSession,
  Permission,
  RolePermissions,
  OrgMember,
  MockCredential,
  Resource,
  LessonPlan,
} from '../types'

// ─── Schools ─────────────────────────────────────────────────────────────────
export const schools: School[] = [
  { id: 'SCH01', name: 'Lincoln K-8 School', districtId: 'dist1' },
  { id: 'SCH02', name: 'Washington Middle School', districtId: 'dist1' },
]

// ─── Users ────────────────────────────────────────────────────────────────────
export const users: User[] = [
  { id: 'T001', name: 'Anna Carter', initials: 'AC', role: 'teacher', schoolId: 'SCH01', coachId: 'C001' },
  { id: 'T002', name: 'Brian Lee', initials: 'BL', role: 'teacher', schoolId: 'SCH01', coachId: 'C001' },
  { id: 'T003', name: 'Carla Nguyen', initials: 'CN', role: 'teacher', schoolId: 'SCH01', coachId: 'C001' },
  { id: 'T004', name: 'David Brooks', initials: 'DB', role: 'teacher', schoolId: 'SCH02', coachId: 'C001' },
  { id: 'T005', name: 'Elena Martinez', initials: 'EM', role: 'teacher', schoolId: 'SCH02', coachId: 'C001' },
  { id: 'A001', name: 'Monica Hill', initials: 'MH', role: 'admin', schoolId: 'SCH01' },
  { id: 'A002', name: 'James Patel', initials: 'JP', role: 'admin', schoolId: 'SCH02' },
  { id: 'C001', name: 'Rachel Stone', initials: 'RS', role: 'coach', schoolId: 'SCH01' },
  { id: 'R001', name: 'Dr. Jing Researcher', initials: 'JR', role: 'researcher', schoolId: 'SCH01' },
]

export const usersByRole: Record<string, User> = {
  teacher: users[0],
  admin: users[5],
  coach: users[7],
  researcher: users[8],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function randomBetween(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min)
}

export const instructionalRoutines = ['Number Sense Warm-up', 'Explicit Instruction', 'Guided Practice', 'Problem Solving Task', 'Fluency Practice']
export const ebpComponents = ['CRA', 'Explicit Modeling', 'Error Correction', 'Distributed Practice', 'Worked Examples']
export const implementationStrategies = ['Think-aloud', 'Peer-assisted learning', 'Interleaved practice', 'Corrective feedback']
export const implementationTiers: ImplementationLog['tier'][] = ['Tier 1', 'Tier 2', 'Tier 3', 'SPED']

const routines = instructionalRoutines
const ebps = ebpComponents
const strategies = implementationStrategies
const tiers = implementationTiers

function makeLog(
  id: string,
  teacherId: string,
  schoolId: string,
  daysBack: number,
  completionWeights: number[],
): ImplementationLog {
  const rand = Math.random()
  let completion: ImplementationLog['lessonCompletion'] = 'fully'
  if (rand < completionWeights[0]) completion = 'fully'
  else if (rand < completionWeights[0] + completionWeights[1]) completion = 'partially'
  else completion = 'not_completed'

  return {
    id,
    teacherId,
    schoolId,
    date: daysAgo(daysBack),
    instructionalRoutine: routines[randomBetween(0, 4)],
    ebpComponent: [ebps[randomBetween(0, 4)]],
    implementationStrategy: strategies[randomBetween(0, 3)],
    tier: tiers[randomBetween(0, 3)],
    durationMinutes: randomBetween(20, 60),
    lessonCompletion: completion,
    adaptationOccurred: Math.random() > 0.7,
    notes: Math.random() > 0.6 ? 'Students needed additional scaffolding today.' : undefined,
  }
}

// ─── Implementation Logs ──────────────────────────────────────────────────────
// Anna: ~82% completion, Brian: ~65%, Carla: ~91%, David: ~48%, Elena: ~77%
export const implementationLogs: ImplementationLog[] = [
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-T001-${i}`, 'T001', 'SCH01', i * 7 + randomBetween(0, 6), [0.82, 0.12, 0.06])),
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-T002-${i}`, 'T002', 'SCH01', i * 7 + randomBetween(0, 6), [0.65, 0.25, 0.10])),
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-T003-${i}`, 'T003', 'SCH01', i * 7 + randomBetween(0, 6), [0.91, 0.07, 0.02])),
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-T004-${i}`, 'T004', 'SCH02', i * 7 + randomBetween(0, 6), [0.48, 0.35, 0.17])),
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-T005-${i}`, 'T005', 'SCH02', i * 7 + randomBetween(0, 6), [0.77, 0.17, 0.06])),
]

// ─── Fidelity Checks ──────────────────────────────────────────────────────────
function makeFidelity(id: string, teacherId: string, logId: string, daysBack: number, avgScore: number): FidelityCheck {
  const variance = 0.8
  const score = (base: number) => Math.min(5, Math.max(1, Math.round((base + (Math.random() - 0.5) * variance * 2) * 10) / 10))
  return {
    id,
    teacherId,
    logId,
    date: daysAgo(daysBack),
    adherence: score(avgScore),
    dosage: score(avgScore + 0.2),
    quality: score(avgScore - 0.1),
    responsiveness: score(avgScore - 0.2),
    confidence: score(avgScore + 0.1),
    reflectionNotes: Math.random() > 0.5 ? 'Felt confident with CRA today, pacing was good.' : undefined,
  }
}

// Anna avg ~3.8, Brian avg ~3.2, Carla avg ~4.6, David avg ~2.9, Elena avg ~3.5
export const fidelityChecks: FidelityCheck[] = [
  ...implementationLogs.filter(l => l.teacherId === 'T001').map((l, i) => makeFidelity(`fid-T001-${i}`, 'T001', l.id, i * 7, 3.8)),
  ...implementationLogs.filter(l => l.teacherId === 'T002').map((l, i) => makeFidelity(`fid-T002-${i}`, 'T002', l.id, i * 7, 3.2)),
  ...implementationLogs.filter(l => l.teacherId === 'T003').map((l, i) => makeFidelity(`fid-T003-${i}`, 'T003', l.id, i * 7, 4.6)),
  ...implementationLogs.filter(l => l.teacherId === 'T004').map((l, i) => makeFidelity(`fid-T004-${i}`, 'T004', l.id, i * 7, 2.9)),
  ...implementationLogs.filter(l => l.teacherId === 'T005').map((l, i) => makeFidelity(`fid-T005-${i}`, 'T005', l.id, i * 7, 3.5)),
]

// ─── Adaptations ──────────────────────────────────────────────────────────────
export const modificationOptions = ['Content', 'Timing/Duration', 'Materials', 'Delivery method', 'Grouping']
export const adaptationReasons = ['Time constraints', 'Student responsiveness', 'Scheduling issues', 'Resource limitations', 'Behavior concerns', 'Language needs']

const modOptions = modificationOptions
const reasonOptions = adaptationReasons

export const adaptations: Adaptation[] = [
  { id: 'adp-1', logId: 'log-T001-0', teacherId: 'T001', whatModified: ['Timing/Duration', 'Content'], reasons: ['Time constraints'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Shortened warm-up to fit within class period.', date: daysAgo(5) },
  { id: 'adp-2', logId: 'log-T001-2', teacherId: 'T001', whatModified: ['Delivery method'], reasons: ['Student responsiveness'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Switched to pair work for guided practice.', date: daysAgo(19) },
  { id: 'adp-3', logId: 'log-T001-4', teacherId: 'T001', whatModified: ['Materials'], reasons: ['Resource limitations'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Used whiteboard instead of printed materials.', date: daysAgo(33) },
  { id: 'adp-4', logId: 'log-T001-6', teacherId: 'T001', whatModified: ['Grouping'], reasons: ['Behavior concerns'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Regrouped students to separate disruptions.', date: daysAgo(47) },
  { id: 'adp-5', logId: 'log-T001-8', teacherId: 'T001', whatModified: ['Content'], reasons: ['Language needs'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Added bilingual vocabulary support.', date: daysAgo(61) },
  { id: 'adp-6', logId: 'log-T002-0', teacherId: 'T002', whatModified: ['Timing/Duration'], reasons: ['Scheduling issues'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Abbreviated lesson due to assembly schedule.', date: daysAgo(6) },
  { id: 'adp-7', logId: 'log-T002-2', teacherId: 'T002', whatModified: ['Delivery method', 'Materials'], reasons: ['Student responsiveness', 'Resource limitations'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Used manipulatives when technology was unavailable.', date: daysAgo(20) },
  { id: 'adp-8', logId: 'log-T002-4', teacherId: 'T002', whatModified: ['Content'], reasons: ['Time constraints'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Skipped extension problem to cover core standard.', date: daysAgo(34) },
  { id: 'adp-9', logId: 'log-T002-6', teacherId: 'T002', whatModified: ['Grouping'], reasons: ['Behavior concerns'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Moved to whole-group after small-group disruption.', date: daysAgo(48) },
  { id: 'adp-10', logId: 'log-T003-0', teacherId: 'T003', whatModified: ['Delivery method'], reasons: ['Student responsiveness'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Added additional worked examples for struggling students.', date: daysAgo(7) },
  { id: 'adp-11', logId: 'log-T003-2', teacherId: 'T003', whatModified: ['Content', 'Materials'], reasons: ['Language needs'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Provided sentence frames for ELL students.', date: daysAgo(21) },
  { id: 'adp-12', logId: 'log-T003-4', teacherId: 'T003', whatModified: ['Timing/Duration'], reasons: ['Time constraints'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Extended practice time based on formative check.', date: daysAgo(35) },
  { id: 'adp-13', logId: 'log-T004-0', teacherId: 'T004', whatModified: ['Delivery method', 'Grouping'], reasons: ['Behavior concerns', 'Student responsiveness'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Pivoted to direct instruction when cooperative work failed.', date: daysAgo(8) },
  { id: 'adp-14', logId: 'log-T004-2', teacherId: 'T004', whatModified: ['Materials'], reasons: ['Resource limitations'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'No access to technology; reverted to paper worksheets.', date: daysAgo(22) },
  { id: 'adp-15', logId: 'log-T004-4', teacherId: 'T004', whatModified: ['Content'], reasons: ['Time constraints', 'Scheduling issues'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Could not complete all lesson components.', date: daysAgo(36) },
  { id: 'adp-16', logId: 'log-T004-6', teacherId: 'T004', whatModified: ['Timing/Duration'], reasons: ['Student responsiveness'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Slowed pace after observing low engagement.', date: daysAgo(50) },
  { id: 'adp-17', logId: 'log-T005-0', teacherId: 'T005', whatModified: ['Delivery method'], reasons: ['Student responsiveness'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Incorporated additional concrete materials for Tier 3.', date: daysAgo(9) },
  { id: 'adp-18', logId: 'log-T005-2', teacherId: 'T005', whatModified: ['Content', 'Grouping'], reasons: ['Language needs', 'Behavior concerns'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Differentiated task complexity by tier group.', date: daysAgo(23) },
  { id: 'adp-19', logId: 'log-T005-4', teacherId: 'T005', whatModified: ['Materials'], reasons: ['Resource limitations'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Used classroom funds for base-ten blocks.', date: daysAgo(37) },
  { id: 'adp-20', logId: 'log-T005-6', teacherId: 'T005', whatModified: ['Timing/Duration'], reasons: ['Time constraints'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Shortened fluency drill to address misconceptions.', date: daysAgo(51) },
  { id: 'adp-21', logId: 'log-T001-10', teacherId: 'T001', whatModified: modOptions.slice(0, 2), reasons: [reasonOptions[0]], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Planned pacing adjustment for upcoming assessment week.', date: daysAgo(75) },
  { id: 'adp-22', logId: 'log-T002-8', teacherId: 'T002', whatModified: [modOptions[2]], reasons: [reasonOptions[3]], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Copied from another classroom due to printer outage.', date: daysAgo(62) },
  { id: 'adp-23', logId: 'log-T003-6', teacherId: 'T003', whatModified: [modOptions[1]], reasons: [reasonOptions[1]], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Added extra think time after data review.', date: daysAgo(49) },
  { id: 'adp-24', logId: 'log-T004-8', teacherId: 'T004', whatModified: [modOptions[4]], reasons: [reasonOptions[4]], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Separated two students after repeated disruptions.', date: daysAgo(64) },
  { id: 'adp-25', logId: 'log-T005-8', teacherId: 'T005', whatModified: [modOptions[0]], reasons: [reasonOptions[5]], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Translated key vocabulary into Spanish for newcomers.', date: daysAgo(65) },
]

// ─── Coaching Cycles ──────────────────────────────────────────────────────────
export const coachingCycles: CoachingCycle[] = [
  {
    id: 'cyc-T001',
    teacherId: 'T001',
    coachId: 'C001',
    goal: 'Increase use of CRA sequence during explicit instruction to improve Tier 2 student outcomes',
    startDate: daysAgo(45),
    status: 'active',
    messages: [
      { id: 'msg-T001-1', cycleId: 'cyc-T001', senderId: 'C001', body: 'Hi Anna! Looking at your recent logs, your CRA implementation is strong. Let\'s focus on the representational bridge this cycle.', createdAt: daysAgo(40) },
      { id: 'msg-T001-2', cycleId: 'cyc-T001', senderId: 'T001', body: 'Thanks Rachel! I\'ve been working on the pictorial step. Some students still jump straight to abstract — any strategies?', createdAt: daysAgo(38) },
      { id: 'msg-T001-3', cycleId: 'cyc-T001', senderId: 'C001', body: 'Try requiring students to draw their thinking before writing the equation. I\'ll share a graphic organizer that works well.', createdAt: daysAgo(36) },
      { id: 'msg-T001-4', cycleId: 'cyc-T001', senderId: 'T001', body: 'Used the organizer today — huge difference! My Tier 2 students actually stayed in the representational stage longer.', createdAt: daysAgo(20) },
      { id: 'msg-T001-5', cycleId: 'cyc-T001', senderId: 'C001', body: 'Excellent! I noticed that in your fidelity check too. Let\'s discuss your data at our next meeting.', createdAt: daysAgo(18) },
    ],
    actions: [
      { id: 'act-T001-1', cycleId: 'cyc-T001', description: 'Complete CRA graphic organizer for 3 lessons', dueDate: daysAgo(-7), completedAt: daysAgo(15) },
      { id: 'act-T001-2', cycleId: 'cyc-T001', description: 'Observe Tier 2 student engagement during representational phase', dueDate: daysAgo(-3), completedAt: undefined },
      { id: 'act-T001-3', cycleId: 'cyc-T001', description: 'Complete fidelity self-check for week 3', dueDate: daysAgo(-10), completedAt: daysAgo(10) },
    ],
  },
  {
    id: 'cyc-T002',
    teacherId: 'T002',
    coachId: 'C001',
    goal: 'Improve lesson completion rate by strengthening pacing strategies and time management',
    startDate: daysAgo(40),
    status: 'active',
    messages: [
      { id: 'msg-T002-1', cycleId: 'cyc-T002', senderId: 'C001', body: 'Brian, I\'ve noticed your log completion rate has dipped. Let\'s work on pacing — what feels like the biggest barrier?', createdAt: daysAgo(38) },
      { id: 'msg-T002-2', cycleId: 'cyc-T002', senderId: 'T002', body: 'Honestly it\'s transitions. Students take 8-10 minutes between activities and I run out of time.', createdAt: daysAgo(35) },
      { id: 'msg-T002-3', cycleId: 'cyc-T002', senderId: 'C001', body: 'That\'s very common. Try a visual timer and a 2-minute warning signal. Want me to demo it during your prep?', createdAt: daysAgo(33) },
      { id: 'msg-T002-4', cycleId: 'cyc-T002', senderId: 'T002', body: 'Yes please! Also wondering if the fluency practice block is too long — 20 minutes seems excessive.', createdAt: daysAgo(15) },
    ],
    actions: [
      { id: 'act-T002-1', cycleId: 'cyc-T002', description: 'Implement visual timer during transitions for 2 weeks', dueDate: daysAgo(-5), completedAt: undefined },
      { id: 'act-T002-2', cycleId: 'cyc-T002', description: 'Time each lesson component and log results', dueDate: daysAgo(-2), completedAt: undefined },
    ],
  },
  {
    id: 'cyc-T003',
    teacherId: 'T003',
    coachId: 'C001',
    goal: 'Deepen fidelity to error correction protocols during explicit modeling',
    startDate: daysAgo(50),
    status: 'active',
    messages: [
      { id: 'msg-T003-1', cycleId: 'cyc-T003', senderId: 'C001', body: 'Carla, your fidelity scores are excellent! For this cycle let\'s focus on error correction — making it more systematic.', createdAt: daysAgo(48) },
      { id: 'msg-T003-2', cycleId: 'cyc-T003', senderId: 'T003', body: 'I\'d love that. I feel like I correct errors differently depending on the student and I want to be more consistent.', createdAt: daysAgo(44) },
      { id: 'msg-T003-3', cycleId: 'cyc-T003', senderId: 'C001', body: 'Exactly the right instinct. I\'ll share the district error correction protocol — it has a 4-step model.', createdAt: daysAgo(42) },
      { id: 'msg-T003-4', cycleId: 'cyc-T003', senderId: 'T003', body: 'Used the 4-step model today — "stop, model, re-teach, practice." Students responded really well!', createdAt: daysAgo(25) },
      { id: 'msg-T003-5', cycleId: 'cyc-T003', senderId: 'C001', body: 'That\'s fantastic. I can see it in your fidelity data — responsiveness scores jumped. Keep it up!', createdAt: daysAgo(22) },
    ],
    actions: [
      { id: 'act-T003-1', cycleId: 'cyc-T003', description: 'Implement 4-step error correction protocol consistently', dueDate: daysAgo(-1), completedAt: daysAgo(20) },
      { id: 'act-T003-2', cycleId: 'cyc-T003', description: 'Track error correction instances in daily log notes', dueDate: daysAgo(-4), completedAt: daysAgo(12) },
      { id: 'act-T003-3', cycleId: 'cyc-T003', description: 'Co-plan next unit with error correction focus', dueDate: daysAgo(-14), completedAt: undefined },
    ],
  },
  {
    id: 'cyc-T004',
    teacherId: 'T004',
    coachId: 'C001',
    goal: 'Build consistency in Tier 2 small group delivery through structured routine',
    startDate: daysAgo(35),
    status: 'active',
    messages: [
      { id: 'msg-T004-1', cycleId: 'cyc-T004', senderId: 'C001', body: 'David, let\'s start by mapping out what a typical Tier 2 session looks like for you right now.', createdAt: daysAgo(33) },
      { id: 'msg-T004-2', cycleId: 'cyc-T004', senderId: 'T004', body: 'Honestly it varies a lot. I don\'t have a set routine yet — sometimes I do re-teaching, sometimes extra practice.', createdAt: daysAgo(30) },
      { id: 'msg-T004-3', cycleId: 'cyc-T004', senderId: 'C001', body: 'Let\'s build a structured routine together: warm-up, targeted instruction, guided practice, exit check. 20 min total.', createdAt: daysAgo(28) },
      { id: 'msg-T004-4', cycleId: 'cyc-T004', senderId: 'T004', body: 'I tried the routine template today. It helped a lot — I actually finished on time for the first time in weeks!', createdAt: daysAgo(10) },
    ],
    actions: [
      { id: 'act-T004-1', cycleId: 'cyc-T004', description: 'Use Tier 2 routine template for all small group sessions', dueDate: daysAgo(-7), completedAt: undefined },
      { id: 'act-T004-2', cycleId: 'cyc-T004', description: 'Complete 3 fidelity self-checks for Tier 2 sessions', dueDate: daysAgo(-10), completedAt: undefined },
    ],
  },
  {
    id: 'cyc-T005',
    teacherId: 'T005',
    coachId: 'C001',
    goal: 'Improve Tier 3 data use — connecting progress monitoring to instructional decisions',
    startDate: daysAgo(42),
    status: 'active',
    messages: [
      { id: 'msg-T005-1', cycleId: 'cyc-T005', senderId: 'C001', body: 'Elena, your Tier 3 work is solid. This cycle I want to focus on data-informed decisions — using PM scores to adjust instruction.', createdAt: daysAgo(40) },
      { id: 'msg-T005-2', cycleId: 'cyc-T005', senderId: 'T005', body: 'I collect the data but honestly I\'m not always sure what to do with it. The scores don\'t always match what I see in class.', createdAt: daysAgo(37) },
      { id: 'msg-T005-3', cycleId: 'cyc-T005', senderId: 'C001', body: 'That\'s a really common feeling. Let\'s look at your data together and I can show you a decision tree for Tier 3 adjustments.', createdAt: daysAgo(35) },
      { id: 'msg-T005-4', cycleId: 'cyc-T005', senderId: 'T005', body: 'The decision tree is really helpful — adjusted two students\' intensity last week based on flat trajectory data.', createdAt: daysAgo(18) },
      { id: 'msg-T005-5', cycleId: 'cyc-T005', senderId: 'C001', body: 'Perfect application. How are those students responding to the increased intensity?', createdAt: daysAgo(16) },
    ],
    actions: [
      { id: 'act-T005-1', cycleId: 'cyc-T005', description: 'Review PM data weekly and document decisions in log', dueDate: daysAgo(-3), completedAt: daysAgo(14) },
      { id: 'act-T005-2', cycleId: 'cyc-T005', description: 'Present Tier 3 data at next MTSS team meeting', dueDate: daysAgo(-8), completedAt: undefined },
      { id: 'act-T005-3', cycleId: 'cyc-T005', description: 'Adjust instruction for 2 students with flat trajectories', dueDate: daysAgo(-5), completedAt: daysAgo(16) },
    ],
  },
]

// ─── Training Sessions ────────────────────────────────────────────────────────
const sessionTemplates = [
  { title: 'Math MTSS Overview & Tier Structure', type: 'training' as const, durationHours: 3 },
  { title: 'CRA Instruction: Concrete Phase', type: 'training' as const, durationHours: 2 },
  { title: 'CRA Instruction: Representational Phase', type: 'lab' as const, durationHours: 2 },
  { title: 'Error Correction Protocols', type: 'training' as const, durationHours: 1.5 },
  { title: 'Fidelity Self-Assessment Practices', type: 'coaching' as const, durationHours: 1 },
  { title: 'Tier 2 Small Group Routines', type: 'lab' as const, durationHours: 2.5 },
  { title: 'Data-Driven Instructional Decisions', type: 'coaching' as const, durationHours: 2 },
  { title: 'Adaptation Documentation (FRAME-IS)', type: 'training' as const, durationHours: 1.5 },
]

function makeTrainingSessions(teacherId: string): TrainingSession[] {
  return sessionTemplates.map((s, i) => ({
    id: `trn-${teacherId}-${i}`,
    ...s,
    date: daysAgo(90 - i * 10),
    attended: i !== 5,
  }))
}

export const trainingSessions: Record<string, TrainingSession[]> = {
  T001: makeTrainingSessions('T001'),
  T002: makeTrainingSessions('T002'),
  T003: makeTrainingSessions('T003'),
  T004: makeTrainingSessions('T004'),
  T005: makeTrainingSessions('T005'),
}

// ─── Training Attendances ─────────────────────────────────────────────────────
export const trainingAttendances: TrainingAttendance[] = [
  { id: 'ta-1', teacherId: 'T001', sessionTitle: 'Fidelity Self-Assessment Practices', type: 'coaching', checkedInAt: daysAgo(30) + 'T09:00:00', checkedOutAt: daysAgo(30) + 'T10:30:00' },
  { id: 'ta-2', teacherId: 'T001', sessionTitle: 'Adaptation Documentation (FRAME-IS)', type: 'training', checkedInAt: daysAgo(45) + 'T13:00:00', checkedOutAt: daysAgo(45) + 'T15:00:00' },
  { id: 'ta-3', teacherId: 'T002', sessionTitle: 'Data-Driven Decision Making Q3', type: 'training', checkedInAt: daysAgo(15) + 'T09:00:00', checkedOutAt: daysAgo(15) + 'T11:00:00' },
  { id: 'ta-4', teacherId: 'T001', sessionTitle: 'Data-Driven Decision Making Q3', type: 'training', checkedInAt: daysAgo(15) + 'T09:00:00', checkedOutAt: daysAgo(15) + 'T11:00:00' },
]

// ─── Student Data Records ─────────────────────────────────────────────────────
export const studentDataRecords: StudentDataRecord[] = [
  { id: 'sdr-1',  teacherId: 'T001', date: daysAgo(60), dataType: 'Benchmark Score',      value: 68, tier: 'Tier 1', logId: 'log-T001-8' },
  { id: 'sdr-2',  teacherId: 'T001', date: daysAgo(50), dataType: 'Progress Monitoring',  value: 71, tier: 'Tier 2', logId: 'log-T001-7' },
  { id: 'sdr-3',  teacherId: 'T001', date: daysAgo(42), dataType: 'Class Average',        value: 74, tier: 'Tier 1', logId: 'log-T001-6' },
  { id: 'sdr-4',  teacherId: 'T001', date: daysAgo(35), dataType: 'Progress Monitoring',  value: 76, tier: 'Tier 2', logId: 'log-T001-5' },
  { id: 'sdr-5',  teacherId: 'T001', date: daysAgo(28), dataType: 'Benchmark Score',      value: 79, tier: 'Tier 1', logId: 'log-T001-4' },
  { id: 'sdr-6',  teacherId: 'T001', date: daysAgo(21), dataType: 'Class Average',        value: 81, tier: 'Tier 1', logId: 'log-T001-3' },
  { id: 'sdr-7',  teacherId: 'T001', date: daysAgo(14), dataType: 'Progress Monitoring',  value: 83, tier: 'Tier 3', logId: 'log-T001-2' },
  { id: 'sdr-8',  teacherId: 'T001', date: daysAgo(7),  dataType: 'Class Average',        value: 85, tier: 'Tier 1', logId: 'log-T001-1' },
  { id: 'sdr-9',  teacherId: 'T002', date: daysAgo(55), dataType: 'Benchmark Score',      value: 62, tier: 'Tier 2', logId: 'log-T002-7' },
  { id: 'sdr-10', teacherId: 'T002', date: daysAgo(40), dataType: 'Progress Monitoring',  value: 65, tier: 'Tier 2', logId: 'log-T002-5' },
  { id: 'sdr-11', teacherId: 'T002', date: daysAgo(25), dataType: 'Class Average',        value: 67, tier: 'Tier 1', logId: 'log-T002-3' },
  { id: 'sdr-12', teacherId: 'T002', date: daysAgo(10), dataType: 'Progress Monitoring',  value: 70, tier: 'Tier 3', logId: 'log-T002-1' },
  { id: 'sdr-13', teacherId: 'T003', date: daysAgo(45), dataType: 'Benchmark Score',      value: 88, tier: 'Tier 1', logId: 'log-T003-6' },
  { id: 'sdr-14', teacherId: 'T003', date: daysAgo(30), dataType: 'Class Average',        value: 91, tier: 'Tier 1', logId: 'log-T003-4' },
  { id: 'sdr-15', teacherId: 'T003', date: daysAgo(15), dataType: 'Progress Monitoring',  value: 93, tier: 'Tier 2', logId: 'log-T003-2' },
  { id: 'sdr-16', teacherId: 'T004', date: daysAgo(50), dataType: 'Benchmark Score',      value: 55, tier: 'Tier 2', logId: 'log-T004-7' },
  { id: 'sdr-17', teacherId: 'T004', date: daysAgo(35), dataType: 'Progress Monitoring',  value: 52, tier: 'Tier 3', logId: 'log-T004-5' },
  { id: 'sdr-18', teacherId: 'T004', date: daysAgo(20), dataType: 'Class Average',        value: 58, tier: 'Tier 1', logId: 'log-T004-2' },
  { id: 'sdr-19', teacherId: 'T005', date: daysAgo(45), dataType: 'Class Average',        value: 75, tier: 'Tier 1', logId: 'log-T005-6' },
  { id: 'sdr-20', teacherId: 'T005', date: daysAgo(15), dataType: 'Progress Monitoring',  value: 79, tier: 'Tier 2', logId: 'log-T005-2' },
]

// ─── PD Sessions ──────────────────────────────────────────────────────────────
export const pdSessions: PDSession[] = [
  { id: 'pd-1', title: 'Math MTSS Year-End Review', type: 'training', scheduledDate: daysAgo(-14), durationHours: 3, targetAudience: 'All Teachers', facilitator: 'Rachel Stone', location: 'District Office — Room 101', enrolledCount: 18, capacity: 25, status: 'upcoming', description: 'End-of-year review of MTSS implementation fidelity across all tiers. Teams will analyze district-wide data, identify trends, and set goals for the following school year.' },
  { id: 'pd-2', title: 'CRA Lab: Representational Phase', type: 'lab', scheduledDate: daysAgo(-7), durationHours: 2.5, targetAudience: 'Tier 2 Teachers', facilitator: 'Rachel Stone', location: 'Lincoln K-8 School — Lab A', enrolledCount: 10, capacity: 12, status: 'upcoming', description: 'Hands-on lab exploring the pictorial/representational stage of the CRA sequence. Students will practice drawing models and diagrams to bridge concrete manipulatives and abstract symbols.' },
  { id: 'pd-3', title: 'Coaching Conversation Frameworks', type: 'coaching', scheduledDate: daysAgo(-3), durationHours: 2, targetAudience: 'Coaches', facilitator: 'Monica Hill', location: 'Virtual (Zoom)', enrolledCount: 4, capacity: 6, status: 'upcoming', description: 'Coaching session focused on structured conversation frameworks for observational feedback, goal-setting dialogues, and action planning with teachers.' },
  { id: 'pd-4', title: 'Data-Driven Decision Making Q3', type: 'training', scheduledDate: daysAgo(15), durationHours: 2, targetAudience: 'All Teachers', facilitator: 'Rachel Stone', location: 'Washington Middle School — Cafeteria', enrolledCount: 22, capacity: 25, status: 'completed', description: 'Training on interpreting Q3 progress monitoring data to make Tier placement decisions. Covered data decision trees, cut scores, and documentation requirements for Tier 2 and Tier 3 adjustments.' },
  { id: 'pd-5', title: 'Fidelity Self-Assessment Practices', type: 'coaching', scheduledDate: daysAgo(30), durationHours: 1.5, targetAudience: 'All Teachers', facilitator: 'Rachel Stone', location: 'Lincoln K-8 School — Library', enrolledCount: 14, capacity: 20, status: 'completed', description: 'Coaching session on using the five-dimension fidelity rubric for self-reflection and goal-setting. Students calibrated ratings against video examples and identified one growth area for the next cycle.' },
  { id: 'pd-6', title: 'Adaptation Documentation (FRAME-IS)', type: 'training', scheduledDate: daysAgo(45), durationHours: 2, targetAudience: 'All Staff', facilitator: 'Monica Hill', location: 'District Office — Room 204', enrolledCount: 30, capacity: 30, status: 'completed', description: 'Training on the FRAME-IS framework for classifying, documenting, and analyzing instructional adaptations. Covered the six modification categories, fidelity implications, and how to log adaptations in the system.' },
]

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'n1', userId: 'T001', message: 'Your fidelity self-check is due — last completed 8 days ago.', type: 'fidelity_due', createdAt: daysAgo(1) },
  { id: 'n2', userId: 'T001', message: 'Rachel Stone left feedback on your coaching thread.', type: 'coaching_followup', createdAt: daysAgo(2) },
  { id: 'n3', userId: 'T001', message: '"Data-Driven Instructional Decisions" training is in 3 days.', type: 'training_deadline', createdAt: daysAgo(0) },
  { id: 'n4', userId: 'T002', message: 'Implementation log missing for 3 days.', type: 'missing_log', createdAt: daysAgo(0) },
  { id: 'n5', userId: 'T002', message: 'Your fidelity self-check is due.', type: 'fidelity_due', createdAt: daysAgo(1) },
  { id: 'n6', userId: 'T002', message: 'New message from Rachel Stone in your coaching thread.', type: 'coaching_followup', createdAt: daysAgo(3) },
  { id: 'n7', userId: 'T003', message: 'Fidelity self-check due this week.', type: 'fidelity_due', createdAt: daysAgo(2) },
  { id: 'n8', userId: 'T003', message: 'Rachel Stone left a comment on your adaptation documentation.', type: 'coaching_followup', createdAt: daysAgo(1) },
  { id: 'n9', userId: 'T003', message: 'Upcoming training: Adaptation Documentation (FRAME-IS) on Friday.', type: 'training_deadline', createdAt: daysAgo(0) },
  { id: 'n10', userId: 'C001', message: '2 teachers have pending coaching questions.', type: 'coaching_followup', createdAt: daysAgo(0) },
  { id: 'n11', userId: 'C001', message: 'David Brooks\'s fidelity average has dropped below 3.0.', type: 'fidelity_due', createdAt: daysAgo(1) },
  { id: 'n12', userId: 'C001', message: 'Brian Lee has missing logs for 3 days.', type: 'missing_log', createdAt: daysAgo(2) },
  { id: 'n13', userId: 'A001', message: 'Monthly MTSS implementation report is ready for review.', type: 'missing_log', createdAt: daysAgo(0) },
  { id: 'n14', userId: 'A001', message: 'Washington Middle School fidelity average dropped to 3.1 this week.', type: 'fidelity_due', createdAt: daysAgo(1) },
  { id: 'n15', userId: 'A001', message: 'Training participation report updated.', type: 'training_deadline', createdAt: daysAgo(3) },
  { id: 'n16', userId: 'R001', message: 'New implementation data available for Q2 export.', type: 'missing_log', createdAt: daysAgo(0) },
  { id: 'n17', userId: 'R001', message: 'Cross-site comparison data refresh complete.', type: 'coaching_followup', createdAt: daysAgo(2) },
  { id: 'n18', userId: 'R001', message: 'Site B monthly upload is pending review.', type: 'fidelity_due', createdAt: daysAgo(1) },
  { id: 'n19', userId: 'T001', message: 'Student data upload due — please submit your latest progress monitoring scores.', type: 'student_data_due', createdAt: daysAgo(2) },
  { id: 'n20', userId: 'T002', message: 'Your student data upload is overdue. Please upload your class scores this week.', type: 'student_data_due', createdAt: daysAgo(1) },
  { id: 'n21', userId: 'T004', message: "Don't forget to document your adaptation from today's log.", type: 'adaptation_incomplete', createdAt: daysAgo(0) },
]

// ─── Feedback Items ───────────────────────────────────────────────────────────
export const feedbackItems: FeedbackItem[] = [
  {
    id: 'fq1', teacherId: 'T001', coachId: 'C001', cycleId: 'cyc-T001',
    teacherName: 'Anna Carter', initials: 'AC', date: '2026-05-15',
    question: 'How should I handle students who skip the representational phase during CRA? They jump straight to the abstract and I\'m not sure how to redirect without losing momentum.',
    reply: '', resolved: false,
  },
  {
    id: 'fq2', teacherId: 'T002', coachId: 'C001', cycleId: 'cyc-T002',
    teacherName: 'Brian Lee', initials: 'BL', date: '2026-05-14',
    question: 'My lesson ran 10 minutes over today — should I log it as partially completed or fully completed? The content was all covered just not in the time I planned.',
    reply: '', resolved: false,
  },
  {
    id: 'fq3', teacherId: 'T004', coachId: 'C001', cycleId: 'cyc-T004',
    teacherName: 'David Brooks', initials: 'DB', date: '2026-05-13',
    question: 'Can I count co-teaching sessions with the special ed teacher as a Tier 2 intervention? We\'re working with the same 5 students every day.',
    reply: '', resolved: false,
  },
]

// ─── Resources ────────────────────────────────────────────────────────────────
export const resources: Resource[] = [
  { id: 'res-1', title: 'CRA Routine Implementation Guide', type: 'video', duration: '22 min', description: 'Step-by-step walkthrough of the Concrete-Representational-Abstract sequence.', accessRoles: ['teacher', 'coach'], uploadedAt: '2025-08-01' },
  { id: 'res-2', title: 'MTSS Mathematics Implementation Manual', type: 'pdf', duration: '48 pages', description: 'Complete district manual for multi-tiered math support.', accessRoles: ['teacher', 'coach', 'admin', 'researcher'], uploadedAt: '2025-08-01' },
  { id: 'res-3', title: 'Daily Log Completion Checklist', type: 'pdf', duration: '1 page', description: 'Quick reference for completing your daily implementation log.', accessRoles: ['teacher'], uploadedAt: '2025-08-05' },
  { id: 'res-4', title: 'Fidelity Self-Assessment Rubric', type: 'pdf', duration: '2 pages', description: 'Detailed rubric aligned to the 5 fidelity dimensions.', accessRoles: ['teacher', 'coach'], uploadedAt: '2025-08-05' },
  { id: 'res-5', title: 'Tier 2 Small Group Strategies', type: 'video', duration: '18 min', description: 'Evidence-based strategies for Tier 2 targeted instruction.', accessRoles: ['teacher', 'coach'], uploadedAt: '2025-08-10' },
  { id: 'res-6', title: 'Adaptation Decision Guide (FRAME-IS)', type: 'pdf', duration: '6 pages', description: 'Framework for documenting and evaluating instructional adaptations.', accessRoles: ['teacher', 'coach', 'researcher'], uploadedAt: '2025-08-10' },
  { id: 'res-7', title: 'Error Correction Protocol Walkthrough', type: 'video', duration: '15 min', description: 'Demonstration of the 4-step error correction model.', accessRoles: ['teacher', 'coach'], uploadedAt: '2025-09-01' },
  { id: 'res-8', title: 'Progress Monitoring Interpretation Guide', type: 'pdf', duration: '12 pages', description: 'How to use progress monitoring data for Tier 3 decisions.', accessRoles: ['teacher', 'coach', 'researcher'], uploadedAt: '2025-09-01' },
  { id: 'res-9', title: 'Lesson Plan Template — CRA Sequence', type: 'word', duration: '3 pages', description: 'Editable Word template for planning lessons using the CRA instructional sequence.', accessRoles: ['teacher'], uploadedAt: '2025-09-15' },
  { id: 'res-10', title: 'Coaching Cycle Notes Template', type: 'word', duration: '2 pages', description: 'Editable Word document for documenting coaching cycle goals, observations, and action items.', accessRoles: ['coach', 'admin'], uploadedAt: '2025-09-15' },
  { id: 'res-11', title: 'District MTSS Data Summary Report', type: 'pdf', duration: '8 pages', description: 'Aggregated district-level MTSS implementation report for leadership review.', accessRoles: ['admin', 'researcher'], uploadedAt: '2025-10-01' },
  { id: 'res-12', title: 'Implementation Science Research Brief', type: 'pdf', duration: '14 pages', description: 'Research brief on DSAII framework and implementation science methodology.', accessRoles: ['researcher', 'admin'], uploadedAt: '2025-10-01' },
]

// ─── Monthly Fidelity Trend (for charts) ────────────────────────────────────
export const monthlyFidelityTrend = [
  { month: 'Sep', adherence: 3.2, dosage: 3.4, quality: 3.1, responsiveness: 2.9, confidence: 3.3 },
  { month: 'Oct', adherence: 3.5, dosage: 3.6, quality: 3.4, responsiveness: 3.2, confidence: 3.5 },
  { month: 'Nov', adherence: 3.6, dosage: 3.7, quality: 3.5, responsiveness: 3.3, confidence: 3.7 },
  { month: 'Dec', adherence: 3.4, dosage: 3.5, quality: 3.3, responsiveness: 3.1, confidence: 3.5 },
  { month: 'Jan', adherence: 3.7, dosage: 3.8, quality: 3.6, responsiveness: 3.5, confidence: 3.8 },
  { month: 'Feb', adherence: 3.9, dosage: 4.0, quality: 3.8, responsiveness: 3.7, confidence: 4.0 },
  { month: 'Mar', adherence: 4.0, dosage: 4.1, quality: 3.9, responsiveness: 3.8, confidence: 4.1 },
  { month: 'Apr', adherence: 4.1, dosage: 4.2, quality: 4.0, responsiveness: 3.9, confidence: 4.2 },
  { month: 'May', adherence: 4.2, dosage: 4.3, quality: 4.1, responsiveness: 4.0, confidence: 4.3 },
]

export const teacherFidelityTrends: Record<string, typeof monthlyFidelityTrend> = {
  T001: monthlyFidelityTrend.map(m => ({ ...m, adherence: m.adherence - 0.2, dosage: m.dosage - 0.1 })),
  T003: monthlyFidelityTrend.map(m => ({ ...m, adherence: m.adherence + 0.4, dosage: m.dosage + 0.3 })),
  T004: monthlyFidelityTrend.map(m => ({ ...m, adherence: m.adherence - 1.0, dosage: m.dosage - 0.8 })),
}

// ─── Mock Credentials ─────────────────────────────────────────────────────────
export const mockCredentials: MockCredential[] = [
  { email: 'anna.carter@example.org', password: 'demo1234', userId: 'T001' },
  { email: 'brian.lee@example.org', password: 'demo1234', userId: 'T002' },
  { email: 'carla.nguyen@example.org', password: 'demo1234', userId: 'T003' },
  { email: 'david.brooks@example.org', password: 'demo1234', userId: 'T004' },
  { email: 'elena.martinez@example.org', password: 'demo1234', userId: 'T005' },
  { email: 'monica.hill@example.org', password: 'demo1234', userId: 'A001' },
  { email: 'james.patel@example.org', password: 'demo1234', userId: 'A002' },
  { email: 'rachel.stone@example.org', password: 'demo1234', userId: 'C001' },
  { email: 'researcher@example.org', password: 'demo1234', userId: 'R001' },
  { email: 'teacher@demo.com', password: 'demo1234', userId: 'T001' },
  { email: 'coach@demo.com', password: 'demo1234', userId: 'C001' },
  { email: 'admin@demo.com', password: 'demo1234', userId: 'A001' },
  { email: 'researcher@demo.com', password: 'demo1234', userId: 'R001' },
]

// ─── Permissions ──────────────────────────────────────────────────────────────
export const permissions: Permission[] = [
  { id: 'p_view_logs', name: 'View Implementation Logs', description: 'View all teacher implementation logs', category: 'data' },
  { id: 'p_edit_logs', name: 'Edit Implementation Logs', description: 'Create and edit implementation logs', category: 'data' },
  { id: 'p_export_data', name: 'Export Data', description: 'Export reports and raw data files', category: 'data' },
  { id: 'p_view_student_data', name: 'View Student Data', description: 'Access student progress monitoring data', category: 'data' },
  { id: 'p_view_fidelity', name: 'View Fidelity Data', description: 'View fidelity check results across teachers', category: 'data' },
  { id: 'p_view_users', name: 'View Members', description: 'View all organization members', category: 'users' },
  { id: 'p_add_users', name: 'Add Members', description: 'Invite new members to the organization', category: 'users' },
  { id: 'p_edit_users', name: 'Edit Members', description: 'Edit member profiles and school assignments', category: 'users' },
  { id: 'p_remove_users', name: 'Remove Members', description: 'Deactivate or remove members', category: 'users' },
  { id: 'p_assign_roles', name: 'Assign Roles', description: 'Change role assignments for members', category: 'users' },
  { id: 'p_view_coaching', name: 'View Coaching Cycles', description: 'View coaching threads and cycles', category: 'coaching' },
  { id: 'p_create_coaching', name: 'Create Coaching Cycles', description: 'Initiate new coaching cycles with teachers', category: 'coaching' },
  { id: 'p_respond_coaching', name: 'Respond to Coaching', description: 'Reply in coaching threads', category: 'coaching' },
  { id: 'p_view_reports', name: 'View Reports', description: 'View school and district-level reports', category: 'reports' },
  { id: 'p_generate_reports', name: 'Generate Reports', description: 'Create and schedule new reports', category: 'reports' },
  { id: 'p_manage_schools', name: 'Manage Schools', description: 'Add, edit, or remove schools', category: 'organization' },
  { id: 'p_manage_org', name: 'Manage Organization', description: 'Edit organization settings and structure', category: 'organization' },
]

export const rolePermissions: RolePermissions[] = [
  {
    role: 'teacher',
    permissionIds: ['p_edit_logs', 'p_view_fidelity', 'p_view_coaching', 'p_respond_coaching', 'p_view_reports'],
  },
  {
    role: 'coach',
    permissionIds: ['p_view_logs', 'p_view_fidelity', 'p_view_coaching', 'p_create_coaching', 'p_respond_coaching', 'p_view_reports', 'p_view_users'],
  },
  {
    role: 'admin',
    permissionIds: permissions.map(p => p.id),
  },
  {
    role: 'researcher',
    permissionIds: ['p_view_logs', 'p_view_fidelity', 'p_export_data', 'p_view_student_data', 'p_view_reports', 'p_generate_reports'],
  },
]

// ─── Organization Members ─────────────────────────────────────────────────────
export const orgMembers: OrgMember[] = [
  { id: 'T001', name: 'Anna Carter', email: 'anna.carter@example.org', initials: 'AC', role: 'teacher', schoolId: 'SCH01', department: 'Grade 3 · Tier 1/2', status: 'active', joinedAt: '2023-08-15' },
  { id: 'T002', name: 'Brian Lee', email: 'brian.lee@example.org', initials: 'BL', role: 'teacher', schoolId: 'SCH01', department: 'Grade 4 · Tier 1', status: 'active', joinedAt: '2022-08-10' },
  { id: 'T003', name: 'Carla Nguyen', email: 'carla.nguyen@example.org', initials: 'CN', role: 'teacher', schoolId: 'SCH01', department: 'Grade 5 · SPED/Tier 3', status: 'active', joinedAt: '2021-09-01' },
  { id: 'T004', name: 'David Brooks', email: 'david.brooks@example.org', initials: 'DB', role: 'teacher', schoolId: 'SCH02', department: 'Grade 6 · Tier 2', status: 'active', joinedAt: '2024-01-08' },
  { id: 'T005', name: 'Elena Martinez', email: 'elena.martinez@example.org', initials: 'EM', role: 'teacher', schoolId: 'SCH02', department: 'Grade 7 · Tier 1/2', status: 'active', joinedAt: '2023-01-15' },
  { id: 'A001', name: 'Monica Hill', email: 'monica.hill@example.org', initials: 'MH', role: 'admin', schoolId: 'SCH01', department: 'Principal', status: 'active', joinedAt: '2019-07-01' },
  { id: 'A002', name: 'James Patel', email: 'james.patel@example.org', initials: 'JP', role: 'admin', schoolId: 'SCH02', department: 'Assistant Principal', status: 'active', joinedAt: '2021-08-01' },
  { id: 'C001', name: 'Rachel Stone', email: 'rachel.stone@example.org', initials: 'RS', role: 'coach', schoolId: 'SCH01', department: 'Implementation Coach', status: 'active', joinedAt: '2020-08-01' },
  { id: 'R001', name: 'Dr. Jing Researcher', email: 'researcher@example.org', initials: 'JR', role: 'researcher', schoolId: 'SCH01', department: 'Research Team', status: 'active', joinedAt: '2022-03-14' },
]

// ─── Lesson Plans ──────────────────────────────────────────────────────────────
export const lessonPlans: LessonPlan[] = [
  {
    id: 'plan-1', teacherId: 'T001', plannedDate: '2026-05-24', plannedTime: '09:00',
    instructionalRoutine: 'Number Sense Warm-up', ebpComponent: ['CRA'],
    implementationStrategy: 'Think-aloud', tier: 'Tier 1', plannedDurationMinutes: 45,
    goal: 'Focus on concrete phase — use base-10 blocks throughout',
    status: 'upcoming', createdAt: '2026-05-22T10:00:00Z',
  },
  {
    id: 'plan-2', teacherId: 'T001', plannedDate: '2026-05-26', plannedTime: '10:30',
    instructionalRoutine: 'Word Problem Routine', ebpComponent: ['Schema-Based Instruction', 'Worked Examples'],
    implementationStrategy: 'Worked examples', tier: 'Tier 2', plannedDurationMinutes: 30,
    goal: 'Introduce equal groups schema with small group of 3 students',
    status: 'upcoming', createdAt: '2026-05-22T10:05:00Z',
  },
  {
    id: 'plan-3', teacherId: 'T001', plannedDate: '2026-05-28', plannedTime: '08:45',
    instructionalRoutine: 'Math Fluency Practice', ebpComponent: ['Explicit Instruction', 'Distributed Practice'],
    implementationStrategy: 'Peer tutoring', tier: 'Tier 1', plannedDurationMinutes: 20,
    goal: 'Practice multiplication facts 6–9 with partner drill',
    status: 'upcoming', createdAt: '2026-05-22T10:10:00Z',
  },
  {
    id: 'plan-4', teacherId: 'T001', plannedDate: '2026-05-20', plannedTime: '09:00',
    instructionalRoutine: 'Number Sense Warm-up', ebpComponent: ['CRA'],
    implementationStrategy: 'Think-aloud', tier: 'Tier 1', plannedDurationMinutes: 45,
    goal: 'Transition from concrete to representational phase',
    status: 'logged', logId: 'log-T001-8', createdAt: '2026-05-19T09:00:00Z',
  },
  {
    id: 'plan-5', teacherId: 'T001', plannedDate: '2026-05-21', plannedTime: '11:00',
    instructionalRoutine: 'Error Analysis', ebpComponent: ['Metacognitive Strategies'],
    implementationStrategy: 'Think-aloud', tier: 'Tier 2', plannedDurationMinutes: 30,
    goal: 'Help students identify common subtraction errors',
    status: 'missed', createdAt: '2026-05-20T08:00:00Z',
  },
]
