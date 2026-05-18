import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, Users, Plus, Search, MoreVertical, UserCheck, UserX, Mail } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { schools } from '../../data/mockData'
import type { OrgMember, Role } from '../../types'

const roleColors: Record<Role, string> = {
  teacher: '#10B981',
  coach: '#3B82F6',
  admin: '#F59E0B',
  researcher: '#8B5CF6',
}

const roleLabels: Record<Role, string> = {
  teacher: 'Teacher',
  coach: 'Coach',
  admin: 'Admin',
  researcher: 'Researcher',
}

const statusColors = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-100 text-amber-700',
}

type AddMemberForm = {
  name: string
  email: string
  role: Role
  schoolId: string
  department: string
}

type Tab = 'members' | 'structure'

function AddMemberModal({ onClose }: { onClose: () => void }) {
  const addOrgMember = useAppStore((s) => s.addOrgMember)
  const { register, handleSubmit, formState: { errors } } = useForm<AddMemberForm>({
    defaultValues: { role: 'teacher', schoolId: 'sch1' },
  })

  const onSubmit = (data: AddMemberForm) => {
    const initials = data.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    const member: OrgMember = {
      id: `m${Date.now()}`,
      name: data.name,
      email: data.email,
      initials,
      role: data.role,
      schoolId: data.schoolId,
      department: data.department || undefined,
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0],
    }
    addOrgMember(member)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-base font-bold text-gray-900 mb-5">Add New Member</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Jane Smith"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="jane@district.edu"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                {...register('role')}
              >
                <option value="teacher">Teacher</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
                <option value="researcher">Researcher</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                {...register('schoolId')}
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department / Grade <span className="text-gray-400">(optional)</span></label>
            <input
              type="text"
              placeholder="Grade 3, Special Education…"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              {...register('department')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MembersTab() {
  const { orgMembers, updateOrgMember } = useAppStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = orgMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    return matchesSearch && matchesRole
  })

  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
          className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        >
          <option value="all">All Roles</option>
          <option value="teacher">Teachers</option>
          <option value="coach">Coaches</option>
          <option value="admin">Admins</option>
          <option value="researcher">Researchers</option>
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors flex-shrink-0"
        >
          <Plus size={15} />
          Add Member
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">School</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: roleColors[member.role] }}
                      >
                        {member.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{member.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                          <Mail size={11} />{member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">
                    {schoolName(member.schoolId)}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                    {member.department ?? '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: roleColors[member.role] }}
                    >
                      {roleLabels[member.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[member.status]}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {openMenu === member.id && (
                      <div className="absolute right-4 top-10 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                        <button
                          onClick={() => {
                            updateOrgMember(member.id, { status: member.status === 'active' ? 'inactive' : 'active' })
                            setOpenMenu(null)
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                        >
                          {member.status === 'active'
                            ? <><UserX size={14} className="text-red-400" />Deactivate</>
                            : <><UserCheck size={14} className="text-green-500" />Activate</>
                          }
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No members match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} of {orgMembers.length} members
      </p>

      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

function StructureTab() {
  const { orgMembers } = useAppStore()

  const schoolStats = schools.map((school) => {
    const members = orgMembers.filter((m) => m.schoolId === school.id && m.status === 'active')
    const byRole = {
      teacher: members.filter((m) => m.role === 'teacher'),
      coach: members.filter((m) => m.role === 'coach'),
      admin: members.filter((m) => m.role === 'admin'),
      researcher: members.filter((m) => m.role === 'researcher'),
    }
    return { school, members, byRole }
  })

  return (
    <div className="space-y-4">
      {/* District Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Building2 size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">District 1</p>
            <p className="text-xs text-gray-400">
              {orgMembers.filter((m) => m.status === 'active').length} active members across {schools.length} schools
            </p>
          </div>
        </div>

        {/* Schools */}
        <div className="grid gap-4 lg:grid-cols-3">
          {schoolStats.map(({ school, byRole }) => (
            <div key={school.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                  <Building2 size={13} className="text-gray-500" />
                </div>
                <p className="font-semibold text-sm text-gray-800">{school.name}</p>
              </div>

              <div className="space-y-2">
                {(Object.entries(byRole) as [Role, OrgMember[]][])
                  .filter(([, members]) => members.length > 0)
                  .map(([role, members]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: roleColors[role] }}
                        />
                        <span className="text-xs text-gray-600">{roleLabels[role]}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {members.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center -ml-1 first:ml-0 border border-white"
                            style={{ backgroundColor: roleColors[role] }}
                            title={m.name}
                          >
                            {m.initials[0]}
                          </div>
                        ))}
                        {members.length > 3 && (
                          <span className="text-xs text-gray-400 ml-1">+{members.length - 3}</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(['teacher', 'coach', 'admin', 'researcher'] as Role[]).map((role) => {
          const count = orgMembers.filter((m) => m.role === role && m.status === 'active').length
          return (
            <div key={role} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${roleColors[role]}20` }}
              >
                <Users size={16} style={{ color: roleColors[role] }} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-400">{roleLabels[role]}s</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Organization() {
  const [tab, setTab] = useState<Tab>('members')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Users size={20} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Organization</h2>
          <p className="text-sm text-gray-500">Manage members, roles, and school structure</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['members', 'structure'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer capitalize ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'members' ? 'Members' : 'Org Structure'}
          </button>
        ))}
      </div>

      {tab === 'members' ? <MembersTab /> : <StructureTab />}
    </div>
  )
}
