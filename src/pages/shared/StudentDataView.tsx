import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, BarChart2, Plus, CheckCircle, AlertCircle, Users } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { users } from '../../data/mockData'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { roleColors } from '../../constants/roles'
import { StudentDataUploadModal } from '../teacher/StudentDataUploadModal'
import type { StudentDataRecord } from '../../types'

const tierBadge: Record<string, 'blue' | 'green' | 'purple' | 'red'> = {
  'Tier 1': 'green', 'Tier 2': 'blue', 'Tier 3': 'purple', 'Special Education': 'red',
}
const statusColor = (s?: string) =>
  s === 'Verified' ? 'green' : s === 'Submitted' ? 'blue' : 'amber'

const tierLineColors: Record<string, string> = {
  'Tier 1': '#10B981', 'Tier 2': '#3B82F6', 'Tier 3': '#8B5CF6', 'Special Education': '#EF4444',
}
const tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Special Education'] as const

function RecordDetailModal({ record, teacherName, onClose }: { record: StudentDataRecord; teacherName?: string; onClose: () => void }) {
  const stat = (label: string, value?: number | string | boolean | null) => {
    if (value == null) return null
    const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
    return (
      <div className="bg-gray-50 rounded-lg px-3 py-2">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{display}</p>
      </div>
    )
  }
  return (
    <Modal open onClose={onClose} title={record.measureType} size="lg">
      <div className="space-y-4">
        {teacherName && (
          <p className="text-xs text-gray-500 font-medium">Teacher: <span className="text-gray-800">{teacherName}</span></p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge color={tierBadge[record.mtssTier] ?? 'blue'}>{record.mtssTier}</Badge>
          {record.instructionalSetting && <Badge color="blue">{record.instructionalSetting}</Badge>}
          {record.uploadStatus && <Badge color={statusColor(record.uploadStatus)}>{record.uploadStatus}</Badge>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {stat('Date', record.date)}
          {stat('Week', record.week)}
          {stat('Grade', record.grade)}
          {stat('Students', record.studentsCount)}
          {stat('Data Source', record.dataSource)}
          {stat('Research ID', record.researchExportId)}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Performance</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {stat('Baseline Avg', record.baselineAvg != null ? `${record.baselineAvg}%` : null)}
            {stat('Current Avg', `${record.currentAvg}%`)}
            {stat('Growth', record.growth != null ? `${record.growth >= 0 ? '+' : ''}${record.growth}%` : null)}
            {stat('Median', record.medianPct != null ? `${record.medianPct}%` : null)}
            {stat('At/Above Benchmark', record.atOrAboveBenchmark != null ? `${record.atOrAboveBenchmark}%` : null)}
            {stat('Below Benchmark', record.belowBenchmark != null ? `${record.belowBenchmark}%` : null)}
            {stat('Goal', record.goalPct != null ? `${record.goalPct}%` : null)}
            {stat('Met Goal', record.metGoal)}
            {stat('Intervention Group', record.interventionGroupAvg != null ? `${record.interventionGroupAvg}%` : null)}
            {stat('Comparison Group', record.comparisonGroupAvg != null ? `${record.comparisonGroupAvg}%` : null)}
          </div>
        </div>
        {record.notes && (
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400 mb-0.5">Notes</p>
            <p className="text-sm text-gray-600">{record.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export function StudentDataView() {
  const { currentUser, studentDataRecords, schools } = useAppStore()
  const role = currentUser.role
  const roleColor = roleColors[role]
  const canUpload = role === 'teacher'

  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<StudentDataRecord | null>(null)
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all')
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all')

  // Determine which teachers and records are in scope for this role
  const scopedTeachers = useMemo(() => {
    if (role === 'teacher') return users.filter(u => u.id === currentUser.id)
    if (role === 'coach') return users.filter(u => u.role === 'teacher' && u.coachId === currentUser.id)
    if (role === 'admin') return users.filter(u => u.role === 'teacher' && u.schoolId === currentUser.schoolId)
    return users.filter(u => u.role === 'teacher') // researcher / super_admin
  }, [role, currentUser])

  const scopedSchools = useMemo(() => {
    if (role === 'admin') return schools.filter(s => s.id === currentUser.schoolId)
    if (role === 'researcher' || role === 'super_admin') return schools
    return []
  }, [role, currentUser, schools])

  const teacherById = useMemo(
    () => Object.fromEntries(scopedTeachers.map(t => [t.id, t.name])),
    [scopedTeachers],
  )

  const scopedRecords = useMemo(() =>
    studentDataRecords
      .filter(r => scopedTeachers.some(t => t.id === r.teacherId))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [studentDataRecords, scopedTeachers],
  )

  // Apply filters
  const filtered = useMemo(() => {
    let recs = scopedRecords
    if (selectedSchoolId !== 'all') {
      const schoolTeacherIds = new Set(scopedTeachers.filter(t => t.schoolId === selectedSchoolId).map(t => t.id))
      recs = recs.filter(r => schoolTeacherIds.has(r.teacherId))
    }
    if (selectedTeacherId !== 'all') recs = recs.filter(r => r.teacherId === selectedTeacherId)
    if (tierFilter !== 'all') recs = recs.filter(r => r.mtssTier === tierFilter)
    return recs
  }, [scopedRecords, selectedSchoolId, selectedTeacherId, tierFilter, scopedTeachers])

  // Stats
  const latest = filtered.length > 0 ? filtered[filtered.length - 1] : null
  const prev = filtered.length > 1 ? filtered[filtered.length - 2] : null
  const trend = latest && prev ? latest.currentAvg - prev.currentAvg : null
  const avgGrowth = filtered.length > 0
    ? +(filtered.reduce((s, r) => s + (r.growth ?? 0), 0) / filtered.length).toFixed(1)
    : 0
  const goalsMet = filtered.filter(r => r.metGoal).length

  // Chart — avg current score per tier over time
  const chartData = useMemo(() => {
    const byDate: Record<string, Record<string, number>> = {}
    filtered.forEach(r => {
      const label = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!byDate[label]) byDate[label] = {}
      byDate[label][r.mtssTier] = r.currentAvg
    })
    return Object.values(byDate)
  }, [filtered])

  // Cross-teacher comparison (for coach/admin/researcher)
  const teacherSummary = useMemo(() => {
    if (role === 'teacher') return []
    const teachersToShow = selectedTeacherId !== 'all'
      ? scopedTeachers.filter(t => t.id === selectedTeacherId)
      : scopedTeachers
    return teachersToShow.map(t => {
      const recs = scopedRecords.filter(r => r.teacherId === t.id)
      const avgGrowthT = recs.length ? +(recs.reduce((s, r) => s + (r.growth ?? 0), 0) / recs.length).toFixed(1) : 0
      const latestT = recs.length > 0 ? recs[recs.length - 1] : null
      const goalsMet = recs.filter(r => r.metGoal).length
      return {
        id: t.id, name: t.name.split(' ')[0], fullName: t.name,
        records: recs.length,
        avgGrowth: avgGrowthT,
        currentAvg: latestT?.currentAvg ?? 0,
        goalsMet,
      }
    }).filter(t => t.records > 0)
  }, [role, scopedTeachers, scopedRecords, selectedTeacherId])

  const recent = [...filtered].reverse().slice(0, 12)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">Student Data</h1>
        {canUpload && (
          <Button roleColor={roleColor} size="sm" onClick={() => setUploadOpen(true)}>
            <Plus size={14} />Upload Data
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* School filter (researcher/super_admin) */}
        {scopedSchools.length > 1 && (
          <select
            value={selectedSchoolId}
            onChange={e => { setSelectedSchoolId(e.target.value); setSelectedTeacherId('all') }}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 cursor-pointer"
            style={{ '--tw-ring-color': roleColor } as React.CSSProperties}
          >
            <option value="all">All Schools</option>
            {scopedSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}

        {/* Teacher filter (coach/admin/researcher) */}
        {role !== 'teacher' && scopedTeachers.length > 0 && (
          <select
            value={selectedTeacherId}
            onChange={e => setSelectedTeacherId(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 cursor-pointer"
          >
            <option value="all">All Teachers</option>
            {scopedTeachers
              .filter(t => selectedSchoolId === 'all' || t.schoolId === selectedSchoolId)
              .map(t => <option key={t.id} value={t.id}>{t.name}</option>)
            }
          </select>
        )}

        {/* Tier filter */}
        {(['all', ...tiers] as string[]).map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${tierFilter !== t ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'text-white'}`}
            style={tierFilter === t ? { backgroundColor: roleColor } : {}}>
            {t === 'all' ? 'All Tiers' : t}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Current Avg %"
          value={latest ? `${latest.currentAvg}%` : '—'}
          sub={latest ? latest.instructionalSetting ?? latest.mtssTier : 'No data yet'}
          icon={<BarChart2 size={18} />} iconColor={roleColor}
        />
        <StatCard
          label="Trend"
          value={trend !== null ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%` : '—'}
          sub="vs previous entry"
          icon={trend !== null && trend >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          iconColor={trend !== null && trend >= 0 ? '#10B981' : '#EF4444'}
        />
        <StatCard label="Avg Growth" value={`${avgGrowth >= 0 ? '+' : ''}${avgGrowth}%`} sub="from baseline" iconColor={roleColor} />
        <StatCard
          label="Goals Met"
          value={String(goalsMet)}
          sub={`of ${filtered.length} records`}
          icon={<CheckCircle size={18} />} iconColor="#10B981"
        />
      </div>

      {/* Cross-teacher summary (non-teacher roles) */}
      {teacherSummary.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} style={{ color: roleColor }} />
            <h2 className="text-sm font-semibold text-gray-800">Teacher Comparison</h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={teacherSummary} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={55} />
              <Tooltip formatter={(v, name) => [`${v}%`, name === 'currentAvg' ? 'Current Avg' : 'Avg Growth']} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="currentAvg" name="Current Avg" fill={roleColor} radius={[0, 4, 4, 0]} />
              <Bar dataKey="avgGrowth" name="Avg Growth" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Trend chart */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Current Avg % Over Time</h2>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BarChart2 size={28} className="mb-2" />
            <p className="text-sm">No data for the selected filters.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={28} unit="%" />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              {tiers.map(t => (
                <Line key={t} type="monotone" dataKey={t} stroke={tierLineColors[t]}
                  strokeWidth={2} dot={false} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Records table */}
      <Card padding="none">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">
            Recent Records {filtered.length > 0 && <span className="text-gray-400 font-normal">({filtered.length} total)</span>}
          </h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No records match the selected filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2 text-gray-400 font-semibold uppercase">Date</th>
                  {role !== 'teacher' && (
                    <th className="text-left px-3 py-2 text-gray-400 font-semibold uppercase hidden sm:table-cell">Teacher</th>
                  )}
                  <th className="text-left px-3 py-2 text-gray-400 font-semibold uppercase hidden md:table-cell">Measure</th>
                  <th className="text-center px-3 py-2 text-gray-400 font-semibold uppercase">Tier</th>
                  <th className="text-right px-3 py-2 text-gray-400 font-semibold uppercase">Baseline</th>
                  <th className="text-right px-3 py-2 text-gray-400 font-semibold uppercase">Current</th>
                  <th className="text-right px-3 py-2 text-gray-400 font-semibold uppercase hidden sm:table-cell">Growth</th>
                  <th className="text-center px-3 py-2 text-gray-400 font-semibold uppercase hidden lg:table-cell">Goal</th>
                  <th className="text-center px-3 py-2 text-gray-400 font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRecord(r)}>
                    <td className="px-4 py-2.5">
                      <p className="text-gray-800 font-medium">{r.date}</p>
                      {r.week && <p className="text-gray-400">Wk {r.week}{r.grade ? ` · Gr ${r.grade}` : ''}</p>}
                    </td>
                    {role !== 'teacher' && (
                      <td className="px-3 py-2.5 text-gray-600 hidden sm:table-cell">
                        {teacherById[r.teacherId] ?? r.teacherId}
                      </td>
                    )}
                    <td className="px-3 py-2.5 text-gray-500 hidden md:table-cell max-w-[140px] truncate">{r.measureType}</td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge color={tierBadge[r.mtssTier] ?? 'blue'}>{r.mtssTier}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-500">{r.baselineAvg != null ? `${r.baselineAvg}%` : '—'}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-gray-800">{r.currentAvg}%</td>
                    <td className="px-3 py-2.5 text-right hidden sm:table-cell">
                      {r.growth != null
                        ? <span className={r.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}>{r.growth >= 0 ? '+' : ''}{r.growth}%</span>
                        : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center hidden lg:table-cell">
                      {r.goalPct != null && (
                        <span className="flex items-center justify-center gap-1">
                          {r.metGoal
                            ? <CheckCircle size={12} className="text-emerald-500" />
                            : <AlertCircle size={12} className="text-amber-400" />}
                          {r.goalPct}%
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {r.uploadStatus && <Badge color={statusColor(r.uploadStatus)}>{r.uploadStatus}</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {uploadOpen && <StudentDataUploadModal onClose={() => setUploadOpen(false)} />}
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          teacherName={role !== 'teacher' ? teacherById[selectedRecord.teacherId] : undefined}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  )
}
