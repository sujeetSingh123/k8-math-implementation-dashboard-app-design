import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { useState, useMemo } from 'react'
import {
  monthlyFidelityTrend, schoolFidelityTrends, dist2SchoolFidelityTrends,
  districtFidelityTrends, schools,
} from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import type { StudentDataRecord } from '../../types'

const roleColor = roleColors.researcher

// ── Shared meta ───────────────────────────────────────────────────────────────
const DIST_META: Record<string, { name: string; color: string; schoolIds: string[] }> = {
  dist1: { name: 'Riverside USD', color: roleColor, schoolIds: ['SCH01', 'SCH02'] },
  dist2: { name: 'Lakeside SD', color: '#EC4899', schoolIds: ['SCH03', 'SCH04'] },
}
const SCH_META: Record<string, { name: string; color: string }> = {
  SCH01: { name: 'Lincoln K-8', color: '#3B82F6' },
  SCH02: { name: 'Washington Middle', color: '#F59E0B' },
  SCH03: { name: 'Roosevelt Elementary', color: '#10B981' },
  SCH04: { name: 'Jefferson K-8', color: '#F59E0B' },
}

// ── Fidelity constants ─────────────────────────────────────────────────────────
const dims = ['adherence', 'dosage', 'quality', 'responsiveness', 'confidence'] as const
type Dim = typeof dims[number]
type TrendRow = Record<Dim, number>
const dimColors: Record<Dim, string> = {
  adherence: '#8B5CF6', dosage: '#3B82F6', quality: '#10B981',
  responsiveness: '#F59E0B', confidence: '#EF4444',
}
const allSchoolTrends: Record<string, TrendRow[]> = { ...schoolFidelityTrends, ...dist2SchoolFidelityTrends }
function comp(row: TrendRow) { return +(dims.reduce((s, d) => s + row[d], 0) / dims.length).toFixed(2) }
function pct(v: number) { return Math.round(v * 20) }
const months = monthlyFidelityTrend.map(m => m.month)

// ── Student data helpers ──────────────────────────────────────────────────────
const TIERS = ['Tier 1', 'Tier 2', 'Tier 3', 'Special Education'] as const
function sdStats(recs: StudentDataRecord[]) {
  const total = recs.length
  const avgGrowth = total ? Math.round(recs.reduce((s, r) => s + (r.growth ?? 0), 0) / total) : 0
  const avgCurrent = total ? Math.round(recs.reduce((s, r) => s + r.currentAvg, 0) / total) : 0
  const metGoalPct = total ? Math.round(recs.filter(r => r.metGoal).length / total * 100) : 0
  const teachers = new Set(recs.map(r => r.teacherId)).size
  return { total, avgGrowth, avgCurrent, metGoalPct, teachers }
}
function buildEntityTrend(entities: SdEntity[]) {
  const allWeeks = [...new Set(entities.flatMap(e => e.recs.map(r => r.week ?? 0)))].sort((a, b) => a - b)
  return allWeeks.map(wk => {
    const entry: Record<string, number | string> = { week: `Wk ${wk}` }
    entities.forEach(e => {
      const wr = e.recs.filter(r => (r.week ?? 0) === wk)
      if (wr.length) entry[e.name] = Math.round(wr.reduce((s, r) => s + r.currentAvg, 0) / wr.length)
    })
    return entry
  })
}

// ── Fidelity level components ─────────────────────────────────────────────────
function DistrictsLevel({ onSelect }: { onSelect: (id: string) => void }) {
  const distIds = Object.keys(DIST_META)
  const chartData = months.map((month, i) => ({
    month,
    ...Object.fromEntries(distIds.map(id => [DIST_META[id].name, comp(districtFidelityTrends[id as 'dist1' | 'dist2'][i])])),
  }))
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {distIds.map(id => {
          const last = districtFidelityTrends[id as 'dist1' | 'dist2'][8]
          return (
            <button key={id} onClick={() => onSelect(id)}
              className="text-left rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white">
              <p className="text-xs text-gray-400 mb-1">{DIST_META[id].name}</p>
              <p className="text-2xl font-bold" style={{ color: DIST_META[id].color }}>{pct(comp(last))}%</p>
              <p className="text-xs text-gray-400 mt-1">Latest composite · click to explore</p>
            </button>
          )
        })}
      </div>
      <Card title="District Fidelity Trajectories">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[2, 5]} tick={{ fontSize: 10 }} tickFormatter={v => `${pct(v)}%`} />
            <Tooltip formatter={(v) => typeof v === 'number' ? `${pct(v)}%` : ''} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {distIds.map(id => <Line key={id} type="monotone" dataKey={DIST_META[id].name} stroke={DIST_META[id].color} strokeWidth={2.5} dot={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

function SchoolsLevel({ districtId, onSelect }: { districtId: string; onSelect: (id: string) => void }) {
  const meta = DIST_META[districtId]
  const schoolIds = meta.schoolIds
  const distTrends = districtFidelityTrends[districtId as 'dist1' | 'dist2']
  const chartData = months.map((month, i) => ({
    month, [`${meta.name} Avg`]: comp(distTrends[i]),
    ...Object.fromEntries(schoolIds.map(id => [SCH_META[id].name, comp(allSchoolTrends[id][i])])),
  }))
  const dimData = dims.map(d => ({
    dim: d.slice(0, 4).toUpperCase(),
    ...Object.fromEntries(schoolIds.map(id => [SCH_META[id].name, allSchoolTrends[id][8][d]])),
  }))
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {schoolIds.map(id => (
          <button key={id} onClick={() => onSelect(id)}
            className="text-left rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white">
            <p className="text-xs text-gray-400 mb-1">{SCH_META[id].name}</p>
            <p className="text-2xl font-bold" style={{ color: SCH_META[id].color }}>{pct(comp(allSchoolTrends[id][8]))}%</p>
            <p className="text-xs text-gray-400 mt-1">Latest composite · click to explore</p>
          </button>
        ))}
      </div>
      <Card title={`School Trajectories — ${meta.name}`}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[2, 5]} tick={{ fontSize: 10 }} tickFormatter={v => `${pct(v)}%`} />
            <Tooltip formatter={(v) => typeof v === 'number' ? `${pct(v)}%` : ''} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey={`${meta.name} Avg`} stroke={meta.color} strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
            {schoolIds.map(id => <Line key={id} type="monotone" dataKey={SCH_META[id].name} stroke={SCH_META[id].color} strokeWidth={2} dot={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Component Breakdown (Latest Month)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dimData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="dim" tick={{ fontSize: 11 }} />
            <YAxis domain={[2, 5]} tick={{ fontSize: 10 }} tickFormatter={v => `${pct(v)}%`} />
            <Tooltip formatter={(v) => typeof v === 'number' ? `${pct(v)}%` : ''} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {schoolIds.map(id => <Bar key={id} dataKey={SCH_META[id].name} fill={SCH_META[id].color} radius={[4, 4, 0, 0]} />)}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

function SchoolDetailLevel({ schoolId }: { schoolId: string }) {
  const trend = allSchoolTrends[schoolId]
  const latest = trend[8]
  const chartData = months.map((month, i) => ({
    month, Composite: comp(trend[i]),
    ...Object.fromEntries(dims.map(d => [d.charAt(0).toUpperCase() + d.slice(1), trend[i][d]])),
  }))
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {dims.map(d => <StatCard key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} value={`${pct(latest[d])}%`} color={dimColors[d]} />)}
      </div>
      <Card title={`Monthly Fidelity — ${SCH_META[schoolId].name}`}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[2, 5]} tick={{ fontSize: 10 }} tickFormatter={v => `${pct(v)}%`} />
            <Tooltip formatter={(v) => typeof v === 'number' ? `${pct(v)}%` : ''} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {dims.map(d => <Line key={d} type="monotone" dataKey={d.charAt(0).toUpperCase() + d.slice(1)} stroke={dimColors[d]} strokeWidth={1.5} dot={false} />)}
            <Line type="monotone" dataKey="Composite" stroke={SCH_META[schoolId].color} strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

// ── Student data level components ─────────────────────────────────────────────
type SdEntity = { id: string; name: string; color: string; recs: StudentDataRecord[] }

function StudentEntityCards({ entities, onSelect }: { entities: SdEntity[]; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {entities.map(e => {
        const s = sdStats(e.recs)
        return (
          <button key={e.id} onClick={() => onSelect(e.id)}
            className="text-left rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white">
            <p className="text-xs text-gray-400 mb-1">{e.name}</p>
            <p className="text-2xl font-bold" style={{ color: e.color }}>{s.avgCurrent}%</p>
            <p className="text-xs text-gray-400 mt-1">+{s.avgGrowth}% growth · {s.metGoalPct}% met goal · click to explore</p>
          </button>
        )
      })}
    </div>
  )
}

function StudentCharts({ entities, title }: { entities: SdEntity[]; title: string }) {
  const allRecs = useMemo(() => entities.flatMap(e => e.recs), [entities])
  const trendData = useMemo(() => buildEntityTrend(entities), [entities])
  const tierDist = TIERS.map(t => ({
    tier: t === 'Special Education' ? 'Sp.Ed.' : t,
    Records: allRecs.filter(r => r.mtssTier === t).length,
    'Met Goal': allRecs.filter(r => r.mtssTier === t && r.metGoal).length,
  }))

  if (allRecs.length === 0) return <p className="text-sm text-gray-400 py-6 text-center">No student data at this level.</p>
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title={title}>
        <p className="text-xs text-gray-400 mb-3">Avg performance % per week</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} width={36} />
            <Tooltip formatter={(v) => typeof v === 'number' ? `${v}%` : ''} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            {entities.map(e => <Line key={e.id} type="monotone" dataKey={e.name} stroke={e.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />)}
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Records & Goal Attainment by Tier">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={tierDist} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="tier" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="Records" fill="#D1D5DB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Met Goal" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

const TEACHER_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4']

function StudentTeacherLevel({ recs, navigate, teacherBasePath }: { recs: StudentDataRecord[]; navigate: (path: string) => void; teacherBasePath: string }) {
  const { users } = useAppStore()
  const teacherIds = [...new Set(recs.map(r => r.teacherId))]
  const teacherEntities: SdEntity[] = teacherIds.map((tid, i) => ({
    id: tid,
    name: users.find(u => u.id === tid)?.name ?? tid,
    color: TEACHER_PALETTE[i % TEACHER_PALETTE.length],
    recs: recs.filter(r => r.teacherId === tid),
  }))
  if (teacherEntities.length === 0) return <p className="text-sm text-gray-400 py-2">No student data in this school.</p>
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {teacherEntities.map(e => {
          const s = sdStats(e.recs)
          return (
            <button key={e.id} onClick={() => navigate(`${teacherBasePath}/${e.id}`)}
              className="text-left rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${e.color}20`, color: e.color }}>Teacher</span>
              <p className="text-xs text-gray-400 mt-2 mb-0.5">{e.name}</p>
              <p className="text-2xl font-bold" style={{ color: e.color }}>{s.avgCurrent}%</p>
              <p className="text-xs text-gray-400 mt-1">+{s.avgGrowth}% growth · {s.metGoalPct}% met goal · click for full detail</p>
            </button>
          )
        })}
      </div>
      <StudentCharts entities={teacherEntities} title="Performance by Teacher" />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function SectionHeading({ label }: { label: string }) {
  return <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">{label}</p>
}

export function LongitudinalView({ lockedDistrictId, lockedSchoolId, teacherBasePath = '/researcher/teacher' }: { lockedDistrictId?: string; lockedSchoolId?: string; teacherBasePath?: string } = {}) {
  const { studentDataRecords } = useAppStore()
  const navigate = useNavigate()
  const lockedSchoolDistrict = lockedSchoolId ? schools.find(s => s.id === lockedSchoolId)?.districtId ?? null : null
  const [districtId, setDistrictId] = useState<string | null>(lockedSchoolId ? lockedSchoolDistrict : (lockedDistrictId ?? null))
  const [schoolId, setSchoolId] = useState<string | null>(lockedSchoolId ?? null)

  const schoolDistMap = useMemo(() => Object.fromEntries(schools.map(s => [s.id, s.districtId])), [])

  const sdScoped = useMemo(() => {
    if (schoolId) return studentDataRecords.filter(r => r.schoolId === schoolId)
    if (districtId) return studentDataRecords.filter(r => schoolDistMap[r.schoolId ?? ''] === districtId)
    return studentDataRecords
  }, [studentDataRecords, districtId, schoolId, schoolDistMap])

  const sdStats_ = useMemo(() => sdStats(sdScoped), [sdScoped])

  const districtEntities = useMemo(() => Object.keys(DIST_META).map(id => ({
    id, name: DIST_META[id].name, color: DIST_META[id].color,
    recs: studentDataRecords.filter(r => schoolDistMap[r.schoolId ?? ''] === id),
  })), [studentDataRecords, schoolDistMap])

  const schoolEntities = useMemo(() => districtId
    ? schools.filter(s => s.districtId === districtId).map(s => ({
        id: s.id, name: SCH_META[s.id]?.name ?? s.name, color: SCH_META[s.id]?.color ?? '#6B7280',
        recs: studentDataRecords.filter(r => r.schoolId === s.id),
      }))
    : [], [districtId, studentDataRecords])

  const crumbs = lockedSchoolId
    ? [{ label: SCH_META[lockedSchoolId]?.name ?? lockedSchoolId }]
    : lockedDistrictId
    ? [
        { label: DIST_META[lockedDistrictId]?.name ?? lockedDistrictId, onClick: schoolId ? () => setSchoolId(null) : undefined },
        ...(schoolId ? [{ label: SCH_META[schoolId]?.name ?? schoolId }] : []),
      ]
    : [
        { label: 'All Districts', onClick: districtId ? () => { setDistrictId(null); setSchoolId(null) } : undefined },
        ...(districtId ? [{ label: DIST_META[districtId].name, onClick: schoolId ? () => setSchoolId(null) : undefined }] : []),
        ...(schoolId ? [{ label: SCH_META[schoolId]?.name ?? schoolId }] : []),
      ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${roleColor}20` }}>
          <TrendingUp size={18} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Longitudinal View</h2>
          <p className="text-xs text-gray-500">District-wide trends · Sep – May</p>
        </div>
      </div>

      {/* Breadcrumb */}
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

      {/* Fidelity section */}
      <SectionHeading label="Fidelity Trends" />
      {!districtId && <DistrictsLevel onSelect={setDistrictId} />}
      {districtId && !schoolId && <SchoolsLevel districtId={districtId} onSelect={setSchoolId} />}
      {districtId && schoolId && <SchoolDetailLevel schoolId={schoolId} />}

      {/* Student data section */}
      <SectionHeading label="Student Data" />
      {!districtId && <StudentEntityCards entities={districtEntities} onSelect={setDistrictId} />}
      {districtId && !schoolId && <StudentEntityCards entities={schoolEntities} onSelect={setSchoolId} />}
      {districtId && schoolId && <StudentTeacherLevel recs={sdScoped} navigate={navigate} teacherBasePath={teacherBasePath} />}
      {!schoolId && sdScoped.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Avg Performance" value={`${sdStats_.avgCurrent}%`} sub="Current avg" color={roleColor} />
            <StatCard label="Avg Growth" value={`+${sdStats_.avgGrowth}%`} sub="Since baseline" color="#10B981" />
            <StatCard label="Met Goal" value={`${sdStats_.metGoalPct}%`} sub="Records on track" color="#3B82F6" />
            <StatCard label="Total Records" value={String(sdStats_.total)} sub={`${sdStats_.teachers} teachers`} color={roleColor} />
          </div>
          <StudentCharts
            entities={!districtId ? districtEntities : schoolEntities}
            title={!districtId ? 'Performance by District' : 'Performance by School'}
          />
        </>
      )}
    </div>
  )
}
