import type { Role } from '../types'

export const roleColors: Record<Role, string> = {
  teacher: '#10B981',
  coach: '#3B82F6',
  admin: '#F59E0B',
  researcher: '#8B5CF6',
  super_admin: '#EF4444',
}

export const roleLabels: Record<Role, string> = {
  teacher: 'Teacher',
  coach: 'Coach',
  admin: 'Administrator',
  researcher: 'Researcher',
  super_admin: 'Super Admin',
}

export const sessionTypeColors: Record<'coaching' | 'lab' | 'training', string> = {
  coaching: roleColors.coach,
  lab: roleColors.researcher,
  training: roleColors.admin,
}
