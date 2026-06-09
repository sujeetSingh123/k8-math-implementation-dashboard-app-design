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
import { TimePeriodSelector, type TimePeriod } from '../../components/ui/TimePeriodSelector'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import { getTimeBuckets, inBucket } from '../../utils/timePeriod'
import { schoolFidelityTrends, incentives, studentDataRecords } from '../../data/mockData'

const roleColor = roleColors.super_admin

const dims = ['adherence', 'dosage', 'quality', 'responsiveness', 'confidence'] as const
type Dim = typeof dims[number]
type TrendRow = Record<Dim, number>

function composite(row: TrendRow) {
  return +(dims.reduce((s, d) => s + row[d], 0) / dims.length).toFixed(2)
}

function barColor(score: number) {
  if (score >= 4.0) return '#10B981'
  if (score >= 3.5) return '#F59E0B'
  return '#EF4444'
}

type SchoolRow = { id: string; name: string; teachers: number; coaches: number; admins: number }

// ── Sub-components ─────────────────────────────────────────────────────────────

const schoolNames: Record<string, string> = {
  SCH01: 'Lincoln K-8', SCH02: 'Washington Middle', SCH03: 'Roosevelt Elem', SCH04: 'Jefferson K-8',
}

function FidelitySection() {
  const entries = Object.entries(schoolFidelityTrends).map(([id, trend]) => {
    const last = trend[8] as TrendRow
    const score = composite(last)
    return { id, name: schoolNames[id] ?? id, score, last }
  })

  return (
    <Card title="Fidelity Performance by School">
      <div className="space-y-4">
        {entries.map(({ id, name, score, last }) => (
          <div key={id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{name}</span>
              <span className="text-sm font-bold" style={{ color: barColor(score) }}>{score.toFixed(2)}/5</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{ width: `${(score / 5) * 100}%`, backgroundColor: barColor(score) }}
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              {dims.map(d => (
                <span key={d} className="text-xs text-gray-400">
                  {d.slice(0, 3).toUpperCase()}: <span className="font-medium text-gray-600">{last[d].toFixed(1)}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function IncentivesSection() {
  const schoolIds = ['SCH01', 'SCH02', 'SCH03', 'SCH04']

  const rows = schoolIds.map(schoolId => {
    const schoolName = schoolNames[schoolId] ?? schoolId
    // Teachers in this school (from incentives data — SCH03/SCH04 have no teachers in mock but include for completeness)
    const schoolIncentives = incentives.filter(inc => {
      // Map recipients to schools via their ids: T001/T002/T003 → SCH01, T004/T005 → SCH02, C001 → SCH01
      const teacherSchool: Record<string, string> = {
        T001: 'SCH01', T002: 'SCH01', T003: 'SCH01',
        T004: 'SCH02', T005: 'SCH02',
        C001: 'SCH01',
      }
      return teacherSchool[inc.recipientId] === schoolId
    })
    const approved = schoolIncentives.filter(i => i.status === 'approved').reduce((s, i) => s + i.amount, 0)
    const pending = schoolIncentives.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
    const teacherCount = [...new Set(schoolIncentives.filter(i => i.recipientRole === 'teacher').map(i => i.recipientId))].length
    return { schoolId, schoolName, teacherCount, approved, pending }
  })

  const totalApproved = rows.reduce((s, r) => s + r.approved, 0)
  const totalPending = rows.reduce((s, r) => s + r.pending, 0)

  return (
    <Card title="Incentives Overview">
      <div className="flex gap-6 mb-4 flex-wrap">
        <div className="bg-emerald-50 rounded-lg px-4 py-2">
          <p className="text-xs text-gray-400">Total Awarded</p>
          <p className="text-base font-bold text-emerald-700">${totalApproved.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-lg px-4 py-2">
          <p className="text-xs text-gray-400">Pending Approval</p>
          <p className="text-base font-bold text-amber-700">${totalPending.toLocaleString()}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">School</th>
              <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Teachers</th>
              <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Total Awarded</th>
              <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Pending</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(r => (
              <tr key={r.schoolId} className="hover:bg-gray-50">
                <td className="py-2.5 font-medium text-gray-800">{r.schoolName}</td>
                <td className="py-2.5 text-center text-gray-600">{r.teacherCount}</td>
                <td className="py-2.5 text-center font-semibold text-emerald-700">
                  {r.approved > 0 ? `$${r.approved.toLocaleString()}` : '—'}
                </td>
                <td className="py-2.5 text-center font-semibold text-amber-600">
                  {r.pending > 0 ? `$${r.pending.toLocaleString()}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function StudentsSection() {
  const schoolIds = ['SCH01', 'SCH02', 'SCH03', 'SCH04']
  const rows = schoolIds.map(id => {
    const recs = studentDataRecords.filter(r => r.schoolId === id)
    if (!recs.length) return { id, name: schoolNames[id] ?? id, avgScore: '—', avgGrowth: '—', atBench: '—', count: 0 }
    const avgScore = (recs.reduce((s, r) => s + r.currentAvg, 0) / recs.length).toFixed(1)
    const avgGrowth = (recs.reduce((s, r) => s + (r.growth ?? 0), 0) / recs.length).toFixed(1)
    const atBench = Math.round(recs.reduce((s, r) => s + r.atOrAboveBenchmark, 0) / recs.length)
    return { id, name: schoolNames[id] ?? id, avgScore, avgGrowth, atBench: `${atBench}%`, count: recs.length }
  })
  return (
    <Card title="Students' Performance by School">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
              <th className="text-left py-2 pr-3 font-semibold">School</th>
              <th className="text-center py-2 px-2 font-semibold">Avg Score %</th>
              <th className="text-center py-2 px-2 font-semibold">Avg Growth</th>
              <th className="text-center py-2 px-2 font-semibold">At Benchmark</th>
              <th className="text-center py-2 pl-2 font-semibold">Records</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="py-2.5 pr-3 font-medium text-gray-800">{r.name}</td>
                <td className="py-2.5 px-2 text-center text-gray-600">{r.avgScore}</td>
                <td className="py-2.5 px-2 text-center text-emerald-600 font-medium">
                  {r.avgGrowth !== '—' ? `+${r.avgGrowth}` : '—'}
                </td>
                <td className="py-2.5 px-2 text-center font-semibold" style={{ color: r.atBench !== '—' ? roleColor : undefined }}>{r.atBench}</td>
                <td className="py-2.5 pl-2 text-center text-gray-400">{r.count || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SuperAdminDashboard() {
  const { schools, users, implementationLogs } = useAppStore()
  const navigate = useNavigate()
  const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null)
  const [period, setPeriod] = useState<TimePeriod>('week')

  const teachers = users.filter(u => u.role === 'teacher').length
  const coaches = users.filter(u => u.role === 'coach').length
  const researchers = users.filter(u => u.role === 'researcher').length
  const totalStaff = users.filter(u => u.role !== 'super_admin').length

  const totalLogs = implementationLogs.length
  const completionRate = totalLogs > 0 ? Math.round(implementationLogs.filter(l => l.lessonCompletion !== 'not_completed').length / totalLogs * 100) : 0

  const buckets = getTimeBuckets(period)
  const schoolLogData = schools.map(s => {
    const filtered = implementationLogs.filter(l => l.schoolId === s.id && buckets.some(b => inBucket(l.date, b)))
    return {
      school: s.name.split(' ')[0],
      Fully: filtered.filter(l => l.lessonCompletion === 'fully').length,
      Partial: filtered.filter(l => l.lessonCompletion === 'partially').length,
      Missed: filtered.filter(l => l.lessonCompletion === 'not_completed').length,
    }
  })

  const schoolRows: SchoolRow[] = schools.map(s => ({
    id: s.id, name: s.name,
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
          <TimePeriodSelector value={period} onChange={setPeriod} />
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

      <FidelitySection />

      <StudentsSection />

      <IncentivesSection />

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
