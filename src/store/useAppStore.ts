import { create } from 'zustand'
import type {
  Role,
  User,
  ImplementationLog,
  Adaptation,
  FidelityCheck,
  CoachingCycle,
  CoachingMessage,
  CoachingAction,
  FeedbackItem,
  TrainingSession,
  TrainingAttendance,
  Notification,
  StudentDataRecord,
  PDSession,
  RolePermissions,
  OrgMember,
} from '../types'
import {
  users,
  implementationLogs,
  adaptations,
  fidelityChecks,
  coachingCycles,
  feedbackItems,
  trainingSessions,
  trainingAttendances,
  notifications,
  mockCredentials,
  rolePermissions,
  orgMembers,
  studentDataRecords,
  pdSessions,
} from '../data/mockData'

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
  notifications: Notification[]
  implementationLogs: ImplementationLog[]
  adaptations: Adaptation[]
  fidelityChecks: FidelityCheck[]
  coachingCycles: CoachingCycle[]
  feedbackItems: FeedbackItem[]
  flaggedTeachers: string[]
  trainingSessions: Record<string, TrainingSession[]>
  trainingAttendances: TrainingAttendance[]
  rolePermissions: RolePermissions[]
  orgMembers: OrgMember[]
  studentDataRecords: StudentDataRecord[]
  pdSessions: PDSession[]
  determinants: Record<string, number>

  login: (email: string, password: string) => boolean
  logout: () => void
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
  updateDeterminant: (key: string, value: number) => void
}

const defaultUser = users[0]

export const useAppStore = create<AppStore>((set) => ({
  isAuthenticated: false,
  currentRole: 'teacher',
  currentUser: defaultUser,
  notifications,
  implementationLogs,
  adaptations,
  fidelityChecks,
  coachingCycles,
  feedbackItems,
  flaggedTeachers: [],
  trainingSessions,
  trainingAttendances,
  rolePermissions,
  orgMembers,
  studentDataRecords,
  pdSessions,
  determinants: defaultDeterminants,

  login: (email, password) => {
    const cred = mockCredentials.find(
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

  updateDeterminant: (key, value) =>
    set((state) => ({
      determinants: { ...state.determinants, [key]: value },
    })),
}))
