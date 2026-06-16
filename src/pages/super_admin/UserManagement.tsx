import { useState, useMemo } from 'react'
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
  teacher: 'green', coach: 'blue', admin: 'amber', district_admin: 'red', researcher: 'purple', super_admin: 'red',
}

const DIMS = ['adherence', 'dosage', 'quality', 'responsiveness'] as const
type Dim = typeof DIMS[number]

type UserRow = { id: string; name: string; role: Role; school: string; email: string }

export function UserManagement() {
  const { currentUser, users, schools, orgMembers, implementationLogs, fidelityChecks, studentDataRecords } = useAppStore()
  const isDistrictAdmin = currentUser.role === 'district_admin'
  const [showAdd, setShowAdd] = useState(false)
  const [filterSchool, setFilterSchool] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const districtSchoolIds = useMemo(
    () => new Set(schools.filter(s => s.districtId === currentUser.districtId).map(s => s.id)),
    [schools, currentUser.districtId],
  )

  const visibleSchools = isDistrictAdmin
    ? schools.filter(s => s.districtId === currentUser.districtId)
    : schools

  const getSchoolName = (schoolId: string) => schools.find(s => s.id === schoolId)?.name ?? schoolId
  const getEmail = (userId: string) => orgMembers.find(m => m.id === userId)?.email ?? '—'

  const rows: UserRow[] = users
    .filter(u => u.role !== 'super_admin' && u.role !== 'district_admin')
    .filter(u => !isDistrictAdmin || districtSchoolIds.has(u.schoolId))
    .filter(u => !filterSchool || u.schoolId === filterSchool)
    .filter(u => !filterRole || u.role === filterRole)
    .map(u => ({ id: u.id, name: u.name, role: u.role, school: getSchoolName(u.schoolId), email: getEmail(u.id) }))

  const roleOptions: Role[] = isDistrictAdmin
    ? ['teacher', 'paraprofessional', 'coach', 'admin']
    : ['teacher', 'paraprofessional', 'coach', 'admin', 'district_admin', 'researcher']

  const userFidelity = useMemo(() => {
    if (!selectedUser) return null
    const checks = fidelityChecks.filter(c => c.teacherId === selectedUser.id)
    if (!checks.length) return null
    const n = checks.length
    const dimAvgs = { adherence: 0, dosage: 0, quality: 0, responsiveness: 0 } as Record<Dim, number>
    DIMS.forEach(d => { dimAvgs[d] = +(checks.reduce((s, c) => s + (c[d as Dim] ?? 0), 0) / n).toFixed(1) })
    const composite = +((DIMS.reduce((s, d) => s + dimAvgs[d], 0) / DIMS.length).toFixed(2))
    return { ...dimAvgs, composite, n }
  }, [selectedUser, fidelityChecks])

  const userStudentData = useMemo(() => {
    if (!selectedUser) return null
    const recs = studentDataRecords.filter(r => r.teacherId === selectedUser.id)
    if (!recs.length) return null
    const avgScore = (recs.reduce((s, r) => s + r.currentAvg, 0) / recs.length).toFixed(1)
    const avgGrowth = (recs.reduce((s, r) => s + (r.growth ?? 0), 0) / recs.length).toFixed(1)
    const atBench = Math.round(recs.reduce((s, r) => s + (r.atOrAboveBenchmark ?? 0), 0) / recs.length)
    return { avgScore, avgGrowth, atBench, count: recs.length }
  }, [selectedUser, studentDataRecords])

  const columns = [
    { key: 'name', header: 'Name', render: (row: UserRow) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: 'email', header: 'Email', className: 'hidden md:table-cell' },
    { key: 'role', header: 'Role', render: (row: UserRow) => <Badge color={roleBadgeColor[row.role] ?? 'blue'}>{roleLabels[row.role]}</Badge> },
    { key: 'school', header: 'School', className: 'hidden sm:table-cell' },
  ]

  const isTeacher = selectedUser?.role === 'teacher' || selectedUser?.role === 'paraprofessional'

  return (
    <div className="space-y-4">
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-800">Users <span className="text-gray-400 font-normal">({rows.length})</span></h2>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none">
              <option value="">All Schools</option>
              {visibleSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none">
              <option value="">All Roles</option>
              {roleOptions.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
            <Button size="sm" roleColor={roleColor} onClick={() => setShowAdd(true)}><Plus size={14} /> Add User</Button>
          </div>
        </div>
        <Table columns={columns as Parameters<typeof Table>[0]['columns']}
          data={rows as unknown as Record<string, unknown>[]}
          emptyMessage="No users found." emptyIcon={<Users size={24} />}
          onRowClick={(row) => setSelectedUser(row as unknown as UserRow)} />
      </Card>

      <AddUserModal open={showAdd} onClose={() => setShowAdd(false)} />

      {selectedUser && (
        <Modal open onClose={() => setSelectedUser(null)} title={selectedUser.name} size={isTeacher ? 'lg' : 'sm'}>
          <div className="space-y-4">
            <Badge color={roleBadgeColor[selectedUser.role] ?? 'blue'}>{roleLabels[selectedUser.role as Role]}</Badge>
            <div className="grid grid-cols-2 gap-2.5">
              {[{ label: 'ID', value: selectedUser.id }, { label: 'Email', value: selectedUser.email },
                { label: 'School', value: selectedUser.school },
                { label: 'Logs Submitted', value: implementationLogs.filter(l => l.teacherId === selectedUser.id).length || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                </div>
              ))}
            </div>
            {userFidelity && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fidelity ({userFidelity.n} checks)</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {DIMS.map(d => (
                    <div key={d} className="bg-gray-50 rounded-lg px-2 py-2 text-center">
                      <p className="text-xs font-bold text-gray-700">{userFidelity[d]}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{d.slice(0, 3)}</p>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-lg px-2 py-2 text-center">
                    <p className="text-xs font-bold" style={{ color: roleColor }}>{userFidelity.composite}</p>
                    <p className="text-[10px] text-gray-400">Avg</p>
                  </div>
                </div>
              </div>
            )}
            {userStudentData && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Students' Performance</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{ label: 'Avg Score', value: `${userStudentData.avgScore}%` },
                    { label: 'Avg Growth', value: `+${userStudentData.avgGrowth}` },
                    { label: 'At Benchmark', value: `${userStudentData.atBench}%` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg px-2 py-2 text-center">
                      <p className="text-sm font-bold text-gray-800">{value}</p>
                      <p className="text-[10px] text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
