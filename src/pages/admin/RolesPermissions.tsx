import { useState } from 'react'
import { Shield, Check, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { permissions } from '../../data/mockData'
import { roleColors, roleLabels } from '../../constants/roles'
import type { Role } from '../../types'

const roleDescriptions: Record<Role, string> = {
  teacher: 'Classroom teachers implementing math curricula',
  paraprofessional: 'Paraprofessionals supporting math instruction',
  coach: 'Instructional coaches supporting teachers',
  admin: 'Principal of School — school-level administrator',
  district_admin: 'Principal of District — manages all schools in their district',
  researcher: 'External researchers and data analysts',
  super_admin: 'Platform Admin — manages all districts and schools',
}

const permissionGates: Record<string, string> = {
  p_edit_logs: 'Daily Log, Adaptations',
  p_view_fidelity: 'Fidelity Check, MTSS Monitoring',
  p_respond_coaching: 'Coaching, Feedback Queue',
  p_view_student_data: 'Student Data, Longitudinal View',
  p_view_reports: 'Dashboard, School Overview, DSAII Pathway',
  p_view_users: 'My Teachers, Organization',
  p_assign_roles: 'Roles & Permissions',
  p_manage_org: 'PD Planning, Manage Resources',
  p_export_data: 'Export Data',
  p_view_logs: 'Research Analytics',
  p_create_coaching: 'Coaching Cycles',
}

const categoryLabels: Record<string, string> = {
  data: 'Data Access',
  users: 'User Management',
  coaching: 'Coaching',
  reports: 'Reports',
  organization: 'Organization',
}

const roles: Role[] = ['teacher', 'coach', 'admin', 'researcher']
const categories = ['data', 'users', 'coaching', 'reports', 'organization']

export function RolesPermissions() {
  const { rolePermissions, togglePermission } = useAppStore()
  const [activeRole, setActiveRole] = useState<Role>('teacher')

  const activeRolePerms = rolePermissions.find((rp) => rp.role === activeRole)
  const hasPermission = (permId: string) => activeRolePerms?.permissionIds.includes(permId) ?? false

  const permsByCategory = (cat: string) => permissions.filter((p) => p.category === cat)

  const permCount = (role: Role) =>
    rolePermissions.find((rp) => rp.role === role)?.permissionIds.length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Shield size={20} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Roles & Permissions</h2>
          <p className="text-sm text-gray-500">Configure what each role can access and modify</p>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
              activeRole === role ? 'border-current bg-white shadow-md' : 'border-gray-100 bg-white hover:border-gray-300'
            }`}
            style={activeRole === role ? { borderColor: roleColors[role] } : {}}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-sm font-bold"
                style={{ color: activeRole === role ? roleColors[role] : '#374151' }}
              >
                {roleLabels[role]}
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: roleColors[role] }}
              >
                {permCount(role)}/{permissions.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-snug">{roleDescriptions[role]}</p>
          </button>
        ))}
      </div>

      {/* Permissions Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: roleColors[activeRole] }}
            >
              {roleLabels[activeRole][0]}
            </div>
            <span className="font-semibold text-gray-800">{roleLabels[activeRole]} Permissions</span>
          </div>
          <span className="text-sm text-gray-400">
            {permCount(activeRole)} of {permissions.length} enabled
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {categories.map((cat) => (
            <div key={cat} className="px-6 py-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {categoryLabels[cat]}
              </p>
              <div className="space-y-2">
                {permsByCategory(cat).map((perm) => {
                  const enabled = hasPermission(perm.id)
                  const isAdminRole = activeRole === 'admin'
                  return (
                    <div
                      key={perm.id}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        enabled ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-medium text-gray-800">{perm.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{perm.description}</p>
                        {permissionGates[perm.id] && (
                          <p className="text-xs mt-1">
                            <span className="text-gray-400">Gates: </span>
                            <span className="text-gray-500 font-medium">{permissionGates[perm.id]}</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => !isAdminRole && togglePermission(activeRole, perm.id)}
                        disabled={isAdminRole}
                        title={isAdminRole ? 'Admins always have all permissions' : undefined}
                        className={`flex-shrink-0 w-10 h-6 rounded-full transition-all relative cursor-pointer disabled:cursor-not-allowed ${
                          enabled ? 'bg-green-500' : 'bg-gray-200'
                        } ${isAdminRole ? 'opacity-60' : ''}`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            enabled ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={10} className="text-white" />
          </span>
          Permission enabled
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
            <X size={10} className="text-gray-400" />
          </span>
          Permission disabled
        </span>
      </div>
    </div>
  )
}
