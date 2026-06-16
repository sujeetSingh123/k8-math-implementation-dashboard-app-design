import { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { Activity, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { useAppStore } from '../../store/useAppStore'
import { schools } from '../../data/mockData'
import { roleColors, roleLabels } from '../../constants/roles'
import type { Role } from '../../types'

const roleColor = roleColors.researcher

// ── Constants ──────────────────────────────────────────────────────────────────
const DIST_META: Record<string, { name: string; color: string }> = {
  dist1: { name: 'Riverside USD', color: roleColor },
  dist2: { name: 'Lakeside SD', color: '#EC4899' },
}

const SCH_META: Record<string, { name: string; color: string }> = {
  SCH01: { name: 'Lincoln K-8', color: '#3B82F6' },
  SCH02: { name: 'Washington Middle', color: '#F59E0B' },
  SCH03: { name: 'Roosevelt Elementary', color: '#10B981' },
  SCH04: { name: 'Jefferson K-8', color: '#6366F1' },
}

type Period = 'week' | 'month' | 'year'
type Category = 'routine' | 'ebp' | 'strategy' | 'tier' | 'completion'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'routine', label: 'Routine' },
  { key: 'ebp', label: 'EBP' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'tier', label: 'Tier' },
  { key: 'completion', label: 'Completion' },
]

// ── Types & Helpers ────────────────────────────────────────────────────────────
type LogEntry = { date: string; teacherId: string; schoolId: string; instructionalRoutine?: string; ebpComponent: string[]; implementationStrategy?: string; tier: string; lessonCompletion: string; durationMinutes: number }
type StaffUser = { id: string; name: string; role: Role; schoolId: string; coachId?: string }
type LogEntity = { id: string; name: string; color: string; logs: LogEntry[] }

function periodStart(period: Period) {
  const d = new Date()
  if (period === 'week') d.setDate(d.getDate() - 7)
  else if (period === 'month') d.setDate(d.getDate() - 30)
  else d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().split('T')[0]
}

function logStats(logs: LogEntry[]) {
  const total = logs.length
  const teachers = new Set(logs.map(l => l.teacherId)).size
  const avgDuration = total ? Math.round(logs.reduce((s, l) => s + l.durationMinutes, 0) / total) : 0
  const completionRate = total ? Math.round(logs.filter(l => l.lessonCompletion === 'fully').length / total * 100) : 0
  return { total, teachers, avgDuration, completionRate }
}

function buildEntityTimeline(entities: LogEntity[], period: Period) {
  const today = new Date()
  if (period === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const entry: Record<string, number | string> = { label: d.toLocaleDateString('en-US', { weekday: 'short' }) }
      entities.forEach(e => { entry[e.name] = e.logs.filter(l => l.date === dateStr).length })
      return entry
    })
  }
  if (period === 'month') {
    return Array.from({ length: 5 }, (_, i) => {
      const end = new Date(today); end.setDate(today.getDate() - i * 6)
      const start = new Date(end); start.setDate(end.getDate() - 5)
      const s = start.toISOString().split('T')[0]; const e = end.toISOString().split('T')[0]
      const entry: Record<string, number | string> = { label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
      entities.forEach(ent => { entry[ent.name] = ent.logs.filter(l => l.date >= s && l.date <= e).length })
      return entry
    }).reverse()
  }
  const allLogs = entities.flatMap(e => e.logs)
  const monthKeys = [...new Set(allLogs.map(l => l.date.slice(0, 7)))].sort()
  return monthKeys.map(k => {
    const entry: Record<string, number | string> = { label: new Date(k + '-15').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) }
    entities.forEach(e => { entry[e.name] = e.logs.filter(l => l.date.slice(0, 7) === k).length })
    return entry
  })
}

function getLogKeys(l: LogEntry, category: Category): string[] {
  if (category === 'routine') return l.instructionalRoutine ? [l.instructionalRoutine] : []
  if (category === 'ebp') return l.ebpComponent
  if (category === 'strategy') return l.implementationStrategy ? [l.implementationStrategy] : []
  if (category === 'tier') return [l.tier]
  return [l.lessonCompletion.replace(/_/g, ' ')]
}

function buildEntityCategoryData(entities: LogEntity[], category: Category) {
  const allKeys = [...new Set(entities.flatMap(e => e.logs.flatMap(l => getLogKeys(l, category))))]
  return allKeys
    .map(name => {
      const entry: Record<string, number | string> = { name }
      entities.forEach(e => { entry[e.name] = e.logs.filter(l => getLogKeys(l, category).includes(name)).length })
      return entry
    })
    .sort((a, b) => {
      const tot = (r: typeof a) => entities.reduce((s, e) => s + (r[e.name] as number), 0)
      return tot(b) - tot(a)
    })
}

// ── EntityCards ────────────────────────────────────────────────────────────────
type Entity = { id: string; name: string; color: string; logs: number; sub: string }

function EntityCards({ entities, onSelect }: { entities: Entity[]; onSelect?: (id: string) => void }) {
  if (entities.length === 0) return <p className="text-sm text-gray-400 py-2">No data at this level.</p>
  return (
    <div className="grid grid-cols-2 gap-3">
      {entities.map(e => (
        <button key={e.id} onClick={() => onSelect?.(e.id)} disabled={!onSelect}
          className={`text-left rounded-xl border border-gray-200 p-4 bg-white transition-all ${onSelect ? 'hover:border-gray-300 hover:shadow-sm cursor-pointer' : 'cursor-default'}`}>
          <p className="text-xs text-gray-400 mb-1">{e.name}</p>
          <p className="text-2xl font-bold" style={{ color: e.color }}>{e.logs}</p>
          <p className="text-xs text-gray-400 mt-1">{e.sub}{onSelect ? ' · click to explore' : ''}</p>
        </button>
      ))}
    </div>
  )
}

// ── SchoolStaff ────────────────────────────────────────────────────────────────
function SchoolStaff({ schoolLogs, users, onSelect }: { schoolLogs: LogEntry[]; users: StaffUser[]; onSelect: (id: string) => void }) {
  const isReal = (u: StaffUser) => !u.id.startsWith('TEST_')
  const teachers = users.filter(u => ['teacher', 'paraprofessional'].includes(u.role) && isReal(u))
  const coaches = users.filter(u => u.role === 'coach' && isReal(u))

  function teacherCard(u: StaffUser) {
    const ul = schoolLogs.filter(l => l.teacherId === u.id)
    const cr = ul.length ? Math.round(ul.filter(l => l.lessonCompletion === 'fully').length / ul.length * 100) : 0
    return (
      <button key={u.id} onClick={() => onSelect(u.id)}
        className="text-left rounded-xl border border-gray-200 p-4 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${roleColors[u.role]}20`, color: roleColors[u.role] }}>
          {u.role === 'paraprofessional' ? 'Para' : 'Teacher'}
        </span>
        <p className="text-xs text-gray-400 mt-2 mb-0.5">{u.name}</p>
        <p className="text-2xl font-bold" style={{ color: roleColors[u.role] }}>{ul.length}</p>
        <p className="text-xs text-gray-400 mt-1">{ul.length ? `${cr}% complete` : 'No logs'} · click to explore</p>
      </button>
    )
  }

  function coachCard(u: StaffUser) {
    const caseloadIds = new Set(users.filter(t => t.coachId === u.id && isReal(t)).map(t => t.id))
    const caseloadLogs = schoolLogs.filter(l => caseloadIds.has(l.teacherId))
    const tchCount = caseloadIds.size
    return (
      <button key={u.id} onClick={() => onSelect(u.id)}
        className="text-left rounded-xl border border-gray-200 p-4 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${roleColors.coach}20`, color: roleColors.coach }}>
          Coach
        </span>
        <p className="text-xs text-gray-400 mt-2 mb-0.5">{u.name}</p>
        <p className="text-2xl font-bold" style={{ color: roleColors.coach }}>{tchCount}</p>
        <p className="text-xs text-gray-400 mt-1">{caseloadLogs.length} caseload logs · click to explore</p>
      </button>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Teachers & Paraprofessionals</p>
        {teachers.length ? <div className="grid grid-cols-2 gap-3">{teachers.map(teacherCard)}</div> : <p className="text-xs text-gray-400">None in this school.</p>}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Coaches</p>
        {coaches.length ? <div className="grid grid-cols-2 gap-3">{coaches.map(coachCard)}</div> : <p className="text-xs text-gray-400">None in this school.</p>}
      </div>
    </div>
  )
}

// ── LogCharts ──────────────────────────────────────────────────────────────────
function LogCharts({ entities, period, category }: { entities: LogEntity[]; period: Period; category: Category }) {
  const timelineData = useMemo(() => buildEntityTimeline(entities, period), [entities, period])
  const categoryData = useMemo(() => buildEntityCategoryData(entities, category), [entities, category])
  const timeLabel = period === 'week' ? 'Day' : period === 'month' ? 'Period' : 'Month'
  const catLabel = CATEGORIES.find(c => c.key === category)?.label ?? ''
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title={`Log Volume by ${timeLabel}`}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timelineData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            {entities.map(e => <Line key={e.id} type="monotone" dataKey={e.name} stroke={e.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />)}
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title={`Distribution by ${catLabel}`}>
        {categoryData.length === 0
          ? <p className="text-sm text-gray-400 text-center py-10">No logs in this period.</p>
          : (
            <ResponsiveContainer width="100%" height={Math.max(200, categoryData.length * 28 + 40)}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                {entities.map(e => <Bar key={e.id} dataKey={e.name} fill={e.color} radius={[0, 4, 4, 0]} />)}
              </BarChart>
            </ResponsiveContainer>
          )
        }
      </Card>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function LogAggregation({ lockedDistrictId, lockedSchoolId, teacherBasePath = '/researcher/teacher' }: { lockedDistrictId?: string; lockedSchoolId?: string; teacherBasePath?: string } = {}) {
  const { implementationLogs, users } = useAppStore()
  const navigate = useNavigate()
  const lockedSchoolDistrict = lockedSchoolId ? schools.find(s => s.id === lockedSchoolId)?.districtId ?? null : null
  const [period, setPeriod] = useState<Period>('month')
  const [category, setCategory] = useState<Category>('routine')
  const [districtId, setDistrictId] = useState<string | null>(lockedSchoolId ? lockedSchoolDistrict : (lockedDistrictId ?? null))
  const [schoolId, setSchoolId] = useState<string | null>(lockedSchoolId ?? null)
  const [userId, setUserId] = useState<string | null>(null)

  const schoolDistMap = useMemo(() => Object.fromEntries(schools.map(s => [s.id, s.districtId])), [])
  const start = useMemo(() => periodStart(period), [period])
  const periodLogs = useMemo(() => implementationLogs.filter(l => l.date >= start), [implementationLogs, start])

  const selectedUser = useMemo(() => users.find(u => u.id === userId) ?? null, [users, userId])

  const scopedLogs = useMemo(() => {
    const base = schoolId ? periodLogs.filter(l => l.schoolId === schoolId)
      : districtId ? periodLogs.filter(l => schoolDistMap[l.schoolId] === districtId)
      : periodLogs
    if (!userId || !selectedUser) return base
    if (selectedUser.role === 'coach') {
      const ids = new Set(users.filter(u => u.coachId === userId).map(u => u.id))
      return base.filter(l => ids.has(l.teacherId))
    }
    return base.filter(l => l.teacherId === userId)
  }, [periodLogs, districtId, schoolId, userId, selectedUser, schoolDistMap, users])

  const schoolLogs = useMemo(() =>
    schoolId ? periodLogs.filter(l => l.schoolId === schoolId) : [],
  [periodLogs, schoolId])

  // District/school level entity cards (not used at school or user levels)
  const topEntities: Entity[] = useMemo(() => {
    if (schoolId || userId) return []
    if (districtId) {
      return schools.filter(s => s.districtId === districtId).map(s => {
        const sl = scopedLogs.filter(l => l.schoolId === s.id)
        return { id: s.id, name: SCH_META[s.id]?.name ?? s.name, color: SCH_META[s.id]?.color ?? '#6B7280', logs: sl.length, sub: `${new Set(sl.map(l => l.teacherId)).size} teachers · ${sl.length ? Math.round(sl.filter(l => l.lessonCompletion === 'fully').length / sl.length * 100) : 0}% complete` }
      })
    }
    return Object.keys(DIST_META).map(id => {
      const dl = periodLogs.filter(l => schoolDistMap[l.schoolId] === id)
      return { id, name: DIST_META[id].name, color: DIST_META[id].color, logs: dl.length, sub: `${new Set(dl.map(l => l.teacherId)).size} teachers · ${dl.length ? Math.round(dl.filter(l => l.lessonCompletion === 'fully').length / dl.length * 100) : 0}% complete` }
    })
  }, [schoolId, districtId, scopedLogs, periodLogs, schoolDistMap, userId])

  // Coach's caseload entity cards (shown when viewing a coach)
  const caseloadEntities: Entity[] = useMemo(() => {
    if (!userId || selectedUser?.role !== 'coach') return []
    return users
      .filter(u => u.coachId === userId && !u.id.startsWith('TEST_'))
      .map(u => {
        const ul = scopedLogs.filter(l => l.teacherId === u.id)
        return { id: u.id, name: u.name, color: roleColors[u.role], logs: ul.length, sub: ul.length ? `${Math.round(ul.filter(l => l.lessonCompletion === 'fully').length / ul.length * 100)}% complete` : 'No logs' }
      })
  }, [userId, selectedUser, users, scopedLogs])

  const stats = useMemo(() => logStats(scopedLogs), [scopedLogs])

  const TEACHER_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4']

  const logEntities: LogEntity[] = useMemo(() => {
    if (userId && selectedUser?.role === 'coach') {
      const caseTeachers = users.filter(u => u.coachId === userId && !u.id.startsWith('TEST_'))
      return caseTeachers.map((u, i) => ({
        id: u.id, name: u.name, color: TEACHER_PALETTE[i % TEACHER_PALETTE.length],
        logs: scopedLogs.filter(l => l.teacherId === u.id),
      }))
    }
    if (schoolId) {
      const teacherIds = [...new Set(scopedLogs.map(l => l.teacherId))]
      return teacherIds.map((tid, i) => ({
        id: tid, name: users.find(u => u.id === tid)?.name ?? tid,
        color: TEACHER_PALETTE[i % TEACHER_PALETTE.length],
        logs: scopedLogs.filter(l => l.teacherId === tid),
      }))
    }
    if (districtId) {
      return schools.filter(s => s.districtId === districtId).map(s => ({
        id: s.id, name: SCH_META[s.id]?.name ?? s.name, color: SCH_META[s.id]?.color ?? '#6B7280',
        logs: scopedLogs.filter(l => l.schoolId === s.id),
      }))
    }
    return Object.keys(DIST_META).map(id => ({
      id, name: DIST_META[id].name, color: DIST_META[id].color,
      logs: periodLogs.filter(l => schoolDistMap[l.schoolId] === id),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedUser, schoolId, districtId, scopedLogs, periodLogs, schoolDistMap, users])

  const crumbs = lockedSchoolId
    ? [
        { label: SCH_META[lockedSchoolId]?.name ?? lockedSchoolId, onClick: userId ? () => setUserId(null) : undefined },
        ...(userId && selectedUser ? [{ label: selectedUser.name }] : []),
      ]
    : lockedDistrictId
    ? [
        { label: DIST_META[lockedDistrictId]?.name ?? lockedDistrictId, onClick: schoolId ? () => { setSchoolId(null); setUserId(null) } : undefined },
        ...(schoolId ? [{ label: SCH_META[schoolId]?.name ?? schoolId, onClick: userId ? () => setUserId(null) : undefined }] : []),
        ...(userId && selectedUser ? [{ label: selectedUser.name }] : []),
      ]
    : [
        { label: 'All Districts', onClick: districtId ? () => { setDistrictId(null); setSchoolId(null); setUserId(null) } : undefined },
        ...(districtId ? [{ label: DIST_META[districtId].name, onClick: schoolId ? () => { setSchoolId(null); setUserId(null) } : undefined }] : []),
        ...(schoolId ? [{ label: SCH_META[schoolId]?.name ?? schoolId, onClick: userId ? () => setUserId(null) : undefined }] : []),
        ...(userId && selectedUser ? [{ label: selectedUser.name }] : []),
      ]

  const drillIntoTop = !districtId ? (id: string) => setDistrictId(id) : !schoolId ? (id: string) => setSchoolId(id) : undefined

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${roleColor}20` }}>
          <Activity size={18} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Log Aggregation</h2>
          <p className="text-xs text-gray-500">
            {selectedUser ? `${roleLabels[selectedUser.role]} · ${selectedUser.name}` : 'Implementation logs · All districts'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
              style={period === p.key ? { backgroundColor: roleColor, color: '#fff' } : { color: '#6B7280' }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              className="px-3 py-1 rounded-full text-xs font-medium border-2 cursor-pointer transition-all"
              style={{ borderColor: category === c.key ? roleColor : '#D1D5DB', backgroundColor: category === c.key ? roleColor : '#fff', color: category === c.key ? '#fff' : '#6B7280' }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex items-center gap-1 flex-wrap text-sm">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={13} className="text-gray-300" />}
            {c.onClick
              ? <button onClick={c.onClick} className="text-blue-500 hover:underline cursor-pointer font-medium">{c.label}</button>
              : <span className="text-gray-800 font-semibold">{c.label}</span>
            }
          </span>
        ))}
      </nav>

      {/* Entity display — adapts to current level */}
      {!schoolId && <EntityCards entities={topEntities} onSelect={drillIntoTop} />}
      {schoolId && !userId && (
        <SchoolStaff
          schoolLogs={schoolLogs}
          users={(users as StaffUser[]).filter(u => u.schoolId === schoolId)}
          onSelect={(id) => {
            const u = users.find(u => u.id === id)
            if (u?.role === 'coach') setUserId(id)
            else navigate(`${teacherBasePath}/${id}`)
          }}
        />
      )}
      {userId && selectedUser?.role === 'coach' && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Caseload Teachers</p>
          <EntityCards entities={caseloadEntities} />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Logs" value={String(stats.total)} sub={period} color={roleColor} />
        <StatCard label="Unique Teachers" value={String(stats.teachers)} color={roleColor} />
        <StatCard label="Avg Duration" value={String(stats.avgDuration)} unit="min" color={roleColor} />
        <StatCard label="Completion Rate" value={`${stats.completionRate}%`} sub="Fully completed" color="#10B981" />
      </div>

      <LogCharts entities={logEntities} period={period} category={category} />
    </div>
  )
}
