import { create } from 'zustand'
import type {
  Role,
  User,
  ImplementationLog,
  Adaptation,
  FidelityCheck,
  CoachingCycle,
  CoachingMessage,
  TrainingSession,
  Notification,
} from '../types'
import {
  usersByRole,
  implementationLogs,
  adaptations,
  fidelityChecks,
  coachingCycles,
  trainingSessions,
  notifications,
} from '../data/mockData'

interface AppStore {
  currentRole: Role
  currentUser: User
  notifications: Notification[]
  implementationLogs: ImplementationLog[]
  adaptations: Adaptation[]
  fidelityChecks: FidelityCheck[]
  coachingCycles: CoachingCycle[]
  trainingSessions: Record<string, TrainingSession[]>

  setRole: (role: Role) => void
  addLog: (log: ImplementationLog) => void
  addAdaptation: (adaptation: Adaptation) => void
  addFidelityCheck: (check: FidelityCheck) => void
  sendMessage: (cycleId: string, message: CoachingMessage) => void
  markNotificationRead: (id: string) => void
  completeAction: (cycleId: string, actionId: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentRole: 'teacher',
  currentUser: usersByRole['teacher'],
  notifications,
  implementationLogs,
  adaptations,
  fidelityChecks,
  coachingCycles,
  trainingSessions,

  setRole: (role) =>
    set({
      currentRole: role,
      currentUser: usersByRole[role],
    }),

  addLog: (log) =>
    set((state) => ({
      implementationLogs: [log, ...state.implementationLogs],
    })),

  addAdaptation: (adaptation) =>
    set((state) => ({
      adaptations: [adaptation, ...state.adaptations],
    })),

  addFidelityCheck: (check) =>
    set((state) => ({
      fidelityChecks: [check, ...state.fidelityChecks],
    })),

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
}))
