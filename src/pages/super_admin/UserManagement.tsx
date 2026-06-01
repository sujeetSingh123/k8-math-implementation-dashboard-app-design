import { useState } from 'react'
import { Users, Plus } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { roleColors, roleLabels } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import { AddUserModal } from './AddUserModal'
import type { Role } from '../../types'

const roleColor = roleColors.super_admin

const roleBadgeColor: Record<string, 'green' | 'blue' | 'amber' | 'purple' | 'red'> = {
  teacher: 'green',
  coach: 'blue',
  admin: 'amber',
  researcher: 'purple',
  super_admin: 'red',
}

type UserRow = { id: string; name: string; role: Role; school: string; email: string }

export function UserManagement() {
  const { users, schools, orgMembers, implementationLogs } = useAppStore()
  const [showAdd, setShowAdd] = useState(false)
  const [filterSchool, setFilterSchool] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  const getSchoolName = (schoolId: string) => schools.find(s => s.id === schoolId)?.name ?? schoolId
  const getEmail = (userId: string) => orgMembers.find(m => m.id === userId)?.email ?? '—'

  const rows: UserRow[] = users
    .filter(u => u.role !== 'super_admin')
    .filter(u => !filterSchool || u.schoolId === filterSchool)
    .filter(u => !filterRole || u.role === filterRole)
    .map(u => ({ id: u.id, name: u.name, role: u.role, school: getSchoolName(u.schoolId), email: getEmail(u.id) }))

  const roleOptions: Role[] = ['teacher', 'coach', 'admin', 'researcher']

  const columns = [
    { key: 'name', header: 'Name', render: (row: UserRow) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: 'email', header: 'Email', className: 'hidden md:table-cell' },
    { key: 'role', header: 'Role', render: (row: UserRow) => (
      <Badge color={roleBadgeColor[row.role] ?? 'blue'}>{roleLabels[row.role]}</Badge>
    )},
    { key: 'school', header: 'School', className: 'hidden sm:table-cell' },
  ]

  return (
    <div className="space-y-4">
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Users <span className="text-gray-400 font-normal">({rows.length})</span>
          </h2>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <select
              value={filterSchool}
              onChange={e => setFilterSchool(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none"
            >
              <option value="">All Schools</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none"
            >
              <option value="">All Roles</option>
              {roleOptions.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
            <Button size="sm" roleColor={roleColor} onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add User
            </Button>
          </div>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={rows as unknown as Record<string, unknown>[]}
          emptyMessage="No users found."
          emptyIcon={<Users size={24} />}
          onRowClick={(row) => setSelectedUser(row as unknown as UserRow)}
        />
      </Card>

      <AddUserModal open={showAdd} onClose={() => setShowAdd(false)} />

      {selectedUser && (
        <Modal open onClose={() => setSelectedUser(null)} title={selectedUser.name} size="sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge color={roleBadgeColor[selectedUser.role] ?? 'blue'}>{roleLabels[selectedUser.role as Role]}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'ID', value: selectedUser.id },
                { label: 'Email', value: selectedUser.email },
                { label: 'School', value: selectedUser.school },
                { label: 'Role', value: roleLabels[selectedUser.role as Role] },
                { label: 'Logs Submitted', value: implementationLogs.filter(l => l.teacherId === selectedUser.id).length || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
