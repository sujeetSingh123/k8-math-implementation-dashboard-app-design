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
  Incentive,
  BudgetAllocation,
  Conversation,
  LogComment,
  InstructionalSetting,
} from '../types'

// ─── EBP Hierarchy (Level 1 = EBP name, Level 2 = components) ───────────────
export const ebpHierarchy = [
  {
    id: 'systematic-instruction',
    name: 'Systematic Instruction',
    components: [
      'Review and integrate previously learned content throughout intervention',
      'Use accessible numbers when introducing new concepts and procedures',
      'Sequence instruction so mathematics builds incrementally',
      'Provide visual and verbal supports',
      'Provide immediate, supportive feedback to address misunderstandings',
    ],
  },
  {
    id: 'mathematical-language',
    name: 'Mathematical Language',
    components: [
      'Routinely teach mathematical vocabulary',
      'Use clear, concise, and correct mathematical language throughout lessons',
      'Support students in using mathematically precise language in explanations',
    ],
  },
  {
    id: 'representations',
    name: 'Representations',
    components: [
      'Provide concrete and semi-concrete representations for the concept or procedure',
      'Connect concrete and semi-concrete representations to abstract representations',
      'Provide ample opportunities for students to use representations as thinking tools',
      'Revisit concrete and semi-concrete representations to reinforce understanding',
    ],
  },
  {
    id: 'number-lines',
    name: 'Number Lines',
    components: [
      'Represent whole numbers, fractions, and decimals on a number line',
      'Compare numbers and determine relative magnitude using a number line',
      'Use the number line to build understanding of operations',
    ],
  },
  {
    id: 'word-problems',
    name: 'Word Problems',
    components: [
      'Teach students to identify word problem types by action or event',
      'Teach a solution method for each problem type',
      'Expand ability to identify relevant information in word problems',
      'Teach vocabulary and language often used in word problems',
      'Include a mix of previously and newly learned problem types',
    ],
  },
  {
    id: 'timed-activities',
    name: 'Timed Activities',
    components: [
      'Identify already-learned topics for timed activities and create a timeline',
      'Choose the activity and materials and set clear expectations',
      'Ensure students have an efficient strategy for the timed activity',
      'Encourage and motivate students by having them chart their progress',
      'Provide immediate feedback by asking students to correct errors',
    ],
  },
] as const

export type EBPCategory = typeof ebpHierarchy[number]

// ─── Districts ─────────────────────────────────────────────────────────────────
export const districts = [
  { id: 'dist1', name: 'Riverside Unified School District' },
  { id: 'dist2', name: 'Lakeside School District' },
]

// ─── Schools ─────────────────────────────────────────────────────────────────
export const schools: School[] = [
  { id: 'SCH01', name: 'Lincoln K-8 School', districtId: 'dist1' },
  { id: 'SCH02', name: 'Washington Middle School', districtId: 'dist1' },
  { id: 'SCH03', name: 'Roosevelt Elementary', districtId: 'dist2' },
  { id: 'SCH04', name: 'Jefferson K-8 School', districtId: 'dist2' },
]

// ─── Users ────────────────────────────────────────────────────────────────────
export const users: User[] = [
  { id: 'T001', name: 'Anna Carter', initials: 'AC', role: 'teacher', schoolId: 'SCH01', coachId: 'C001' },
  { id: 'T002', name: 'Brian Lee', initials: 'BL', role: 'teacher', schoolId: 'SCH01', coachId: 'C001' },
  { id: 'T003', name: 'Carla Nguyen', initials: 'CN', role: 'teacher', schoolId: 'SCH01', coachId: 'C001' },
  { id: 'T004', name: 'David Brooks', initials: 'DB', role: 'teacher', schoolId: 'SCH02', coachId: 'C001' },
  { id: 'T005', name: 'Elena Martinez', initials: 'EM', role: 'teacher', schoolId: 'SCH02', coachId: 'C001' },
  { id: 'P001', name: 'Sarah Kim', initials: 'SK', role: 'paraprofessional', schoolId: 'SCH01', coachId: 'C001' },
  { id: 'P002', name: 'Marcus Webb', initials: 'MW', role: 'paraprofessional', schoolId: 'SCH02', coachId: 'C001' },
  { id: 'A001', name: 'Monica Hill', initials: 'MH', role: 'admin', schoolId: 'SCH01' },
  { id: 'A002', name: 'James Patel', initials: 'JP', role: 'admin', schoolId: 'SCH02' },
  { id: 'C001', name: 'Rachel Stone', initials: 'RS', role: 'coach', schoolId: 'SCH01' },
  { id: 'R001', name: 'Dr. Jing Researcher', initials: 'JR', role: 'researcher', schoolId: 'SCH01' },
  { id: 'SA001', name: 'Alex Super', initials: 'AS', role: 'super_admin', schoolId: 'DISTRICT' },
  { id: 'DA001', name: 'Margaret Rivera', initials: 'MR', role: 'district_admin', schoolId: 'DISTRICT', districtId: 'dist1' },
  { id: 'DA002', name: 'Charles Lee', initials: 'CL', role: 'district_admin', schoolId: 'DISTRICT', districtId: 'dist2' },
  // Testing accounts — clean-slate users for QA
  { id: 'TEST_T', name: 'Testing – Teacher', initials: 'TT', role: 'teacher', schoolId: 'SCH01', coachId: 'C001' },
  { id: 'TEST_P', name: 'Testing – Para', initials: 'TP', role: 'paraprofessional', schoolId: 'SCH01', coachId: 'C001' },
  { id: 'TEST_C', name: 'Testing – Coach', initials: 'TC', role: 'coach', schoolId: 'SCH01' },
  { id: 'TEST_A', name: 'Testing – School Admin', initials: 'TA', role: 'admin', schoolId: 'SCH01' },
  { id: 'TEST_SA', name: 'Testing – Platform Admin', initials: 'PA', role: 'super_admin', schoolId: 'DISTRICT' },
  { id: 'TEST_DA1', name: 'Testing – District 1 Admin', initials: 'D1', role: 'district_admin', schoolId: 'DISTRICT', districtId: 'dist1' },
  { id: 'TEST_DA2', name: 'Testing – District 2 Admin', initials: 'D2', role: 'district_admin', schoolId: 'DISTRICT', districtId: 'dist2' },
  { id: 'TEST_R', name: 'Testing – Researcher', initials: 'TR', role: 'researcher', schoolId: 'SCH01' },
]

export const usersByRole: Record<string, User> = {
  teacher: users[0],
  admin: users[5],
  coach: users[7],
  researcher: users[8],
  super_admin: users[9],
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
export const implementationTiers: ImplementationLog['tier'][] = ['Tier 1', 'Tier 2', 'Tier 3', 'Special Education']

export const plannedAdaptationTypes = [
  'Time/dosage', 'Examples/problems', 'Grouping structure',
  'Instructional materials', 'Pacing', 'Language supports',
  'Behavioral supports', 'Other',
]

export const unplannedAdaptCauseHierarchy = [
  {
    id: 'student-learning', label: 'Student Learning Needs',
    reasons: ['Students needed more support', 'Prerequisite skills', 'Accommodations', 'Language support', 'Additional practice'],
  },
  {
    id: 'engagement', label: 'Keeping Students Engaged',
    reasons: ['Students were losing focus', 'Motivation was low', 'The activity needed to be more interactive'],
  },
  {
    id: 'instructional', label: 'Instructional Adjustments',
    reasons: ['Needed to slow down', 'Speed up', 'Reteach', 'Provide extra examples', 'Differentiate instruction'],
  },
  {
    id: 'time', label: 'Time and Scheduling Constraints',
    reasons: ['Limited instructional time', 'Interruptions', 'Testing schedules', 'Assemblies', 'Competing priorities'],
  },
  {
    id: 'resources', label: 'Available Resources and Supports',
    reasons: ['Materials unavailable or changed', 'Technology unavailable or changed', 'Staffing changes', 'Substitute teacher', 'Coaching support unavailable', 'Classroom resources unavailable'],
  },
  {
    id: 'classroom-fit', label: 'Making It Fit My Classroom and Students',
    reasons: ['Adjusting examples or activities', 'Language adjustments', 'Connections to student context', 'Local context fit', 'Curriculum alignment'],
  },
] as const
export const instructionalSettings: InstructionalSetting[] = ['General Education', 'Pull-out Group', 'Push-in Support', 'Resource Room', 'Co-taught Classroom']

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
  // T001 (Anna) — Lincoln K-8, Grade 4
  { id: 'sdr-1',  teacherId: 'T001', schoolId: 'SCH01', date: daysAgo(77), week: 1,  grade: '4', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Concepts & Applications', studentsCount: 22, baselineAvg: 64, currentAvg: 64, growth: 0,   medianPct: 62, atOrAboveBenchmark: 55, belowBenchmark: 45, goalPct: 80, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T001-Tier1-W01', logId: 'log-T001-8' },
  { id: 'sdr-2',  teacherId: 'T001', schoolId: 'SCH01', date: daysAgo(63), week: 3,  grade: '4', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Concepts & Applications', studentsCount: 22, baselineAvg: 64, currentAvg: 69, growth: 5,   medianPct: 67, atOrAboveBenchmark: 64, belowBenchmark: 36, goalPct: 80, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T001-Tier1-W03', logId: 'log-T001-7' },
  { id: 'sdr-3',  teacherId: 'T001', schoolId: 'SCH01', date: daysAgo(49), week: 5,  grade: '4', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Concepts & Applications', studentsCount: 22, baselineAvg: 64, currentAvg: 74, growth: 10,  medianPct: 72, atOrAboveBenchmark: 73, belowBenchmark: 27, goalPct: 80, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T001-Tier1-W05', logId: 'log-T001-6' },
  { id: 'sdr-4',  teacherId: 'T001', schoolId: 'SCH01', date: daysAgo(35), week: 7,  grade: '4', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'Unit Assessment',                  studentsCount: 22, baselineAvg: 64, currentAvg: 79, growth: 15,  medianPct: 77, atOrAboveBenchmark: 77, belowBenchmark: 23, goalPct: 80, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T001-Tier1-W07', logId: 'log-T001-5' },
  { id: 'sdr-5',  teacherId: 'T001', schoolId: 'SCH01', date: daysAgo(21), week: 9,  grade: '4', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'Unit Assessment',                  studentsCount: 22, baselineAvg: 64, currentAvg: 83, growth: 19,  medianPct: 81, atOrAboveBenchmark: 82, belowBenchmark: 18, goalPct: 80, metGoal: true,  dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T001-Tier1-W09', logId: 'log-T001-4' },
  { id: 'sdr-6',  teacherId: 'T001', schoolId: 'SCH01', date: daysAgo(7),  week: 11, grade: '4', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Concepts & Applications', studentsCount: 22, baselineAvg: 64, currentAvg: 86, growth: 22,  medianPct: 84, atOrAboveBenchmark: 86, belowBenchmark: 14, goalPct: 80, metGoal: true,  dataSource: 'Teacher upload', uploadStatus: 'Submitted', researchExportId: 'EXP-SCH01-T001-Tier1-W11', logId: 'log-T001-1' },
  // T001 Tier 2 group
  { id: 'sdr-7',  teacherId: 'T001', schoolId: 'SCH01', date: daysAgo(49), week: 5,  grade: '4', mtssTier: 'Tier 2', instructionalSetting: 'Pull-out Group',     measureType: 'Goal-Specific Progress Monitoring', studentsCount: 6,  baselineAvg: 48, currentAvg: 56, growth: 8,   medianPct: 54, atOrAboveBenchmark: 50, belowBenchmark: 50, interventionGroupAvg: 56, comparisonGroupAvg: 74, goalPct: 70, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T001-Tier2-W05', logId: 'log-T001-3' },
  { id: 'sdr-8',  teacherId: 'T001', schoolId: 'SCH01', date: daysAgo(14), week: 10, grade: '4', mtssTier: 'Tier 2', instructionalSetting: 'Pull-out Group',     measureType: 'Goal-Specific Progress Monitoring', studentsCount: 6,  baselineAvg: 48, currentAvg: 63, growth: 15,  medianPct: 61, atOrAboveBenchmark: 67, belowBenchmark: 33, interventionGroupAvg: 63, comparisonGroupAvg: 81, goalPct: 70, metGoal: true,  dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T001-Tier2-W10', logId: 'log-T001-2' },

  // T002 (Brian) — Lincoln K-8, Grade 5
  { id: 'sdr-9',  teacherId: 'T002', schoolId: 'SCH01', date: daysAgo(77), week: 1,  grade: '5', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Computation',             studentsCount: 19, baselineAvg: 58, currentAvg: 58, growth: 0,   medianPct: 55, atOrAboveBenchmark: 47, belowBenchmark: 53, goalPct: 75, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T002-Tier1-W01', logId: 'log-T002-7' },
  { id: 'sdr-10', teacherId: 'T002', schoolId: 'SCH01', date: daysAgo(56), week: 4,  grade: '5', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Computation',             studentsCount: 19, baselineAvg: 58, currentAvg: 62, growth: 4,   medianPct: 60, atOrAboveBenchmark: 53, belowBenchmark: 47, goalPct: 75, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T002-Tier1-W04', logId: 'log-T002-5' },
  { id: 'sdr-11', teacherId: 'T002', schoolId: 'SCH01', date: daysAgo(35), week: 7,  grade: '5', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'Unit Assessment',                  studentsCount: 19, baselineAvg: 58, currentAvg: 65, growth: 7,   medianPct: 63, atOrAboveBenchmark: 58, belowBenchmark: 42, goalPct: 75, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Needs review', researchExportId: 'EXP-SCH01-T002-Tier1-W07', logId: 'log-T002-3' },
  { id: 'sdr-12', teacherId: 'T002', schoolId: 'SCH01', date: daysAgo(14), week: 10, grade: '5', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Computation',             studentsCount: 19, baselineAvg: 58, currentAvg: 68, growth: 10,  medianPct: 66, atOrAboveBenchmark: 63, belowBenchmark: 37, goalPct: 75, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Submitted',    researchExportId: 'EXP-SCH01-T002-Tier1-W10', logId: 'log-T002-1' },
  // T002 Tier 3
  { id: 'sdr-13', teacherId: 'T002', schoolId: 'SCH01', date: daysAgo(42), week: 6,  grade: '5', mtssTier: 'Tier 3', instructionalSetting: 'Pull-out Group',     measureType: 'Intensive Intervention Probe',     studentsCount: 3,  baselineAvg: 32, currentAvg: 39, growth: 7,   medianPct: 37, atOrAboveBenchmark: 33, belowBenchmark: 67, interventionGroupAvg: 39, goalPct: 60, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T002-Tier3-W06' },

  // T003 (Carla) — Lincoln K-8, Grade 3
  { id: 'sdr-14', teacherId: 'T003', schoolId: 'SCH01', date: daysAgo(77), week: 1,  grade: '3', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Concepts & Applications', studentsCount: 21, baselineAvg: 72, currentAvg: 72, growth: 0,   medianPct: 70, atOrAboveBenchmark: 71, belowBenchmark: 29, goalPct: 85, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T003-Tier1-W01', logId: 'log-T003-6' },
  { id: 'sdr-15', teacherId: 'T003', schoolId: 'SCH01', date: daysAgo(49), week: 5,  grade: '3', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Concepts & Applications', studentsCount: 21, baselineAvg: 72, currentAvg: 81, growth: 9,   medianPct: 79, atOrAboveBenchmark: 81, belowBenchmark: 19, goalPct: 85, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T003-Tier1-W05', logId: 'log-T003-4' },
  { id: 'sdr-16', teacherId: 'T003', schoolId: 'SCH01', date: daysAgo(21), week: 9,  grade: '3', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'Unit Assessment',                  studentsCount: 21, baselineAvg: 72, currentAvg: 89, growth: 17,  medianPct: 87, atOrAboveBenchmark: 90, belowBenchmark: 10, goalPct: 85, metGoal: true,  dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T003-Tier1-W09', logId: 'log-T003-2' },
  // T003 Tier 2
  { id: 'sdr-17', teacherId: 'T003', schoolId: 'SCH01', date: daysAgo(35), week: 7,  grade: '3', mtssTier: 'Tier 2', instructionalSetting: 'Pull-out Group',     measureType: 'Goal-Specific Progress Monitoring', studentsCount: 4,  baselineAvg: 52, currentAvg: 67, growth: 15,  medianPct: 65, atOrAboveBenchmark: 75, belowBenchmark: 25, interventionGroupAvg: 67, comparisonGroupAvg: 89, goalPct: 72, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH01-T003-Tier2-W07' },

  // T004 (David) — Washington Middle, Grade 6
  { id: 'sdr-18', teacherId: 'T004', schoolId: 'SCH02', date: daysAgo(77), week: 1,  grade: '6', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Computation',             studentsCount: 24, baselineAvg: 51, currentAvg: 51, growth: 0,   medianPct: 49, atOrAboveBenchmark: 42, belowBenchmark: 58, goalPct: 70, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH02-T004-Tier1-W01', logId: 'log-T004-7' },
  { id: 'sdr-19', teacherId: 'T004', schoolId: 'SCH02', date: daysAgo(49), week: 5,  grade: '6', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Computation',             studentsCount: 24, baselineAvg: 51, currentAvg: 55, growth: 4,   medianPct: 53, atOrAboveBenchmark: 46, belowBenchmark: 54, goalPct: 70, metGoal: false, dataSource: 'Research team entry', uploadStatus: 'Needs review', researchExportId: 'EXP-SCH02-T004-Tier1-W05', logId: 'log-T004-5' },
  { id: 'sdr-20', teacherId: 'T004', schoolId: 'SCH02', date: daysAgo(21), week: 9,  grade: '6', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'Unit Assessment',                  studentsCount: 24, baselineAvg: 51, currentAvg: 59, growth: 8,   medianPct: 57, atOrAboveBenchmark: 50, belowBenchmark: 50, goalPct: 70, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Submitted',    researchExportId: 'EXP-SCH02-T004-Tier1-W09', logId: 'log-T004-2' },
  // T004 Special Education
  { id: 'sdr-21', teacherId: 'T004', schoolId: 'SCH02', date: daysAgo(42), week: 6,  grade: '6', mtssTier: 'Special Education', instructionalSetting: 'Resource Room', measureType: 'IEP Math Goal Probe', studentsCount: 4,  baselineAvg: 28, currentAvg: 36, growth: 8,   medianPct: 34, atOrAboveBenchmark: 25, belowBenchmark: 75, interventionGroupAvg: 36, goalPct: 55, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH02-T004-SpEd-W06' },

  // T005 (Elena) — Washington Middle, Grade 7
  { id: 'sdr-22', teacherId: 'T005', schoolId: 'SCH02', date: daysAgo(77), week: 1,  grade: '7', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Concepts & Applications', studentsCount: 20, baselineAvg: 67, currentAvg: 67, growth: 0,   medianPct: 65, atOrAboveBenchmark: 60, belowBenchmark: 40, goalPct: 80, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH02-T005-Tier1-W01', logId: 'log-T005-6' },
  { id: 'sdr-23', teacherId: 'T005', schoolId: 'SCH02', date: daysAgo(49), week: 5,  grade: '7', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'CBM-Math Concepts & Applications', studentsCount: 20, baselineAvg: 67, currentAvg: 74, growth: 7,   medianPct: 72, atOrAboveBenchmark: 70, belowBenchmark: 30, goalPct: 80, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH02-T005-Tier1-W05' },
  { id: 'sdr-24', teacherId: 'T005', schoolId: 'SCH02', date: daysAgo(21), week: 9,  grade: '7', mtssTier: 'Tier 1', instructionalSetting: 'General Education',  measureType: 'Unit Assessment',                  studentsCount: 20, baselineAvg: 67, currentAvg: 79, growth: 12,  medianPct: 77, atOrAboveBenchmark: 75, belowBenchmark: 25, goalPct: 80, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Submitted',    researchExportId: 'EXP-SCH02-T005-Tier1-W09', logId: 'log-T005-2' },
  // T005 Tier 2
  { id: 'sdr-25', teacherId: 'T005', schoolId: 'SCH02', date: daysAgo(35), week: 7,  grade: '7', mtssTier: 'Tier 2', instructionalSetting: 'Pull-out Group',     measureType: 'Intervention Skill Probe',         studentsCount: 5,  baselineAvg: 44, currentAvg: 54, growth: 10,  medianPct: 52, atOrAboveBenchmark: 60, belowBenchmark: 40, interventionGroupAvg: 54, comparisonGroupAvg: 74, goalPct: 68, metGoal: false, dataSource: 'Teacher upload', uploadStatus: 'Verified', researchExportId: 'EXP-SCH02-T005-Tier2-W07' },
]

// ─── PD Sessions ──────────────────────────────────────────────────────────────
export const pdSessions: PDSession[] = [
  { id: 'pd-1', title: 'Math MTSS Year-End Review', type: 'training', scheduledDate: daysAgo(-14), startTime: '09:00', durationHours: 3, targetAudience: ['teacher', 'paraprofessional', 'coach'], facilitator: 'Rachel Stone', location: 'District Office — Room 101', status: 'upcoming', checkIns: [], description: 'End-of-year review of MTSS implementation fidelity across all tiers. Teams will analyze district-wide data, identify trends, and set goals for the following school year.' },
  { id: 'pd-2', title: 'CRA Lab: Representational Phase', type: 'lab', scheduledDate: daysAgo(-7), startTime: '13:30', durationHours: 2.5, targetAudience: ['teacher', 'paraprofessional'], facilitator: 'Rachel Stone', location: 'Lincoln K-8 School — Lab A', status: 'upcoming', checkIns: [], description: 'Hands-on lab exploring the pictorial/representational stage of the CRA sequence. Students will practice drawing models and diagrams to bridge concrete manipulatives and abstract symbols.' },
  { id: 'pd-3', title: 'Coaching Conversation Frameworks', type: 'coaching', scheduledDate: daysAgo(-3), startTime: '14:00', durationHours: 2, targetAudience: ['coach'], facilitator: 'Monica Hill', location: 'Virtual (Zoom)', status: 'upcoming', checkIns: [], description: 'Coaching session focused on structured conversation frameworks for observational feedback, goal-setting dialogues, and action planning with teachers.' },
  { id: 'pd-4', title: 'Data-Driven Decision Making Q3', type: 'training', scheduledDate: daysAgo(15), startTime: '08:30', durationHours: 2, targetAudience: ['teacher', 'paraprofessional', 'coach'], facilitator: 'Rachel Stone', location: 'Washington Middle School — Cafeteria', status: 'completed', checkIns: [{ userId: 'T001', checkedInAt: daysAgo(15) + 'T08:35:00', approved: true }, { userId: 'T002', checkedInAt: daysAgo(15) + 'T08:42:00', approved: true }, { userId: 'T003', checkedInAt: daysAgo(15) + 'T08:31:00' }, { userId: 'C001', checkedInAt: daysAgo(15) + 'T08:30:00', approved: true }], description: 'Training on interpreting Q3 progress monitoring data to make Tier placement decisions. Covered data decision trees, cut scores, and documentation requirements for Tier 2 and Tier 3 adjustments.' },
  { id: 'pd-5', title: 'Fidelity Self-Assessment Practices', type: 'coaching', scheduledDate: daysAgo(30), startTime: '10:00', durationHours: 1.5, targetAudience: ['teacher', 'coach'], facilitator: 'Rachel Stone', location: 'Lincoln K-8 School — Library', status: 'completed', checkIns: [{ userId: 'T001', checkedInAt: daysAgo(30) + 'T10:03:00', approved: true }, { userId: 'C001', checkedInAt: daysAgo(30) + 'T10:01:00', approved: true }], description: 'Coaching session on using the five-dimension fidelity rubric for self-reflection and goal-setting. Students calibrated ratings against video examples and identified one growth area for the next cycle.' },
  { id: 'pd-6', title: 'Adaptation Documentation (FRAME-IS)', type: 'training', scheduledDate: daysAgo(45), startTime: '09:00', durationHours: 2, targetAudience: ['teacher', 'paraprofessional', 'coach', 'admin'], facilitator: 'Monica Hill', location: 'District Office — Room 204', status: 'completed', checkIns: [{ userId: 'T001', checkedInAt: daysAgo(45) + 'T09:05:00', approved: true }, { userId: 'T002', checkedInAt: daysAgo(45) + 'T09:11:00', approved: true }, { userId: 'T003', checkedInAt: daysAgo(45) + 'T09:02:00', approved: true }, { userId: 'C001', checkedInAt: daysAgo(45) + 'T09:00:00', approved: true }, { userId: 'A001', checkedInAt: daysAgo(45) + 'T09:04:00', approved: true }], description: 'Training on the FRAME-IS framework for classifying, documenting, and analyzing instructional adaptations. Covered the six modification categories, fidelity implications, and how to log adaptations in the system.' },
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

// Fidelity trends for district 2 schools (Lakeside SD)
export const dist2SchoolFidelityTrends: Record<string, typeof monthlyFidelityTrend> = {
  SCH03: [
    { month: 'Sep', adherence: 3.0, dosage: 3.2, quality: 2.9, responsiveness: 2.7, confidence: 3.1 },
    { month: 'Oct', adherence: 3.2, dosage: 3.4, quality: 3.1, responsiveness: 2.9, confidence: 3.3 },
    { month: 'Nov', adherence: 3.4, dosage: 3.5, quality: 3.3, responsiveness: 3.1, confidence: 3.5 },
    { month: 'Dec', adherence: 3.2, dosage: 3.3, quality: 3.1, responsiveness: 2.9, confidence: 3.3 },
    { month: 'Jan', adherence: 3.5, dosage: 3.7, quality: 3.4, responsiveness: 3.2, confidence: 3.6 },
    { month: 'Feb', adherence: 3.7, dosage: 3.8, quality: 3.6, responsiveness: 3.4, confidence: 3.8 },
    { month: 'Mar', adherence: 3.8, dosage: 3.9, quality: 3.7, responsiveness: 3.5, confidence: 3.9 },
    { month: 'Apr', adherence: 3.9, dosage: 4.0, quality: 3.8, responsiveness: 3.7, confidence: 4.0 },
    { month: 'May', adherence: 4.0, dosage: 4.1, quality: 3.9, responsiveness: 3.8, confidence: 4.1 },
  ],
  SCH04: [
    { month: 'Sep', adherence: 2.6, dosage: 2.8, quality: 2.5, responsiveness: 2.3, confidence: 2.7 },
    { month: 'Oct', adherence: 2.9, dosage: 3.0, quality: 2.8, responsiveness: 2.6, confidence: 2.9 },
    { month: 'Nov', adherence: 3.0, dosage: 3.1, quality: 2.9, responsiveness: 2.7, confidence: 3.1 },
    { month: 'Dec', adherence: 2.8, dosage: 2.9, quality: 2.7, responsiveness: 2.5, confidence: 2.9 },
    { month: 'Jan', adherence: 3.1, dosage: 3.2, quality: 3.0, responsiveness: 2.9, confidence: 3.2 },
    { month: 'Feb', adherence: 3.3, dosage: 3.4, quality: 3.2, responsiveness: 3.1, confidence: 3.4 },
    { month: 'Mar', adherence: 3.4, dosage: 3.5, quality: 3.3, responsiveness: 3.2, confidence: 3.5 },
    { month: 'Apr', adherence: 3.5, dosage: 3.6, quality: 3.4, responsiveness: 3.3, confidence: 3.6 },
    { month: 'May', adherence: 3.6, dosage: 3.7, quality: 3.5, responsiveness: 3.4, confidence: 3.7 },
  ],
}

// District-level aggregated fidelity trends (composite of all schools in each district)
export const districtFidelityTrends: Record<string, typeof monthlyFidelityTrend> = {
  dist1: monthlyFidelityTrend,
  dist2: [
    { month: 'Sep', adherence: 2.8, dosage: 3.0, quality: 2.7, responsiveness: 2.5, confidence: 2.9 },
    { month: 'Oct', adherence: 3.1, dosage: 3.2, quality: 3.0, responsiveness: 2.8, confidence: 3.1 },
    { month: 'Nov', adherence: 3.2, dosage: 3.3, quality: 3.1, responsiveness: 2.9, confidence: 3.3 },
    { month: 'Dec', adherence: 3.0, dosage: 3.1, quality: 2.9, responsiveness: 2.7, confidence: 3.1 },
    { month: 'Jan', adherence: 3.3, dosage: 3.5, quality: 3.2, responsiveness: 3.1, confidence: 3.4 },
    { month: 'Feb', adherence: 3.5, dosage: 3.6, quality: 3.4, responsiveness: 3.3, confidence: 3.6 },
    { month: 'Mar', adherence: 3.6, dosage: 3.7, quality: 3.5, responsiveness: 3.4, confidence: 3.7 },
    { month: 'Apr', adherence: 3.7, dosage: 3.8, quality: 3.6, responsiveness: 3.5, confidence: 3.8 },
    { month: 'May', adherence: 3.8, dosage: 3.9, quality: 3.7, responsiveness: 3.6, confidence: 3.9 },
  ],
}

export const schoolFidelityTrends: Record<string, typeof monthlyFidelityTrend> = {
  SCH01: [
    { month: 'Sep', adherence: 3.5, dosage: 3.7, quality: 3.4, responsiveness: 3.2, confidence: 3.6 },
    { month: 'Oct', adherence: 3.8, dosage: 3.9, quality: 3.7, responsiveness: 3.5, confidence: 3.8 },
    { month: 'Nov', adherence: 3.9, dosage: 4.0, quality: 3.8, responsiveness: 3.6, confidence: 4.0 },
    { month: 'Dec', adherence: 3.7, dosage: 3.8, quality: 3.6, responsiveness: 3.4, confidence: 3.8 },
    { month: 'Jan', adherence: 4.0, dosage: 4.1, quality: 3.9, responsiveness: 3.8, confidence: 4.1 },
    { month: 'Feb', adherence: 4.2, dosage: 4.3, quality: 4.1, responsiveness: 4.0, confidence: 4.3 },
    { month: 'Mar', adherence: 4.3, dosage: 4.4, quality: 4.2, responsiveness: 4.1, confidence: 4.4 },
    { month: 'Apr', adherence: 4.4, dosage: 4.5, quality: 4.3, responsiveness: 4.2, confidence: 4.5 },
    { month: 'May', adherence: 4.5, dosage: 4.6, quality: 4.4, responsiveness: 4.3, confidence: 4.6 },
  ],
  SCH02: [
    { month: 'Sep', adherence: 2.8, dosage: 3.0, quality: 2.7, responsiveness: 2.5, confidence: 2.9 },
    { month: 'Oct', adherence: 3.1, dosage: 3.2, quality: 3.0, responsiveness: 2.8, confidence: 3.1 },
    { month: 'Nov', adherence: 3.2, dosage: 3.3, quality: 3.1, responsiveness: 2.9, confidence: 3.3 },
    { month: 'Dec', adherence: 3.0, dosage: 3.1, quality: 2.9, responsiveness: 2.7, confidence: 3.1 },
    { month: 'Jan', adherence: 3.3, dosage: 3.4, quality: 3.2, responsiveness: 3.1, confidence: 3.4 },
    { month: 'Feb', adherence: 3.5, dosage: 3.6, quality: 3.4, responsiveness: 3.3, confidence: 3.6 },
    { month: 'Mar', adherence: 3.6, dosage: 3.7, quality: 3.5, responsiveness: 3.4, confidence: 3.7 },
    { month: 'Apr', adherence: 3.7, dosage: 3.8, quality: 3.6, responsiveness: 3.5, confidence: 3.8 },
    { month: 'May', adherence: 3.8, dosage: 3.9, quality: 3.7, responsiveness: 3.6, confidence: 3.9 },
  ],
}

// ─── Mock Credentials ─────────────────────────────────────────────────────────
export const mockCredentials: MockCredential[] = [
  { email: 'anna.carter@example.org', password: 'demo1234', userId: 'T001' },
  { email: 'brian.lee@example.org', password: 'demo1234', userId: 'T002' },
  { email: 'carla.nguyen@example.org', password: 'demo1234', userId: 'T003' },
  { email: 'david.brooks@example.org', password: 'demo1234', userId: 'T004' },
  { email: 'elena.martinez@example.org', password: 'demo1234', userId: 'T005' },
  { email: 'sarah.kim@example.org', password: 'demo1234', userId: 'P001' },
  { email: 'marcus.webb@example.org', password: 'demo1234', userId: 'P002' },
  { email: 'monica.hill@example.org', password: 'demo1234', userId: 'A001' },
  { email: 'james.patel@example.org', password: 'demo1234', userId: 'A002' },
  { email: 'rachel.stone@example.org', password: 'demo1234', userId: 'C001' },
  { email: 'researcher@example.org', password: 'demo1234', userId: 'R001' },
  { email: 'teacher@demo.com', password: 'demo1234', userId: 'T001' },
  { email: 'coach@demo.com', password: 'demo1234', userId: 'C001' },
  { email: 'admin@demo.com', password: 'demo1234', userId: 'A001' },
  { email: 'researcher@demo.com', password: 'demo1234', userId: 'R001' },
  { email: 'superadmin@example.org', password: 'demo1234', userId: 'SA001' },
  { email: 'superadmin@demo.com', password: 'demo1234', userId: 'SA001' },
  { email: 'margaret.rivera@dist1.edu', password: 'demo1234', userId: 'DA001' },
  { email: 'charles.lee@dist2.edu', password: 'demo1234', userId: 'DA002' },
  // Testing accounts
  { email: 'test.teacher@demo.com', password: 'demo1234', userId: 'TEST_T' },
  { email: 'test.para@demo.com', password: 'demo1234', userId: 'TEST_P' },
  { email: 'test.coach@demo.com', password: 'demo1234', userId: 'TEST_C' },
  { email: 'test.admin@demo.com', password: 'demo1234', userId: 'TEST_A' },
  { email: 'test.district@demo.com', password: 'demo1234', userId: 'TEST_SA' },
  { email: 'test.dist1@demo.com', password: 'demo1234', userId: 'TEST_DA1' },
  { email: 'test.dist2@demo.com', password: 'demo1234', userId: 'TEST_DA2' },
  { email: 'test.researcher@demo.com', password: 'demo1234', userId: 'TEST_R' },
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
    role: 'paraprofessional',
    permissionIds: ['p_edit_logs', 'p_view_fidelity', 'p_view_coaching', 'p_respond_coaching', 'p_view_reports'],
  },
  {
    role: 'coach',
    permissionIds: ['p_view_logs', 'p_view_fidelity', 'p_view_coaching', 'p_create_coaching', 'p_respond_coaching', 'p_view_reports', 'p_view_users', 'p_view_student_data'],
  },
  {
    role: 'admin',
    permissionIds: permissions.map(p => p.id),
  },
  {
    role: 'district_admin',
    permissionIds: permissions.map(p => p.id),
  },
  {
    role: 'researcher',
    permissionIds: ['p_view_logs', 'p_view_fidelity', 'p_export_data', 'p_view_student_data', 'p_view_reports', 'p_generate_reports', 'p_manage_org'],
  },
  {
    role: 'super_admin',
    permissionIds: permissions.map(p => p.id),
  },
]

// ─── Organization Members ─────────────────────────────────────────────────────
export const orgMembers: OrgMember[] = [
  { id: 'T001', name: 'Anna Carter', email: 'anna.carter@example.org', initials: 'AC', role: 'teacher', schoolId: 'SCH01', department: 'Grade 3 · Tier 1/2', status: 'active', joinedAt: '2023-08-15' },
  { id: 'T002', name: 'Brian Lee', email: 'brian.lee@example.org', initials: 'BL', role: 'teacher', schoolId: 'SCH01', department: 'Grade 4 · Tier 1', status: 'active', joinedAt: '2022-08-10' },
  { id: 'T003', name: 'Carla Nguyen', email: 'carla.nguyen@example.org', initials: 'CN', role: 'teacher', schoolId: 'SCH01', department: 'Grade 5 · Special Education/Tier 3', status: 'active', joinedAt: '2021-09-01' },
  { id: 'T004', name: 'David Brooks', email: 'david.brooks@example.org', initials: 'DB', role: 'teacher', schoolId: 'SCH02', department: 'Grade 6 · Tier 2', status: 'active', joinedAt: '2024-01-08' },
  { id: 'T005', name: 'Elena Martinez', email: 'elena.martinez@example.org', initials: 'EM', role: 'teacher', schoolId: 'SCH02', department: 'Grade 7 · Tier 1/2', status: 'active', joinedAt: '2023-01-15' },
  { id: 'A001', name: 'Monica Hill', email: 'monica.hill@example.org', initials: 'MH', role: 'admin', schoolId: 'SCH01', department: 'Principal', status: 'active', joinedAt: '2019-07-01' },
  { id: 'A002', name: 'James Patel', email: 'james.patel@example.org', initials: 'JP', role: 'admin', schoolId: 'SCH02', department: 'Assistant Principal', status: 'active', joinedAt: '2021-08-01' },
  { id: 'C001', name: 'Rachel Stone', email: 'rachel.stone@example.org', initials: 'RS', role: 'coach', schoolId: 'SCH01', department: 'Implementation Coach', status: 'active', joinedAt: '2020-08-01' },
  { id: 'R001', name: 'Dr. Jing Researcher', email: 'researcher@example.org', initials: 'JR', role: 'researcher', schoolId: 'SCH01', department: 'Research Team', status: 'active', joinedAt: '2022-03-14' },
  { id: 'SA001', name: 'Alex Super', email: 'superadmin@example.org', initials: 'AS', role: 'super_admin', schoolId: 'DISTRICT', department: 'District Office', status: 'active', joinedAt: '2020-01-01' },
  { id: 'DA001', name: 'Margaret Rivera', email: 'margaret.rivera@dist1.edu', initials: 'MR', role: 'district_admin', schoolId: 'DISTRICT', department: 'Riverside District Office', status: 'active', joinedAt: '2021-07-01' },
  { id: 'DA002', name: 'Charles Lee', email: 'charles.lee@dist2.edu', initials: 'CL', role: 'district_admin', schoolId: 'DISTRICT', department: 'Lakeside District Office', status: 'active', joinedAt: '2022-01-01' },
  { id: 'TEST_DA1', name: 'Testing – District 1 Admin', email: 'test.dist1@demo.com', initials: 'D1', role: 'district_admin', schoolId: 'DISTRICT', department: 'Testing', status: 'active', joinedAt: '2024-01-01' },
  { id: 'TEST_DA2', name: 'Testing – District 2 Admin', email: 'test.dist2@demo.com', initials: 'D2', role: 'district_admin', schoolId: 'DISTRICT', department: 'Testing', status: 'active', joinedAt: '2024-01-01' },
  { id: 'P001', name: 'Sarah Kim', email: 'sarah.kim@example.org', initials: 'SK', role: 'paraprofessional', schoolId: 'SCH01', department: 'Grade 4 · Support', status: 'active', joinedAt: '2024-08-20' },
  { id: 'P002', name: 'Marcus Webb', email: 'marcus.webb@example.org', initials: 'MW', role: 'paraprofessional', schoolId: 'SCH02', department: 'Grade 6 · Support', status: 'active', joinedAt: '2024-08-20' },
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

// ─── Log Comments ─────────────────────────────────────────────────────────────
export const logComments: LogComment[] = [
  { id: 'lc-1', logId: 'log-T001-1', authorId: 'C001', authorName: 'Rachel Stone',        authorRole: 'coach',      body: 'Strong concrete phase this session, Anna. The base-10 block work looked excellent.',                                        createdAt: '2026-05-22T10:00:00Z' },
  { id: 'lc-2', logId: 'log-T001-1', authorId: 'T001', authorName: 'Anna Carter',          authorRole: 'teacher',    body: 'Thanks Rachel! Students were noticeably more engaged — I think the smaller group size helped.',                            createdAt: '2026-05-22T11:30:00Z' },
  { id: 'lc-3', logId: 'log-T001-2', authorId: 'C001', authorName: 'Rachel Stone',        authorRole: 'coach',      body: "Dosage was a bit short this session — let's talk about pacing in our next coaching meeting.",                            createdAt: '2026-05-20T09:15:00Z' },
  { id: 'lc-4', logId: 'log-T001-3', authorId: 'R001', authorName: 'Dr. Jing Researcher', authorRole: 'researcher', body: 'Interesting adaptation here. The schema-based approach aligns closely with our FRAME-IS study hypothesis.',               createdAt: '2026-05-19T14:00:00Z' },
  { id: 'lc-5', logId: 'log-T001-3', authorId: 'T001', authorName: 'Anna Carter',          authorRole: 'teacher',    body: 'Happy to share more detail! The students really responded well to the visual schema cards.',                              createdAt: '2026-05-19T15:10:00Z' },
  { id: 'lc-6', logId: 'log-T002-1', authorId: 'C001', authorName: 'Rachel Stone',        authorRole: 'coach',      body: 'Brian, great improvement in lesson completion rate! Explicit modeling really shows in your fidelity scores.',             createdAt: '2026-05-21T08:00:00Z' },
  { id: 'lc-7', logId: 'log-T003-2', authorId: 'R001', authorName: 'Dr. Jing Researcher', authorRole: 'researcher', body: 'Carla, your Tier 3 adaptation documentation is exactly what the study needs. Thank you for the level of detail.',       createdAt: '2026-05-18T15:00:00Z' },
  { id: 'lc-8', logId: 'log-T003-2', authorId: 'C001', authorName: 'Rachel Stone',        authorRole: 'coach',      body: 'Agreed — Carla this is a model entry. Would you mind sharing this approach with the rest of the caseload team?',       createdAt: '2026-05-18T16:30:00Z' },
]

// ─── Conversations ────────────────────────────────────────────────────────────
export const conversations: Conversation[] = [
  {
    id: 'conv-1', participantIds: ['T001', 'C001'], createdAt: '2026-05-20T09:00:00Z',
    messages: [
      { id: 'dm-1',  conversationId: 'conv-1', senderId: 'C001', body: 'Hi Anna! How did the CRA lesson go today?',                                     createdAt: '2026-05-20T09:00:00Z', readAt: '2026-05-20T09:05:00Z' },
      { id: 'dm-2',  conversationId: 'conv-1', senderId: 'T001', body: 'It went really well! Students responded well to the concrete phase.',            createdAt: '2026-05-20T09:10:00Z', readAt: '2026-05-20T09:15:00Z' },
      { id: 'dm-3',  conversationId: 'conv-1', senderId: 'C001', body: 'Great to hear! Did you manage to complete the full lesson on time?',             createdAt: '2026-05-21T08:30:00Z' },
    ],
  },
  {
    id: 'conv-2', participantIds: ['T002', 'C001'], createdAt: '2026-05-21T10:00:00Z',
    messages: [
      { id: 'dm-4',  conversationId: 'conv-2', senderId: 'T002', body: 'Rachel, I have a question about Tier 2 grouping for next week.',                createdAt: '2026-05-21T10:00:00Z', readAt: '2026-05-21T10:05:00Z' },
      { id: 'dm-5',  conversationId: 'conv-2', senderId: 'C001', body: 'Of course! What are you thinking about?',                                        createdAt: '2026-05-21T10:30:00Z', readAt: '2026-05-21T11:00:00Z' },
      { id: 'dm-6',  conversationId: 'conv-2', senderId: 'T002', body: 'I want to split the 5 students by error type — is that okay per MTSS guidelines?', createdAt: '2026-05-21T11:05:00Z' },
    ],
  },
  {
    id: 'conv-3', participantIds: ['C001', 'A001'], createdAt: '2026-05-22T14:00:00Z',
    messages: [
      { id: 'dm-7',  conversationId: 'conv-3', senderId: 'A001', body: 'Rachel, can you share the Q2 fidelity summary for Lincoln K-8?',                createdAt: '2026-05-22T14:00:00Z', readAt: '2026-05-22T14:10:00Z' },
      { id: 'dm-8',  conversationId: 'conv-3', senderId: 'C001', body: "Sure! I'll have it ready by end of day.",                                        createdAt: '2026-05-22T14:15:00Z', readAt: '2026-05-22T14:30:00Z' },
      { id: 'dm-9',  conversationId: 'conv-3', senderId: 'A001', body: 'Perfect, thank you. Please include the per-teacher breakdown too.',              createdAt: '2026-05-22T14:32:00Z' },
    ],
  },
  {
    id: 'conv-4', participantIds: ['R001', 'A001'], createdAt: '2026-05-22T16:00:00Z',
    messages: [
      { id: 'dm-10', conversationId: 'conv-4', senderId: 'R001', body: "Monica, I'd like to schedule a data review meeting. Are you available next week?", createdAt: '2026-05-22T16:00:00Z', readAt: '2026-05-22T16:20:00Z' },
      { id: 'dm-11', conversationId: 'conv-4', senderId: 'A001', body: 'Absolutely! Tuesday or Thursday works for me.',                                  createdAt: '2026-05-22T16:30:00Z', readAt: '2026-05-22T16:35:00Z' },
      { id: 'dm-12', conversationId: 'conv-4', senderId: 'R001', body: "Let's do Tuesday at 2pm. I'll send the calendar invite.",                        createdAt: '2026-05-22T16:45:00Z', readAt: '2026-05-22T16:50:00Z' },
    ],
  },
  {
    id: 'conv-5', participantIds: ['T003', 'A001'], createdAt: '2026-05-23T08:00:00Z',
    messages: [
      { id: 'dm-13', conversationId: 'conv-5', senderId: 'T003', body: 'Monica, could I request a classroom aide for my Tier 3 group on Wednesdays?',   createdAt: '2026-05-23T08:00:00Z', readAt: '2026-05-23T08:30:00Z' },
      { id: 'dm-14', conversationId: 'conv-5', senderId: 'A001', body: "Good idea, Carla. Let me check staffing. I'll get back to you by Friday.",      createdAt: '2026-05-23T09:00:00Z' },
    ],
  },
  {
    id: 'conv-6', participantIds: ['T001', 'R001'], createdAt: '2026-05-23T10:00:00Z',
    messages: [
      { id: 'dm-15', conversationId: 'conv-6', senderId: 'R001', body: 'Anna, your implementation logs have been really detailed — would you be open to a brief interview for our study?', createdAt: '2026-05-23T10:00:00Z' },
    ],
  },
]

// ─── Budget Allocations ────────────────────────────────────────────────────────
export const budgetAllocations: BudgetAllocation[] = [
  { category: 'logging', label: 'Logging Incentives', allocated: 10000 },
]

// ─── Incentives ───────────────────────────────────────────────────────────────
export const incentives: Incentive[] = [
  // Spring 2026 — approved
  { id: 'inc-1',  recipientId: 'T001', recipientName: 'Anna Carter',  recipientRole: 'teacher', category: 'logging', amount: 75, reason: '12 consecutive logs completed on time',      awardedAt: '2026-04-15', status: 'approved', approvedAt: '2026-04-18' },
  { id: 'inc-5',  recipientId: 'T002', recipientName: 'Brian Lee',    recipientRole: 'teacher', category: 'logging', amount: 50, reason: 'Logged 8 sessions in April',                 awardedAt: '2026-05-01', status: 'approved', approvedAt: '2026-05-03' },
  // Spring 2026 — pending
  { id: 'inc-9',  recipientId: 'T004', recipientName: 'David Brooks', recipientRole: 'teacher', category: 'logging', amount: 50, reason: 'Improved log submission rate this period',    awardedAt: '2026-05-18', status: 'pending' },
  // Fall 2025 — approved
  { id: 'inc-11', recipientId: 'T001', recipientName: 'Anna Carter',  recipientRole: 'teacher', category: 'logging', amount: 75, reason: '10 consecutive logs completed on time',      awardedAt: '2025-10-15', status: 'approved', approvedAt: '2025-10-20' },
  { id: 'inc-12', recipientId: 'T002', recipientName: 'Brian Lee',    recipientRole: 'teacher', category: 'logging', amount: 50, reason: '8 sessions logged in September',              awardedAt: '2025-09-30', status: 'approved', approvedAt: '2025-10-05' },
]
