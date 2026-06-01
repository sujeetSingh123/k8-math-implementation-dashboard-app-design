import { useState } from 'react'
import { Building2, Users, Shield, BarChart2, ClipboardList } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'

const roleColor = roleColors.super_admin

type SchoolRow = { id: string; name: string; teachers: number; coaches: number; admins: number }

export function SuperAdminDashboard() {
  const { schools, users, implementationLogs } = useAppStore()
  const navigate = useNavigate()
  const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null)

  const teachers = users.filter(u => u.role === 'teacher').length
  const coaches = users.filter(u => u.role === 'coach').length
  const researchers = users.filter(u => u.role === 'researcher').length
  const totalStaff = users.filter(u => u.role !== 'super_admin').length

  const totalLogs = implementationLogs.length
  const completionRate = totalLogs > 0 ? Math.round(implementationLogs.filter(l => l.lessonCompletion !== 'not_completed').length / totalLogs * 100) : 0
  const schoolLogData = schools.map(s => ({
    school: s.name.split(' ')[0],
    Fully: implementationLogs.filter(l => l.schoolId === s.id && l.lessonCompletion === 'fully').length,
    Partial: implementationLogs.filter(l => l.schoolId === s.id && l.lessonCompletion === 'partially').length,
    Missed: implementationLogs.filter(l => l.schoolId === s.id && l.lessonCompletion === 'not_completed').length,
  }))

  const schoolRows: SchoolRow[] = schools.map(s => ({
    id: s.id,
    name: s.name,
    teachers: users.filter(u => u.schoolId === s.id && u.role === 'teacher').length,
    coaches: users.filter(u => u.schoolId === s.id && u.role === 'coach').length,
    admins: users.filter(u => u.schoolId === s.id && u.role === 'admin').length,
  }))

  const columns = [
    { key: 'name', header: 'School', render: (row: SchoolRow) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: 'id', header: 'ID', className: 'hidden sm:table-cell' },
    { key: 'teachers', header: 'Teachers', render: (row: SchoolRow) => String(row.teachers) },
    { key: 'coaches', header: 'Coaches', render: (row: SchoolRow) => String(row.coaches) },
    { key: 'admins', header: 'Admins', render: (row: SchoolRow) => String(row.admins) },
    { key: 'status', header: 'Status', render: () => <Badge color="green">Active</Badge> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-semibold text-gray-900">District Overview</h1>
        <div className="flex gap-2">
          <Button size="sm" roleColor={roleColor} onClick={() => navigate('/super-admin/schools')}>
            <Building2 size={14} /> Manage Schools
          </Button>
          <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => navigate('/super-admin/users')}>
            <Users size={14} /> Manage Users
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Schools" value={String(schools.length)} sub="In district" icon={<Building2 size={18} />} iconColor={roleColor} />
        <StatCard label="Total Staff" value={String(totalStaff)} sub="All schools" icon={<Users size={18} />} iconColor={roleColor} />
        <StatCard label="Teachers" value={String(teachers)} sub={`${coaches} coaches`} icon={<Shield size={18} />} iconColor={roleColor} />
        <StatCard label="Researchers" value={String(researchers)} sub="In study" icon={<BarChart2 size={18} />} iconColor={roleColor} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <StatCard label="Total Logs" value={String(totalLogs)} sub="District-wide" icon={<ClipboardList size={18} />} iconColor={roleColor} />
        <StatCard label="Completion Rate" value={`${completionRate}%`} sub="Fully + partially" icon={<BarChart2 size={18} />} iconColor={roleColor} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">Log Activity by School</h2>
          <span className="text-xs text-gray-400">All-time totals</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={schoolLogData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="school" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="Fully" stackId="a" fill="#10B981" />
            <Bar dataKey="Partial" stackId="a" fill="#F59E0B" />
            <Bar dataKey="Missed" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">All Schools</h2>
          <Button size="sm" roleColor={roleColor} onClick={() => navigate('/super-admin/schools')}>
            Add School
          </Button>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={schoolRows as unknown as Record<string, unknown>[]}
          emptyMessage="No schools found."
          emptyIcon={<Building2 size={24} />}
          onRowClick={(row) => setSelectedSchool(row as unknown as SchoolRow)}
        />
      </Card>

      {selectedSchool && (
        <Modal open onClose={() => setSelectedSchool(null)} title={selectedSchool.name} size="sm">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'School ID', value: selectedSchool.id },
                { label: 'Status', value: 'Active' },
                { label: 'Teachers', value: selectedSchool.teachers },
                { label: 'Coaches', value: selectedSchool.coaches },
                { label: 'Admins', value: selectedSchool.admins },
                { label: 'Total Logs', value: implementationLogs.filter(l => l.schoolId === selectedSchool.id).length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" roleColor={roleColor} onClick={() => { navigate('/super-admin/schools'); setSelectedSchool(null) }}>
                <Building2 size={13} /> Manage School
              </Button>
              <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => { navigate('/super-admin/users'); setSelectedSchool(null) }}>
                <Users size={13} /> View Users
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
