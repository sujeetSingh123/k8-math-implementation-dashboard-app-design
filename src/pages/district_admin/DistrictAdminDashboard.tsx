import { useMemo } from 'react'
import { Building2, Users, ClipboardList, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.district_admin

type SchoolRow = {
  id: string; name: string; teachers: number; coaches: number
  logCount: number; fidelity: number | null; completionRate: number
}

function fidColor(f: number) {
  return f >= 80 ? '#10B981' : f >= 60 ? '#F59E0B' : '#EF4444'
}

export function DistrictAdminDashboard() {
  const { currentUser, districts, schools, users, implementationLogs, fidelityChecks } = useAppStore()
  const navigate = useNavigate()

  const myDistrict = districts.find(d => d.id === currentUser.districtId)
  const mySchools = useMemo(() => schools.filter(s => s.districtId === currentUser.districtId), [schools, currentUser.districtId])
  const mySchoolIds = useMemo(() => new Set(mySchools.map(s => s.id)), [mySchools])

  const myTeachers = useMemo(() => users.filter(u => mySchoolIds.has(u.schoolId) && u.role === 'teacher'), [users, mySchoolIds])
  const myCoaches = useMemo(() => users.filter(u => mySchoolIds.has(u.schoolId) && u.role === 'coach'), [users, mySchoolIds])
  const myLogs = useMemo(() => implementationLogs.filter(l => mySchoolIds.has(l.schoolId)), [implementationLogs, mySchoolIds])
  const myChecks = useMemo(() => fidelityChecks.filter(c => myTeachers.some(t => t.id === c.teacherId)), [fidelityChecks, myTeachers])

  const avgFidelity = myChecks.length
    ? Math.round(myChecks.reduce((s, c) => s + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / myChecks.length * 20)
    : null
  const completionRate = myLogs.length
    ? Math.round(myLogs.filter(l => l.lessonCompletion !== 'not_completed').length / myLogs.length * 100)
    : 0

  const schoolRows: SchoolRow[] = mySchools.map(s => {
    const st = myTeachers.filter(t => t.schoolId === s.id)
    const sl = myLogs.filter(l => l.schoolId === s.id)
    const sc = myChecks.filter(c => st.some(t => t.id === c.teacherId))
    const fid = sc.length
      ? Math.round(sc.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / sc.length * 20)
      : null
    return {
      id: s.id, name: s.name,
      teachers: st.length,
      coaches: users.filter(u => u.schoolId === s.id && u.role === 'coach').length,
      logCount: sl.length,
      fidelity: fid,
      completionRate: sl.length ? Math.round(sl.filter(l => l.lessonCompletion !== 'not_completed').length / sl.length * 100) : 0,
    }
  })

  const logChartData = mySchools.map(s => {
    const sl = myLogs.filter(l => l.schoolId === s.id)
    return {
      school: s.name.split(' ')[0],
      Fully: sl.filter(l => l.lessonCompletion === 'fully').length,
      Partial: sl.filter(l => l.lessonCompletion === 'partially').length,
      Missed: sl.filter(l => l.lessonCompletion === 'not_completed').length,
    }
  })

  const columns = [
    { key: 'name', header: 'School', render: (row: SchoolRow) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: 'teachers', header: 'Teachers', render: (row: SchoolRow) => String(row.teachers) },
    { key: 'coaches', header: 'Coaches', render: (row: SchoolRow) => String(row.coaches) },
    { key: 'logCount', header: 'Logs', render: (row: SchoolRow) => String(row.logCount) },
    { key: 'fidelity', header: 'Avg Fidelity', render: (row: SchoolRow) => row.fidelity !== null
      ? <span className="font-semibold" style={{ color: fidColor(row.fidelity) }}>{row.fidelity}%</span>
      : <span className="text-gray-400">—</span>
    },
    { key: 'completionRate', header: 'Completion', render: (row: SchoolRow) => (
      <Badge color={row.completionRate >= 80 ? 'green' : row.completionRate >= 60 ? 'amber' : 'red'}>{row.completionRate}%</Badge>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
            <Building2 size={20} style={{ color: roleColor }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{myDistrict?.name ?? 'District Overview'}</h2>
            <p className="text-sm text-gray-500">Principal of District · {mySchools.length} schools</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" roleColor={roleColor} onClick={() => navigate('/district-admin/schools')}>
            <Building2 size={14} /> Schools
          </Button>
          <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => navigate('/district-admin/users')}>
            <Users size={14} /> Users
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Schools" value={String(mySchools.length)} sub={myDistrict?.name ?? ''} icon={<Building2 size={18} />} iconColor={roleColor} />
        <StatCard label="Teachers" value={String(myTeachers.length)} sub={`${myCoaches.length} coaches`} icon={<Users size={18} />} iconColor={roleColor} />
        <StatCard label="Total Logs" value={String(myLogs.length)} sub={`${completionRate}% completion`} icon={<ClipboardList size={18} />} iconColor={roleColor} />
        <StatCard label="Avg Fidelity" value={avgFidelity !== null ? `${avgFidelity}%` : '—'} sub="All schools" icon={<TrendingUp size={18} />} iconColor={roleColor} />
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Log Activity by School</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={logChartData}>
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
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Schools in District</h3>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={schoolRows as unknown as Record<string, unknown>[]}
          emptyMessage="No schools in this district."
        />
      </Card>
    </div>
  )
}
