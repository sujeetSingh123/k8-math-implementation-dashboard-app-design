import { create } from 'zustand'
import type {
  Role,
  User,
  District,
  School,
  MockCredential,
  ImplementationLog,
  Adaptation,
  FidelityCheck,
  CoachingCycle,
  CoachingMessage,
  CoachingAction,
  FeedbackItem,
  TrainingAttendance,
  Notification,
  StudentDataRecord,
  PDSession,
  RolePermissions,
  OrgMember,
  Resource,
  LessonPlan,
  Incentive,
  BudgetAllocation,
  Conversation,
  DirectMessage,
  LogComment,
} from '../types'
import {
  users as initialUsers,
  districts as initialDistricts,
  schools as initialSchools,
  implementationLogs,
  adaptations,
  fidelityChecks,
  coachingCycles,
  feedbackItems,
  trainingAttendances,
  notifications,
  mockCredentials as initialCredentials,
  rolePermissions,
  orgMembers,
  studentDataRecords,
  pdSessions,
  resources,
  lessonPlans,
  incentives,
  budgetAllocations,
  conversations,
  logComments,
} from '../data/mockData'

const defaultUser = initialUsers.find(u => u.id === 'T001')!

const defaultDeterminants: Record<string, number> = {
  'Leadership Support': 72,
  'Coaching Access': 85,
  'Staffing Stability': 64,
  'MTSS Maturity': 58,
  'Resource Availability': 79,
  'Implementation Climate': 70,
}

interface AppStore {
  isAuthenticated: boolean
  currentRole: Role
  currentUser: User
  users: User[]
  districts: District[]
  schools: School[]
  credentials: MockCredential[]
  notifications: Notification[]
  implementationLogs: ImplementationLog[]
  adaptations: Adaptation[]
  fidelityChecks: FidelityCheck[]
  coachingCycles: CoachingCycle[]
  feedbackItems: FeedbackItem[]
  flaggedTeachers: string[]

  trainingAttendances: TrainingAttendance[]
  rolePermissions: RolePermissions[]
  orgMembers: OrgMember[]
  studentDataRecords: StudentDataRecord[]
  pdSessions: PDSession[]
  determinants: Record<string, number>
  resources: Resource[]
  lessonPlans: LessonPlan[]
  pendingPlan: LessonPlan | null
  incentives: Incentive[]
  budgetAllocations: BudgetAllocation[]
  conversations: Conversation[]
  logComments: LogComment[]

  login: (email: string, password: string) => boolean
  logout: () => void
  addDistrict: (district: District) => void
  addSchool: (school: School) => void
  addUser: (user: User, email: string) => void
  addLog: (log: ImplementationLog) => void
  addAdaptation: (adaptation: Adaptation) => void
  addFidelityCheck: (check: FidelityCheck) => void
  sendMessage: (cycleId: string, message: CoachingMessage) => void
  markNotificationRead: (id: string) => void
  completeAction: (cycleId: string, actionId: string) => void
  togglePermission: (role: Role, permissionId: string) => void
  addOrgMember: (member: OrgMember) => void
  updateOrgMember: (id: string, updates: Partial<OrgMember>) => void
  addFeedbackItem: (item: FeedbackItem) => void
  replyToFeedback: (id: string, reply: string, senderId: string, attachmentName?: string) => void
  addCycleAction: (cycleId: string, action: CoachingAction) => void
  toggleFlag: (teacherId: string) => void
  checkInTraining: (entry: TrainingAttendance) => void
  checkOutTraining: (id: string) => void
  addStudentDataRecord: (record: StudentDataRecord) => void
  addPDSession: (session: PDSession) => void
  checkInSession: (sessionId: string, userId: string) => void
  approveCheckIn: (sessionId: string, userId: string, approved: boolean) => void
  updateDeterminant: (key: string, value: number) => void
  addResource: (resource: Resource) => void
  updateResource: (id: string, updates: Partial<Resource>) => void
  deleteResource: (id: string) => void
  addLessonPlan: (plan: LessonPlan) => void
  deleteLessonPlan: (id: string) => void
  updateLessonPlan: (id: string, updates: Partial<LessonPlan>) => void
  setPendingPlan: (plan: LessonPlan | null) => void
  awardIncentive: (data: Omit<Incentive, 'id' | 'awardedAt' | 'status'>, approverId?: string) => void
  approveIncentive: (id: string, approverId: string) => void
  rejectIncentive: (id: string) => void
  sendDirectMessage: (conversationId: string, body: string, senderId: string) => void
  startConversation: (userId1: string, userId2: string) => string
  markConversationRead: (conversationId: string, userId: string) => void
  addLogComment: (comment: LogComment) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  isAuthenticated: false,
  currentRole: 'teacher',
  currentUser: defaultUser,
  users: initialUsers,
  districts: initialDistricts,
  schools: initialSchools,
  credentials: initialCredentials,
  notifications,
  implementationLogs,
  adaptations,
  fidelityChecks,
  coachingCycles,
  feedbackItems,
  flaggedTeachers: [],
  trainingAttendances,
  rolePermissions,
  orgMembers,
  studentDataRecords,
  pdSessions,
  determinants: defaultDeterminants,
  resources,
  lessonPlans,
  pendingPlan: null,
  incentives,
  budgetAllocations,
  conversations,
  logComments,

  login: (email, password) => {
    const { credentials, users } = get()
    const cred = credentials.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password,
    )
    if (!cred) return false
    const user = users.find((u) => u.id === cred.userId)
    if (!user) return false
    set({ isAuthenticated: true, currentUser: user, currentRole: user.role })
    return true
  },

  logout: () =>
    set({ isAuthenticated: false, currentUser: defaultUser, currentRole: 'teacher' }),

  addDistrict: (district) =>
    set((state) => ({ districts: [...state.districts, district] })),

  addSchool: (school) =>
    set((state) => ({ schools: [...state.schools, school] })),

  addUser: (user, email) =>
    set((state) => ({
      users: [...state.users, user],
      orgMembers: [
        ...state.orgMembers,
        {
          id: user.id,
          name: user.name,
          email,
          initials: user.initials,
          role: user.role,
          schoolId: user.schoolId,
          status: 'active' as const,
          joinedAt: new Date().toISOString().split('T')[0],
        },
      ],
      credentials: [
        ...state.credentials,
        { email, password: 'demo1234', userId: user.id },
      ],
    })),

  addLog: (log) =>
    set((state) => {
      const newNotifications = [...state.notifications]
      if (log.adaptationOccurred) {
        newNotifications.unshift({
          id: `notif-adp-${Date.now()}`,
          userId: log.teacherId,
          message: "Don't forget to document your adaptation from today's log.",
          type: 'adaptation_incomplete' as const,
          createdAt: new Date().toISOString(),
        })
      }
      return {
        implementationLogs: [log, ...state.implementationLogs],
        notifications: newNotifications,
      }
    }),

  addAdaptation: (adaptation) =>
    set((state) => ({ adaptations: [adaptation, ...state.adaptations] })),

  addFidelityCheck: (check) =>
    set((state) => ({ fidelityChecks: [check, ...state.fidelityChecks] })),

  sendMessage: (cycleId, message) =>
    set((state) => ({
      coachingCycles: state.coachingCycles.map((cycle) =>
        cycle.id === cycleId
          ? { ...cycle, messages: [...cycle.messages, message] }
          : cycle,
      ),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    })),

  completeAction: (cycleId, actionId) =>
    set((state) => ({
      coachingCycles: state.coachingCycles.map((cycle) =>
        cycle.id === cycleId
          ? {
              ...cycle,
              actions: cycle.actions.map((a) =>
                a.id === actionId ? { ...a, completedAt: new Date().toISOString() } : a,
              ),
            }
          : cycle,
      ),
    })),

  togglePermission: (role, permissionId) =>
    set((state) => ({
      rolePermissions: state.rolePermissions.map((rp) => {
        if (rp.role !== role) return rp
        const has = rp.permissionIds.includes(permissionId)
        return {
          ...rp,
          permissionIds: has
            ? rp.permissionIds.filter((id) => id !== permissionId)
            : [...rp.permissionIds, permissionId],
        }
      }),
    })),

  addOrgMember: (member) =>
    set((state) => ({ orgMembers: [...state.orgMembers, member] })),

  updateOrgMember: (id, updates) =>
    set((state) => ({
      orgMembers: state.orgMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  // Teacher submits a question → appears in coach's feedback queue + fires coach notification
  addFeedbackItem: (item) =>
    set((state) => ({
      feedbackItems: [item, ...state.feedbackItems],
      notifications: [
        {
          id: `notif-fq-${Date.now()}`,
          userId: item.coachId,
          message: `${item.teacherName} asked a coaching question.`,
          type: 'coaching_followup' as const,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),

  // Coach replies → feedback item resolved + reply appears in teacher's coaching thread
  replyToFeedback: (id, reply, senderId, attachmentName) =>
    set((state) => {
      const item = state.feedbackItems.find((f) => f.id === id)
      if (!item) return state
      const msg: CoachingMessage = {
        id: `msg-reply-${Date.now()}`,
        cycleId: item.cycleId,
        senderId,
        body: reply,
        createdAt: new Date().toISOString(),
        attachmentName,
      }
      return {
        feedbackItems: state.feedbackItems.map((f) =>
          f.id === id ? { ...f, reply, resolved: true } : f,
        ),
        coachingCycles: state.coachingCycles.map((cycle) =>
          cycle.id === item.cycleId
            ? { ...cycle, messages: [...cycle.messages, msg] }
            : cycle,
        ),
      }
    }),

  // Coach adds an action item to a specific coaching cycle
  addCycleAction: (cycleId, action) =>
    set((state) => ({
      coachingCycles: state.coachingCycles.map((cycle) =>
        cycle.id === cycleId
          ? { ...cycle, actions: [...cycle.actions, action] }
          : cycle,
      ),
    })),

  // Toggle flag on a teacher — persisted in store
  toggleFlag: (teacherId) =>
    set((state) => ({
      flaggedTeachers: state.flaggedTeachers.includes(teacherId)
        ? state.flaggedTeachers.filter((id) => id !== teacherId)
        : [...state.flaggedTeachers, teacherId],
    })),

  checkInTraining: (entry) =>
    set((state) => ({ trainingAttendances: [...state.trainingAttendances, entry] })),

  checkOutTraining: (id) =>
    set((state) => ({
      trainingAttendances: state.trainingAttendances.map((a) =>
        a.id === id ? { ...a, checkedOutAt: new Date().toISOString() } : a,
      ),
    })),

  addStudentDataRecord: (record) =>
    set((state) => {
      // Mark any pending student_data_due notification as read for this teacher
      const notifications = state.notifications.map((n) =>
        n.userId === record.teacherId && n.type === 'student_data_due' && !n.readAt
          ? { ...n, readAt: new Date().toISOString() }
          : n,
      )
      return {
        studentDataRecords: [record, ...state.studentDataRecords],
        notifications,
      }
    }),

  addPDSession: (session) =>
    set((state) => ({ pdSessions: [session, ...state.pdSessions] })),

  checkInSession: (sessionId, userId) =>
    set((state) => ({
      pdSessions: state.pdSessions.map(s =>
        s.id !== sessionId || s.checkIns.some(c => c.userId === userId)
          ? s
          : { ...s, checkIns: [...s.checkIns, { userId, checkedInAt: new Date().toISOString() }] }
      ),
    })),

  approveCheckIn: (sessionId, userId, approved) =>
    set((state) => ({
      pdSessions: state.pdSessions.map(s =>
        s.id !== sessionId ? s : {
          ...s,
          checkIns: s.checkIns.map(c => c.userId === userId ? { ...c, approved } : c),
        }
      ),
    })),

  updateDeterminant: (key, value) =>
    set((state) => ({
      determinants: { ...state.determinants, [key]: value },
    })),

  addResource: (resource) =>
    set((state) => ({ resources: [resource, ...state.resources] })),

  updateResource: (id, updates) =>
    set((state) => ({
      resources: state.resources.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  deleteResource: (id) =>
    set((state) => ({ resources: state.resources.filter((r) => r.id !== id) })),

  addLessonPlan: (plan) =>
    set((state) => ({ lessonPlans: [plan, ...state.lessonPlans] })),

  deleteLessonPlan: (id) =>
    set((state) => ({ lessonPlans: state.lessonPlans.filter((p) => p.id !== id) })),

  updateLessonPlan: (id, updates) =>
    set((state) => ({ lessonPlans: state.lessonPlans.map((p) => p.id === id ? { ...p, ...updates } : p) })),

  setPendingPlan: (plan) => set({ pendingPlan: plan }),

  awardIncentive: (data, approverId) =>
    set((state) => ({
      incentives: [
        {
          id: `inc-${Date.now()}`,
          awardedAt: new Date().toISOString().split('T')[0],
          status: approverId ? 'approved' as const : 'pending' as const,
          ...(approverId ? { approvedAt: new Date().toISOString(), approvedBy: approverId } : {}),
          ...data,
        },
        ...state.incentives,
      ],
    })),

  approveIncentive: (id, approverId) =>
    set((state) => ({
      incentives: state.incentives.map((i) =>
        i.id === id ? { ...i, status: 'approved' as const, approvedAt: new Date().toISOString(), approvedBy: approverId } : i
      ),
    })),

  rejectIncentive: (id) =>
    set((state) => ({ incentives: state.incentives.filter((i) => i.id !== id) })),

  sendDirectMessage: (conversationId, body, senderId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id !== conversationId ? c : {
          ...c,
          messages: [...c.messages, {
            id: `dm-${Date.now()}`,
            conversationId,
            senderId,
            body,
            createdAt: new Date().toISOString(),
          } satisfies DirectMessage],
        }
      ),
    })),

  startConversation: (userId1, userId2) => {
    const existing = get().conversations.find(
      (c) => c.participantIds.includes(userId1) && c.participantIds.includes(userId2)
    )
    if (existing) return existing.id
    const id = `conv-${Date.now()}`
    set((state) => ({
      conversations: [...state.conversations, {
        id, participantIds: [userId1, userId2], messages: [], createdAt: new Date().toISOString(),
      } satisfies Conversation],
    }))
    return id
  },

  markConversationRead: (conversationId, userId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id !== conversationId ? c : {
          ...c,
          messages: c.messages.map((m) =>
            m.senderId === userId || m.readAt ? m : { ...m, readAt: new Date().toISOString() }
          ),
        }
      ),
    })),

  addLogComment: (comment) =>
    set((state) => ({ logComments: [...state.logComments, comment] })),
}))
