export type Role = 'teacher' | 'coach' | 'admin' | 'researcher'

export type User = {
  id: string
  name: string
  initials: string
  role: Role
  schoolId: string
  coachId?: string
}

export type School = {
  id: string
  name: string
  districtId: string
}

export type ImplementationLog = {
  id: string
  teacherId: string
  schoolId: string
  date: string
  instructionalRoutine: string
  ebpComponent: string
  implementationStrategy: string
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'SPED'
  durationMinutes: number
  lessonCompletion: 'fully' | 'partially' | 'not_completed'
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
}

export type CoachingMessage = {
  id: string
  cycleId: string
  senderId: string
  body: string
  createdAt: string
  readAt?: string
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
}

export type Notification = {
  id: string
  userId: string
  message: string
  type: 'missing_log' | 'fidelity_due' | 'coaching_followup' | 'training_deadline'
  readAt?: string
  createdAt: string
}

export type StudentDataUpload = {
  id: string
  teacherId: string
  date: string
  dataType: string
  value: number
  tier: string
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
