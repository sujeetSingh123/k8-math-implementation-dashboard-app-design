import type {
  User,
  School,
  ImplementationLog,
  Adaptation,
  FidelityCheck,
  CoachingCycle,
  FeedbackItem,
  TrainingSession,
  Notification,
  Permission,
  RolePermissions,
  OrgMember,
  MockCredential,
} from '../types'

// ─── Schools ─────────────────────────────────────────────────────────────────
export const schools: School[] = [
  { id: 'sch1', name: 'Lincoln Elementary', districtId: 'dist1' },
  { id: 'sch2', name: 'Washington Elementary', districtId: 'dist1' },
  { id: 'sch3', name: 'Jefferson Elementary', districtId: 'dist1' },
]

// ─── Users ────────────────────────────────────────────────────────────────────
export const users: User[] = [
  { id: 't1', name: 'Jane Smith', initials: 'JS', role: 'teacher', schoolId: 'sch1', coachId: 'c1' },
  { id: 't2', name: 'Kevin Johnson', initials: 'KJ', role: 'teacher', schoolId: 'sch1', coachId: 'c1' },
  { id: 't3', name: 'Teresa Rivera', initials: 'TR', role: 'teacher', schoolId: 'sch2', coachId: 'c1' },
  { id: 't4', name: 'Mira Park', initials: 'MP', role: 'teacher', schoolId: 'sch2', coachId: 'c1' },
  { id: 't5', name: 'Luis Torres', initials: 'LT', role: 'teacher', schoolId: 'sch3', coachId: 'c2' },
  { id: 'c1', name: 'Maria Chen', initials: 'MC', role: 'coach', schoolId: 'sch1' },
  { id: 'c2', name: 'David Kim', initials: 'DK', role: 'coach', schoolId: 'sch3' },
  { id: 'a1', name: 'Aisha Patel', initials: 'AP', role: 'admin', schoolId: 'sch1' },
  { id: 'r1', name: 'Robert Liu', initials: 'RL', role: 'researcher', schoolId: 'sch1' },
]

export const usersByRole: Record<string, User> = {
  teacher: users[0],
  coach: users[5],
  admin: users[7],
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
    ebpComponent: ebps[randomBetween(0, 4)],
    implementationStrategy: strategies[randomBetween(0, 3)],
    tier: tiers[randomBetween(0, 3)],
    durationMinutes: randomBetween(20, 60),
    lessonCompletion: completion,
    adaptationOccurred: Math.random() > 0.7,
    notes: Math.random() > 0.6 ? 'Students needed additional scaffolding today.' : undefined,
  }
}

// ─── Implementation Logs ──────────────────────────────────────────────────────
// Jane: ~82% completion, Kevin: ~65%, Teresa: ~91%, Mira: ~48%, Luis: ~77%
export const implementationLogs: ImplementationLog[] = [
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-t1-${i}`, 't1', 'sch1', i * 7 + randomBetween(0, 6), [0.82, 0.12, 0.06])),
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-t2-${i}`, 't2', 'sch1', i * 7 + randomBetween(0, 6), [0.65, 0.25, 0.10])),
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-t3-${i}`, 't3', 'sch2', i * 7 + randomBetween(0, 6), [0.91, 0.07, 0.02])),
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-t4-${i}`, 't4', 'sch2', i * 7 + randomBetween(0, 6), [0.48, 0.35, 0.17])),
  ...Array.from({ length: 12 }, (_, i) => makeLog(`log-t5-${i}`, 't5', 'sch3', i * 7 + randomBetween(0, 6), [0.77, 0.17, 0.06])),
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

// Jane avg ~3.8, Kevin avg ~3.2, Teresa avg ~4.6, Mira avg ~2.9, Luis avg ~3.5
export const fidelityChecks: FidelityCheck[] = [
  ...implementationLogs.filter(l => l.teacherId === 't1').map((l, i) => makeFidelity(`fid-t1-${i}`, 't1', l.id, i * 7, 3.8)),
  ...implementationLogs.filter(l => l.teacherId === 't2').map((l, i) => makeFidelity(`fid-t2-${i}`, 't2', l.id, i * 7, 3.2)),
  ...implementationLogs.filter(l => l.teacherId === 't3').map((l, i) => makeFidelity(`fid-t3-${i}`, 't3', l.id, i * 7, 4.6)),
  ...implementationLogs.filter(l => l.teacherId === 't4').map((l, i) => makeFidelity(`fid-t4-${i}`, 't4', l.id, i * 7, 2.9)),
  ...implementationLogs.filter(l => l.teacherId === 't5').map((l, i) => makeFidelity(`fid-t5-${i}`, 't5', l.id, i * 7, 3.5)),
]

// ─── Adaptations ──────────────────────────────────────────────────────────────
export const modificationOptions = ['Content', 'Timing/Duration', 'Materials', 'Delivery method', 'Grouping']
export const adaptationReasons = ['Time constraints', 'Student responsiveness', 'Scheduling issues', 'Resource limitations', 'Behavior concerns', 'Language needs']

const modOptions = modificationOptions
const reasonOptions = adaptationReasons

export const adaptations: Adaptation[] = [
  { id: 'adp-1', logId: 'log-t1-0', teacherId: 't1', whatModified: ['Timing/Duration', 'Content'], reasons: ['Time constraints'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Shortened warm-up to fit within class period.', date: daysAgo(5) },
  { id: 'adp-2', logId: 'log-t1-2', teacherId: 't1', whatModified: ['Delivery method'], reasons: ['Student responsiveness'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Switched to pair work for guided practice.', date: daysAgo(19) },
  { id: 'adp-3', logId: 'log-t1-4', teacherId: 't1', whatModified: ['Materials'], reasons: ['Resource limitations'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Used whiteboard instead of printed materials.', date: daysAgo(33) },
  { id: 'adp-4', logId: 'log-t1-6', teacherId: 't1', whatModified: ['Grouping'], reasons: ['Behavior concerns'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Regrouped students to separate disruptions.', date: daysAgo(47) },
  { id: 'adp-5', logId: 'log-t1-8', teacherId: 't1', whatModified: ['Content'], reasons: ['Language needs'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Added bilingual vocabulary support.', date: daysAgo(61) },
  { id: 'adp-6', logId: 'log-t2-0', teacherId: 't2', whatModified: ['Timing/Duration'], reasons: ['Scheduling issues'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Abbreviated lesson due to assembly schedule.', date: daysAgo(6) },
  { id: 'adp-7', logId: 'log-t2-2', teacherId: 't2', whatModified: ['Delivery method', 'Materials'], reasons: ['Student responsiveness', 'Resource limitations'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Used manipulatives when technology was unavailable.', date: daysAgo(20) },
  { id: 'adp-8', logId: 'log-t2-4', teacherId: 't2', whatModified: ['Content'], reasons: ['Time constraints'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Skipped extension problem to cover core standard.', date: daysAgo(34) },
  { id: 'adp-9', logId: 'log-t2-6', teacherId: 't2', whatModified: ['Grouping'], reasons: ['Behavior concerns'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Moved to whole-group after small-group disruption.', date: daysAgo(48) },
  { id: 'adp-10', logId: 'log-t3-0', teacherId: 't3', whatModified: ['Delivery method'], reasons: ['Student responsiveness'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Added additional worked examples for struggling students.', date: daysAgo(7) },
  { id: 'adp-11', logId: 'log-t3-2', teacherId: 't3', whatModified: ['Content', 'Materials'], reasons: ['Language needs'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Provided sentence frames for ELL students.', date: daysAgo(21) },
  { id: 'adp-12', logId: 'log-t3-4', teacherId: 't3', whatModified: ['Timing/Duration'], reasons: ['Time constraints'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Extended practice time based on formative check.', date: daysAgo(35) },
  { id: 'adp-13', logId: 'log-t4-0', teacherId: 't4', whatModified: ['Delivery method', 'Grouping'], reasons: ['Behavior concerns', 'Student responsiveness'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Pivoted to direct instruction when cooperative work failed.', date: daysAgo(8) },
  { id: 'adp-14', logId: 'log-t4-2', teacherId: 't4', whatModified: ['Materials'], reasons: ['Resource limitations'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'No access to technology; reverted to paper worksheets.', date: daysAgo(22) },
  { id: 'adp-15', logId: 'log-t4-4', teacherId: 't4', whatModified: ['Content'], reasons: ['Time constraints', 'Scheduling issues'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Could not complete all lesson components.', date: daysAgo(36) },
  { id: 'adp-16', logId: 'log-t4-6', teacherId: 't4', whatModified: ['Timing/Duration'], reasons: ['Student responsiveness'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Slowed pace after observing low engagement.', date: daysAgo(50) },
  { id: 'adp-17', logId: 'log-t5-0', teacherId: 't5', whatModified: ['Delivery method'], reasons: ['Student responsiveness'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Incorporated additional concrete materials for Tier 3.', date: daysAgo(9) },
  { id: 'adp-18', logId: 'log-t5-2', teacherId: 't5', whatModified: ['Content', 'Grouping'], reasons: ['Language needs', 'Behavior concerns'], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Differentiated task complexity by tier group.', date: daysAgo(23) },
  { id: 'adp-19', logId: 'log-t5-4', teacherId: 't5', whatModified: ['Materials'], reasons: ['Resource limitations'], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Used classroom funds for base-ten blocks.', date: daysAgo(37) },
  { id: 'adp-20', logId: 'log-t5-6', teacherId: 't5', whatModified: ['Timing/Duration'], reasons: ['Time constraints'], plannedVsReactive: 'reactive', fidelityType: 'consistent', description: 'Shortened fluency drill to address misconceptions.', date: daysAgo(51) },
  { id: 'adp-21', logId: 'log-t1-10', teacherId: 't1', whatModified: modOptions.slice(0, 2), reasons: [reasonOptions[0]], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Planned pacing adjustment for upcoming assessment week.', date: daysAgo(75) },
  { id: 'adp-22', logId: 'log-t2-8', teacherId: 't2', whatModified: [modOptions[2]], reasons: [reasonOptions[3]], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Copied from another classroom due to printer outage.', date: daysAgo(62) },
  { id: 'adp-23', logId: 'log-t3-6', teacherId: 't3', whatModified: [modOptions[1]], reasons: [reasonOptions[1]], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Added extra think time after data review.', date: daysAgo(49) },
  { id: 'adp-24', logId: 'log-t4-8', teacherId: 't4', whatModified: [modOptions[4]], reasons: [reasonOptions[4]], plannedVsReactive: 'reactive', fidelityType: 'inconsistent', description: 'Separated two students after repeated disruptions.', date: daysAgo(64) },
  { id: 'adp-25', logId: 'log-t5-8', teacherId: 't5', whatModified: [modOptions[0]], reasons: [reasonOptions[5]], plannedVsReactive: 'planned', fidelityType: 'consistent', description: 'Translated key vocabulary into Spanish for newcomers.', date: daysAgo(65) },
]

// ─── Coaching Cycles ──────────────────────────────────────────────────────────
export const coachingCycles: CoachingCycle[] = [
  {
    id: 'cyc-t1',
    teacherId: 't1',
    coachId: 'c1',
    goal: 'Increase use of CRA sequence during explicit instruction to improve Tier 2 student outcomes',
    startDate: daysAgo(45),
    status: 'active',
    messages: [
      { id: 'msg-t1-1', cycleId: 'cyc-t1', senderId: 'c1', body: 'Hi Jane! Looking at your recent logs, your CRA implementation is strong. Let\'s focus on the representational bridge this cycle.', createdAt: daysAgo(40) },
      { id: 'msg-t1-2', cycleId: 'cyc-t1', senderId: 't1', body: 'Thanks Maria! I\'ve been working on the pictorial step. Some students still jump straight to abstract — any strategies?', createdAt: daysAgo(38) },
      { id: 'msg-t1-3', cycleId: 'cyc-t1', senderId: 'c1', body: 'Try requiring students to draw their thinking before writing the equation. I\'ll share a graphic organizer that works well.', createdAt: daysAgo(36) },
      { id: 'msg-t1-4', cycleId: 'cyc-t1', senderId: 't1', body: 'Used the organizer today — huge difference! My Tier 2 students actually stayed in the representational stage longer.', createdAt: daysAgo(20) },
      { id: 'msg-t1-5', cycleId: 'cyc-t1', senderId: 'c1', body: 'Excellent! I noticed that in your fidelity check too. Let\'s discuss your data at our next meeting.', createdAt: daysAgo(18) },
    ],
    actions: [
      { id: 'act-t1-1', cycleId: 'cyc-t1', description: 'Complete CRA graphic organizer for 3 lessons', dueDate: daysAgo(-7), completedAt: daysAgo(15) },
      { id: 'act-t1-2', cycleId: 'cyc-t1', description: 'Observe Tier 2 student engagement during representational phase', dueDate: daysAgo(-3), completedAt: undefined },
      { id: 'act-t1-3', cycleId: 'cyc-t1', description: 'Complete fidelity self-check for week 3', dueDate: daysAgo(-10), completedAt: daysAgo(10) },
    ],
  },
  {
    id: 'cyc-t2',
    teacherId: 't2',
    coachId: 'c1',
    goal: 'Improve lesson completion rate by strengthening pacing strategies and time management',
    startDate: daysAgo(40),
    status: 'active',
    messages: [
      { id: 'msg-t2-1', cycleId: 'cyc-t2', senderId: 'c1', body: 'Kevin, I\'ve noticed your log completion rate has dipped. Let\'s work on pacing — what feels like the biggest barrier?', createdAt: daysAgo(38) },
      { id: 'msg-t2-2', cycleId: 'cyc-t2', senderId: 't2', body: 'Honestly it\'s transitions. Students take 8-10 minutes between activities and I run out of time.', createdAt: daysAgo(35) },
      { id: 'msg-t2-3', cycleId: 'cyc-t2', senderId: 'c1', body: 'That\'s very common. Try a visual timer and a 2-minute warning signal. Want me to demo it during your prep?', createdAt: daysAgo(33) },
      { id: 'msg-t2-4', cycleId: 'cyc-t2', senderId: 't2', body: 'Yes please! Also wondering if the fluency practice block is too long — 20 minutes seems excessive.', createdAt: daysAgo(15) },
    ],
    actions: [
      { id: 'act-t2-1', cycleId: 'cyc-t2', description: 'Implement visual timer during transitions for 2 weeks', dueDate: daysAgo(-5), completedAt: undefined },
      { id: 'act-t2-2', cycleId: 'cyc-t2', description: 'Time each lesson component and log results', dueDate: daysAgo(-2), completedAt: undefined },
    ],
  },
  {
    id: 'cyc-t3',
    teacherId: 't3',
    coachId: 'c1',
    goal: 'Deepen fidelity to error correction protocols during explicit modeling',
    startDate: daysAgo(50),
    status: 'active',
    messages: [
      { id: 'msg-t3-1', cycleId: 'cyc-t3', senderId: 'c1', body: 'Teresa, your fidelity scores are excellent! For this cycle let\'s focus on error correction — making it more systematic.', createdAt: daysAgo(48) },
      { id: 'msg-t3-2', cycleId: 'cyc-t3', senderId: 't3', body: 'I\'d love that. I feel like I correct errors differently depending on the student and I want to be more consistent.', createdAt: daysAgo(44) },
      { id: 'msg-t3-3', cycleId: 'cyc-t3', senderId: 'c1', body: 'Exactly the right instinct. I\'ll share the district error correction protocol — it has a 4-step model.', createdAt: daysAgo(42) },
      { id: 'msg-t3-4', cycleId: 'cyc-t3', senderId: 't3', body: 'Used the 4-step model today — "stop, model, re-teach, practice." Students responded really well!', createdAt: daysAgo(25) },
      { id: 'msg-t3-5', cycleId: 'cyc-t3', senderId: 'c1', body: 'That\'s fantastic. I can see it in your fidelity data — responsiveness scores jumped. Keep it up!', createdAt: daysAgo(22) },
    ],
    actions: [
      { id: 'act-t3-1', cycleId: 'cyc-t3', description: 'Implement 4-step error correction protocol consistently', dueDate: daysAgo(-1), completedAt: daysAgo(20) },
      { id: 'act-t3-2', cycleId: 'cyc-t3', description: 'Track error correction instances in daily log notes', dueDate: daysAgo(-4), completedAt: daysAgo(12) },
      { id: 'act-t3-3', cycleId: 'cyc-t3', description: 'Co-plan next unit with error correction focus', dueDate: daysAgo(-14), completedAt: undefined },
    ],
  },
  {
    id: 'cyc-t4',
    teacherId: 't4',
    coachId: 'c1',
    goal: 'Build consistency in Tier 2 small group delivery through structured routine',
    startDate: daysAgo(35),
    status: 'active',
    messages: [
      { id: 'msg-t4-1', cycleId: 'cyc-t4', senderId: 'c1', body: 'Mira, let\'s start by mapping out what a typical Tier 2 session looks like for you right now.', createdAt: daysAgo(33) },
      { id: 'msg-t4-2', cycleId: 'cyc-t4', senderId: 't4', body: 'Honestly it varies a lot. I don\'t have a set routine yet — sometimes I do re-teaching, sometimes extra practice.', createdAt: daysAgo(30) },
      { id: 'msg-t4-3', cycleId: 'cyc-t4', senderId: 'c1', body: 'Let\'s build a structured routine together: warm-up, targeted instruction, guided practice, exit check. 20 min total.', createdAt: daysAgo(28) },
      { id: 'msg-t4-4', cycleId: 'cyc-t4', senderId: 't4', body: 'I tried the routine template today. It helped a lot — I actually finished on time for the first time in weeks!', createdAt: daysAgo(10) },
    ],
    actions: [
      { id: 'act-t4-1', cycleId: 'cyc-t4', description: 'Use Tier 2 routine template for all small group sessions', dueDate: daysAgo(-7), completedAt: undefined },
      { id: 'act-t4-2', cycleId: 'cyc-t4', description: 'Complete 3 fidelity self-checks for Tier 2 sessions', dueDate: daysAgo(-10), completedAt: undefined },
    ],
  },
  {
    id: 'cyc-t5',
    teacherId: 't5',
    coachId: 'c2',
    goal: 'Improve Tier 3 data use — connecting progress monitoring to instructional decisions',
    startDate: daysAgo(42),
    status: 'active',
    messages: [
      { id: 'msg-t5-1', cycleId: 'cyc-t5', senderId: 'c2', body: 'Luis, your Tier 3 work is solid. This cycle I want to focus on data-informed decisions — using PM scores to adjust instruction.', createdAt: daysAgo(40) },
      { id: 'msg-t5-2', cycleId: 'cyc-t5', senderId: 't5', body: 'I collect the data but honestly I\'m not always sure what to do with it. The scores don\'t always match what I see in class.', createdAt: daysAgo(37) },
      { id: 'msg-t5-3', cycleId: 'cyc-t5', senderId: 'c2', body: 'That\'s a really common feeling. Let\'s look at your data together and I can show you a decision tree for Tier 3 adjustments.', createdAt: daysAgo(35) },
      { id: 'msg-t5-4', cycleId: 'cyc-t5', senderId: 't5', body: 'The decision tree is really helpful — adjusted two students\' intensity last week based on flat trajectory data.', createdAt: daysAgo(18) },
      { id: 'msg-t5-5', cycleId: 'cyc-t5', senderId: 'c2', body: 'Perfect application. How are those students responding to the increased intensity?', createdAt: daysAgo(16) },
    ],
    actions: [
      { id: 'act-t5-1', cycleId: 'cyc-t5', description: 'Review PM data weekly and document decisions in log', dueDate: daysAgo(-3), completedAt: daysAgo(14) },
      { id: 'act-t5-2', cycleId: 'cyc-t5', description: 'Present Tier 3 data at next MTSS team meeting', dueDate: daysAgo(-8), completedAt: undefined },
      { id: 'act-t5-3', cycleId: 'cyc-t5', description: 'Adjust instruction for 2 students with flat trajectories', dueDate: daysAgo(-5), completedAt: daysAgo(16) },
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
  t1: makeTrainingSessions('t1'),
  t2: makeTrainingSessions('t2'),
  t3: makeTrainingSessions('t3'),
  t4: makeTrainingSessions('t4'),
  t5: makeTrainingSessions('t5'),
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'n1', userId: 't1', message: 'Your fidelity self-check is due — last completed 8 days ago.', type: 'fidelity_due', createdAt: daysAgo(1) },
  { id: 'n2', userId: 't1', message: 'Maria Chen left feedback on your coaching thread.', type: 'coaching_followup', createdAt: daysAgo(2) },
  { id: 'n3', userId: 't1', message: '"Data-Driven Instructional Decisions" training is in 3 days.', type: 'training_deadline', createdAt: daysAgo(0) },
  { id: 'n4', userId: 't2', message: 'Implementation log missing for 3 days.', type: 'missing_log', createdAt: daysAgo(0) },
  { id: 'n5', userId: 't2', message: 'Your fidelity self-check is due.', type: 'fidelity_due', createdAt: daysAgo(1) },
  { id: 'n6', userId: 't2', message: 'New message from Maria Chen in your coaching thread.', type: 'coaching_followup', createdAt: daysAgo(3) },
  { id: 'n7', userId: 't3', message: 'Fidelity self-check due this week.', type: 'fidelity_due', createdAt: daysAgo(2) },
  { id: 'n8', userId: 't3', message: 'Maria Chen left a comment on your adaptation documentation.', type: 'coaching_followup', createdAt: daysAgo(1) },
  { id: 'n9', userId: 't3', message: 'Upcoming training: Adaptation Documentation (FRAME-IS) on Friday.', type: 'training_deadline', createdAt: daysAgo(0) },
  { id: 'n10', userId: 'c1', message: '2 teachers have pending coaching questions.', type: 'coaching_followup', createdAt: daysAgo(0) },
  { id: 'n11', userId: 'c1', message: 'Mira Park\'s fidelity average has dropped below 3.0.', type: 'fidelity_due', createdAt: daysAgo(1) },
  { id: 'n12', userId: 'c1', message: 'Kevin Johnson has missing logs for 3 days.', type: 'missing_log', createdAt: daysAgo(2) },
  { id: 'n13', userId: 'a1', message: 'Monthly MTSS implementation report is ready for review.', type: 'missing_log', createdAt: daysAgo(0) },
  { id: 'n14', userId: 'a1', message: 'Jefferson Elementary fidelity average dropped to 3.1 this week.', type: 'fidelity_due', createdAt: daysAgo(1) },
  { id: 'n15', userId: 'a1', message: 'Training participation report updated.', type: 'training_deadline', createdAt: daysAgo(3) },
  { id: 'n16', userId: 'r1', message: 'New implementation data available for Q2 export.', type: 'missing_log', createdAt: daysAgo(0) },
  { id: 'n17', userId: 'r1', message: 'Cross-site comparison data refresh complete.', type: 'coaching_followup', createdAt: daysAgo(2) },
  { id: 'n18', userId: 'r1', message: 'Site B monthly upload is pending review.', type: 'fidelity_due', createdAt: daysAgo(1) },
]

// ─── Feedback Items ───────────────────────────────────────────────────────────
export const feedbackItems: FeedbackItem[] = [
  {
    id: 'fq1', teacherId: 't1', coachId: 'c1', cycleId: 'cyc-t1',
    teacherName: 'Jane Smith', initials: 'JS', date: '2026-05-15',
    question: 'How should I handle students who skip the representational phase during CRA? They jump straight to the abstract and I\'m not sure how to redirect without losing momentum.',
    reply: '', resolved: false,
  },
  {
    id: 'fq2', teacherId: 't2', coachId: 'c1', cycleId: 'cyc-t2',
    teacherName: 'Kevin Johnson', initials: 'KJ', date: '2026-05-14',
    question: 'My lesson ran 10 minutes over today — should I log it as partially completed or fully completed? The content was all covered just not in the time I planned.',
    reply: '', resolved: false,
  },
  {
    id: 'fq3', teacherId: 't4', coachId: 'c1', cycleId: 'cyc-t4',
    teacherName: 'Mira Park', initials: 'MP', date: '2026-05-13',
    question: 'Can I count co-teaching sessions with the special ed teacher as a Tier 2 intervention? We\'re working with the same 5 students every day.',
    reply: '', resolved: false,
  },
]

// ─── Resources ────────────────────────────────────────────────────────────────
export const resources = [
  { id: 'res-1', title: 'CRA Routine Implementation Guide', type: 'video', duration: '22 min', description: 'Step-by-step walkthrough of the Concrete-Representational-Abstract sequence.' },
  { id: 'res-2', title: 'MTSS Mathematics Implementation Manual', type: 'pdf', duration: '48 pages', description: 'Complete district manual for multi-tiered math support.' },
  { id: 'res-3', title: 'Daily Log Completion Checklist', type: 'checklist', duration: '1 page', description: 'Quick reference for completing your daily implementation log.' },
  { id: 'res-4', title: 'Fidelity Self-Assessment Rubric', type: 'rubric', duration: '2 pages', description: 'Detailed rubric aligned to the 5 fidelity dimensions.' },
  { id: 'res-5', title: 'Tier 2 Small Group Strategies', type: 'video', duration: '18 min', description: 'Evidence-based strategies for Tier 2 targeted instruction.' },
  { id: 'res-6', title: 'Adaptation Decision Guide (FRAME-IS)', type: 'pdf', duration: '6 pages', description: 'Framework for documenting and evaluating instructional adaptations.' },
  { id: 'res-7', title: 'Error Correction Protocol Walkthrough', type: 'video', duration: '15 min', description: 'Demonstration of the 4-step error correction model.' },
  { id: 'res-8', title: 'Progress Monitoring Interpretation Guide', type: 'pdf', duration: '12 pages', description: 'How to use progress monitoring data for Tier 3 decisions.' },
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
  t1: monthlyFidelityTrend.map(m => ({ ...m, adherence: m.adherence - 0.2, dosage: m.dosage - 0.1 })),
  t3: monthlyFidelityTrend.map(m => ({ ...m, adherence: m.adherence + 0.4, dosage: m.dosage + 0.3 })),
  t4: monthlyFidelityTrend.map(m => ({ ...m, adherence: m.adherence - 1.0, dosage: m.dosage - 0.8 })),
}

// ─── Mock Credentials ─────────────────────────────────────────────────────────
export const mockCredentials: MockCredential[] = [
  { email: 'teacher@demo.com', password: 'demo1234', userId: 't1' },
  { email: 'coach@demo.com', password: 'demo1234', userId: 'c1' },
  { email: 'admin@demo.com', password: 'demo1234', userId: 'a1' },
  { email: 'researcher@demo.com', password: 'demo1234', userId: 'r1' },
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
  { id: 't1', name: 'Jane Smith', email: 'jane.smith@district1.edu', initials: 'JS', role: 'teacher', schoolId: 'sch1', department: 'Grade 3', status: 'active', joinedAt: '2023-08-15' },
  { id: 't2', name: 'Kevin Johnson', email: 'kevin.johnson@district1.edu', initials: 'KJ', role: 'teacher', schoolId: 'sch1', department: 'Grade 4', status: 'active', joinedAt: '2022-08-10' },
  { id: 't3', name: 'Teresa Rivera', email: 'teresa.rivera@district1.edu', initials: 'TR', role: 'teacher', schoolId: 'sch2', department: 'Grade 2', status: 'active', joinedAt: '2021-09-01' },
  { id: 't4', name: 'Mira Park', email: 'mira.park@district1.edu', initials: 'MP', role: 'teacher', schoolId: 'sch2', department: 'Grade 5', status: 'active', joinedAt: '2024-01-08' },
  { id: 't5', name: 'Luis Torres', email: 'luis.torres@district1.edu', initials: 'LT', role: 'teacher', schoolId: 'sch3', department: 'Grade 1', status: 'active', joinedAt: '2023-01-15' },
  { id: 't6', name: 'Priya Nair', email: 'priya.nair@district1.edu', initials: 'PN', role: 'teacher', schoolId: 'sch3', department: 'Grade 3', status: 'pending', joinedAt: '2026-04-20' },
  { id: 'c1', name: 'Maria Chen', email: 'coach@demo.com', initials: 'MC', role: 'coach', schoolId: 'sch1', status: 'active', joinedAt: '2020-08-01' },
  { id: 'c2', name: 'David Kim', email: 'david.kim@district1.edu', initials: 'DK', role: 'coach', schoolId: 'sch3', status: 'active', joinedAt: '2021-08-01' },
  { id: 'a1', name: 'Aisha Patel', email: 'admin@demo.com', initials: 'AP', role: 'admin', schoolId: 'sch1', status: 'active', joinedAt: '2019-07-01' },
  { id: 'r1', name: 'Robert Liu', email: 'researcher@demo.com', initials: 'RL', role: 'researcher', schoolId: 'sch1', status: 'active', joinedAt: '2022-03-14' },
  { id: 'r2', name: 'Sandra Okafor', email: 'sandra.okafor@university.edu', initials: 'SO', role: 'researcher', schoolId: 'sch2', status: 'inactive', joinedAt: '2021-09-01' },
]
