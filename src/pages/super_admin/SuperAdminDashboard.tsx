import { Building2, Users, Shield, BarChart2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'

const roleColor = roleColors.super_admin

type SchoolRow = { id: string; name: string; teachers: number; coaches: number; admins: number }

export function SuperAdminDashboard() {
  const { schools, users } = useAppStore()
  const navigate = useNavigate()

  const teachers = users.filter(u => u.role === 'teacher').length
  const coaches = users.filter(u => u.role === 'coach').length
  const researchers = users.filter(u => u.role === 'researcher').length
  const totalStaff = users.filter(u => u.role !== 'super_admin').length

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
        />
      </Card>
    </div>
  )
}
