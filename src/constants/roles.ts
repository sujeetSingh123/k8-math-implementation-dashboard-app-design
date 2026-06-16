import type { Role } from '../types'

export const roleColors: Record<Role, string> = {
  teacher: '#10B981',
  paraprofessional: '#059669',
  coach: '#3B82F6',
  admin: '#F59E0B',
  district_admin: '#EA580C',
  researcher: '#8B5CF6',
  super_admin: '#EF4444',
}

export const roleLabels: Record<Role, string> = {
  teacher: 'Teacher',
  paraprofessional: 'Paraprofessional',
  coach: 'Coach',
  admin: 'Principal of School',
  district_admin: 'Superintendent',
  researcher: 'Researcher',
  super_admin: 'Platform Admin',
}

export const sessionTypeColors: Record<'coaching' | 'lab' | 'training', string> = {
  coaching: roleColors.coach,
  lab: roleColors.researcher,
  training: roleColors.admin,
}
