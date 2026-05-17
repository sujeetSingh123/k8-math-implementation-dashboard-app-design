import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  add: (message: string, type?: ToastType) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = 'success') =>
    set(s => ({ toasts: [...s.toasts, { id: `t-${Date.now()}-${Math.random()}`, message, type }] })),
  remove: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

export const toast = {
  success: (msg: string) => useToastStore.getState().add(msg, 'success'),
  error:   (msg: string) => useToastStore.getState().add(msg, 'error'),
  info:    (msg: string) => useToastStore.getState().add(msg, 'info'),
  warning: (msg: string) => useToastStore.getState().add(msg, 'warning'),
}
