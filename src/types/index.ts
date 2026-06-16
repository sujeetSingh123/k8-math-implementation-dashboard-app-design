export type Role = 'teacher' | 'paraprofessional' | 'coach' | 'admin' | 'district_admin' | 'researcher' | 'super_admin'

export type User = {
  id: string
  name: string
  initials: string
  role: Role
  schoolId: string
  coachId?: string
  districtId?: string
}

export type District = {
  id: string
  name: string
}

export type School = {
  id: string
  name: string
  districtId: string
}

export type InstructionalSetting = 'General Education' | 'Pull-out Group' | 'Push-in Support' | 'Resource Room' | 'Co-taught Classroom'

export type ImplementationLog = {
  id: string
  teacherId: string
  schoolId: string
  sectionName?: string
  date: string
  startTime?: string
  instructionalRoutine?: string
  implementationStrategy?: string
  ebpComponent: string[]
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Special Education'
  instructionalSetting?: InstructionalSetting
  mathSkill?: string
  groupSize?: string
  anticipatesAdaptation?: boolean
  plannedAdaptationTypes?: string[]
  durationMinutes: number
  lessonCompletion: 'fully' | 'partially' | 'not_completed'
  ebpsDelivered?: number
  amountDelivered?: number
  studentsEngaged?: number
  effectiveDelivery?: number
  adaptationImpl?: 'fully' | 'partially' | 'not_implemented'
  adaptationPartialNotes?: string
  adaptationNotImplReason?: string
  unexpectedEvent?: 'good' | 'bad' | 'none'
  unexpectedDetail?: string
  unplannedAdaptCauses?: string[]
  studentAvgScore?: number
  adaptationOccurred: boolean
  notes?: string
}

export type Adaptation = {
  id: string
  logId: string
  teacherId: string
  whatModified: string[]
  reasons: string[]
  plannedVsReactive: 'planned' | 'reactive'
  fidelityType: 'consistent' | 'inconsistent'
  description: string
  date: string
}

export type FidelityCheck = {
  id: string
  teacherId: string
  logId?: string
  date: string
  adherence: number
  dosage: number
  quality: number
  responsiveness: number
  confidence: number
  reflectionNotes?: string
  feasibility?: number
  acceptability?: number
  sustainment?: number
}

export type CoachingMessage = {
  id: string
  cycleId: string
  senderId: string
  body: string
  createdAt: string
  readAt?: string
  attachmentName?: string
}

export type CoachingCycle = {
  id: string
  teacherId: string
  coachId: string
  goal: string
  startDate: string
  endDate?: string
  status: 'active' | 'completed' | 'paused'
  messages: CoachingMessage[]
  actions: CoachingAction[]
}

export type CoachingAction = {
  id: string
  cycleId: string
  description: string
  dueDate: string
  completedAt?: string
}

export type FeedbackItem = {
  id: string
  teacherId: string
  coachId: string
  cycleId: string
  teacherName: string
  initials: string
  date: string
  question: string
  reply: string
  resolved: boolean
}

export type TrainingSession = {
  id: string
  title: string
  type: 'training' | 'coaching' | 'lab'
  date: string
  durationHours: number
  attended: boolean
  description?: string
  facilitator?: string
  location?: string
}

export type TrainingAttendance = {
  id: string
  teacherId: string
  sessionTitle: string
  type: 'training' | 'lab' | 'coaching'
  checkedInAt: string
  checkedOutAt?: string
}

export type Notification = {
  id: string
  userId: string
  message: string
  type: 'missing_log' | 'fidelity_due' | 'coaching_followup' | 'training_deadline' | 'student_data_due' | 'adaptation_incomplete'
  readAt?: string
  createdAt: string
}

export type MeasureType =
  | 'CBM-Math Concepts & Applications'
  | 'Unit Assessment'
  | 'CBM-Math Computation'
  | 'Goal-Specific Progress Monitoring'
  | 'IEP Math Goal Probe'
  | 'Intervention Skill Probe'
  | 'Intensive Intervention Probe'

export type DataSource = 'Teacher upload' | 'Research team entry' | 'Data system import'
export type UploadStatus = 'Submitted' | 'Needs review' | 'Verified'

export type StudentDataRecord = {
  id: string
  teacherId: string
  schoolId?: string
  date: string
  week?: number
  grade?: string
  mtssTier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Special Education'
  instructionalSetting?: InstructionalSetting
  measureType: MeasureType
  studentsCount?: number
  baselineAvg?: number
  currentAvg: number
  growth?: number
  medianPct?: number
  atOrAboveBenchmark?: number
  belowBenchmark?: number
  interventionGroupAvg?: number
  comparisonGroupAvg?: number
  goalPct?: number
  metGoal?: boolean
  dataSource?: DataSource
  uploadStatus?: UploadStatus
  researchExportId?: string
  notes?: string
  logId?: string
}

export type SessionCheckIn = {
  userId: string
  checkedInAt: string
  approved?: boolean
}

export type PDSession = {
  id: string
  title: string
  type: 'training' | 'lab' | 'coaching'
  scheduledDate: string
  startTime?: string
  durationHours: number
  targetAudience: Role[]
  facilitator: string
  location: string
  status: 'upcoming' | 'completed' | 'cancelled'
  checkIns: SessionCheckIn[]
  description?: string
}

export type Permission = {
  id: string
  name: string
  description: string
  category: 'data' | 'users' | 'coaching' | 'reports' | 'organization'
}

export type RolePermissions = {
  role: Role
  permissionIds: string[]
}

export type OrgMember = {
  id: string
  name: string
  email: string
  initials: string
  role: Role
  schoolId: string
  department?: string
  status: 'active' | 'inactive' | 'pending'
  joinedAt: string
}

export type MockCredential = {
  email: string
  password: string
  userId: string
}

export type Resource = {
  id: string
  title: string
  type: 'video' | 'pdf' | 'word'
  duration: string
  description: string
  accessRoles: Role[]
  uploadedAt: string
  fileName?: string
}

export type LessonPlan = {
  id: string
  teacherId: string
  plannedDate: string
  plannedTime?: string
  instructionalRoutine: string
  ebpComponent: string[]
  implementationStrategy: string
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Special Education'
  instructionalSetting?: InstructionalSetting
  plannedDurationMinutes: number
  goal?: string
  status: 'upcoming' | 'logged' | 'missed'
  logId?: string
  createdAt: string
}

export type LogComment = {
  id: string
  logId: string
  authorId: string
  authorName: string
  authorRole: Role
  body: string
  createdAt: string
}

export type DirectMessage = {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
  readAt?: string
}

export type Conversation = {
  id: string
  participantIds: string[]
  messages: DirectMessage[]
  createdAt: string
}

export type IncentiveCategory = 'training' | 'performance' | 'logging'

export type Incentive = {
  id: string
  recipientId: string
  recipientName: string
  recipientRole: 'teacher' | 'coach'
  category: IncentiveCategory
  amount: number
  reason: string
  awardedAt: string
  status: 'pending' | 'approved'
  approvedAt?: string
  approvedBy?: string
}

export type BudgetAllocation = {
  category: IncentiveCategory
  label: string
  allocated: number
}
