import { useState } from 'react'
import { Users, Search, UserCheck, UserX, Mail, MoreVertical } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { schools } from '../../data/mockData'
import { roleColors, roleLabels } from '../../constants/roles'
import type { Role } from '../../types'

const roleColor = roleColors.admin
const ALLOWED_ROLES: Role[] = ['teacher', 'paraprofessional', 'coach']

const statusColors = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-100 text-amber-700',
}

export function Organization() {
  const { currentUser, orgMembers, updateOrgMember } = useAppStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const schoolName = schools.find(s => s.id === currentUser.schoolId)?.name ?? currentUser.schoolId

  const filtered = orgMembers.filter(m =>
    m.schoolId === currentUser.schoolId &&
    ALLOWED_ROLES.includes(m.role) &&
    (roleFilter === 'all' || m.role === roleFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${roleColor}20` }}>
          <Users size={18} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">School Users</h2>
          <p className="text-xs text-gray-500">{schoolName} · Teachers, Paraprofessionals &amp; Coaches</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as Role | 'all')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-amber-400"
        >
          <option value="all">All Roles</option>
          {ALLOWED_ROLES.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Department</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(member => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: roleColors[member.role] }}>
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 truncate"><Mail size={10} />{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">{member.department ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: roleColors[member.role] }}>
                    {roleLabels[member.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[member.status]}`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3 relative">
                  <button onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
                    <MoreVertical size={14} />
                  </button>
                  {openMenu === member.id && (
                    <div className="absolute right-4 top-10 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      <button
                        onClick={() => { updateOrgMember(member.id, { status: member.status === 'active' ? 'inactive' : 'active' }); setOpenMenu(null) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                        {member.status === 'active'
                          ? <><UserX size={13} className="text-red-400" />Deactivate</>
                          : <><UserCheck size={13} className="text-green-500" />Activate</>
                        }
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} member{filtered.length !== 1 ? 's' : ''} · {schoolName}</p>
    </div>
  )
}
