import { useState, useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, LabelList,
} from 'recharts'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { roleColors } from '../../constants/roles'
import { TeacherDrillDetail, type DrillTab } from './TeacherDrillDetail'
import type { FidelityCheck } from '../../types'

interface DrillScope {
  districtId?: string
  schoolId?: string
  teacherId?: string
}

type ChartEntry = {
  id: string
  name: string
  fullName: string
  count: number
  value?: number
  consistent?: number
  inconsistent?: number
  adherence?: number
  dosage?: number
  quality?: number
  responsiveness?: number
  confidence?: number
}

const DIMS = [
  { key: 'adherence' as const, label: 'Adherence', color: '#3B82F6' },
  { key: 'dosage' as const, label: 'Dosage', color: '#10B981' },
  { key: 'quality' as const, label: 'Quality', color: '#8B5CF6' },
  { key: 'responsiveness' as const, label: 'Responsiveness', color: '#F59E0B' },
  { key: 'confidence' as const, label: 'Confidence', color: '#EF4444' },
]

function fidAvgDim(checks: FidelityCheck[], key: keyof Pick<FidelityCheck, 'adherence' | 'dosage' | 'quality' | 'responsiveness' | 'confidence'>) {
  return checks.length ? Math.round(checks.reduce((s, c) => s + c[key], 0) / checks.length * 20) : 0
}

function scoreColor(pct: number) {
  return pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444'
}

function shortName(name: string) {
  return name.split(' ')[0].slice(0, 12)
}

export function DrillDownDataView() {
  const { currentUser, districts, schools, users, fidelityChecks, adaptations, studentDataRecords } = useAppStore()
  const isDistrictAdmin = currentUser.role === 'district_admin'
  const roleColor = roleColors[currentUser.role]

  const [scope, setScope] = useState<DrillScope>(
    isDistrictAdmin ? { districtId: currentUser.districtId } : {}
  )
  const [tab, setTab] = useState<DrillTab>('fidelity')

  const level = scope.teacherId ? 'teacher'
    : scope.schoolId ? 'school'
    : scope.districtId ? 'district'
    : 'global'

  const levelLabel = level === 'global' ? 'Districts' : level === 'district' ? 'Schools' : 'Teachers'

  const scopedDistricts = isDistrictAdmin
    ? districts.filter(d => d.id === currentUser.districtId)
    : districts

  const districtSchools = useMemo(
    () => scope.districtId ? schools.filter(s => s.districtId === scope.districtId) : schools,
    [scope.districtId, schools],
  )

  const schoolTeachers = useMemo(
    () => scope.schoolId ? users.filter(u => u.role === 'teacher' && u.schoolId === scope.schoolId) : [],
    [scope.schoolId, users],
  )

  function tIdsFor(schoolIds: string[]) {
    return new Set(users.filter(u => u.role === 'teacher' && schoolIds.includes(u.schoolId)).map(u => u.id))
  }

  const chartData = useMemo((): ChartEntry[] => {
    const entities =
      level === 'global'
        ? scopedDistricts.map(d => ({ id: d.id, name: d.name, schoolIds: schools.filter(s => s.districtId === d.id).map(s => s.id), teacherId: undefined }))
        : level === 'district'
        ? districtSchools.map(s => ({ id: s.id, name: s.name, schoolIds: [s.id], teacherId: undefined }))
        : schoolTeachers.map(t => ({ id: t.id, name: t.name, schoolIds: [] as string[], teacherId: t.id }))

    return entities.map(e => {
      const tIds = e.teacherId ? new Set([e.teacherId]) : tIdsFor(e.schoolIds)
      if (tab === 'fidelity') {
        const checks = fidelityChecks.filter(c => tIds.has(c.teacherId))
        return {
          id: e.id, name: shortName(e.name), fullName: e.name, count: checks.length,
          adherence: fidAvgDim(checks, 'adherence'),
          dosage: fidAvgDim(checks, 'dosage'),
          quality: fidAvgDim(checks, 'quality'),
          responsiveness: fidAvgDim(checks, 'responsiveness'),
          confidence: fidAvgDim(checks, 'confidence'),
        }
      }
      if (tab === 'adaptations') {
        const adpts = adaptations.filter(a => tIds.has(a.teacherId))
        const consistent = adpts.filter(a => a.fidelityType === 'consistent').length
        const pct = adpts.length ? Math.round(consistent / adpts.length * 100) : 0
        return { id: e.id, name: shortName(e.name), fullName: e.name, count: adpts.length, value: pct, consistent, inconsistent: adpts.length - consistent }
      }
      const recs = studentDataRecords.filter(r => tIds.has(r.teacherId))
      const avg = recs.length ? Math.round(recs.reduce((s, r) => s + r.currentAvg, 0) / recs.length) : 0
      return { id: e.id, name: shortName(e.name), fullName: e.name, count: recs.length, value: avg }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, scope, tab, fidelityChecks, adaptations, studentDataRecords, scopedDistricts, districtSchools, schoolTeachers])

  const summaryStats = useMemo(() => {
    if (tab === 'fidelity') {
      const totalChecks = chartData.reduce((s, d) => s + d.count, 0)
      const overallAvg = chartData.length
        ? Math.round(chartData.reduce((s, d) =>
            s + ((d.adherence ?? 0) + (d.dosage ?? 0) + (d.quality ?? 0) + (d.responsiveness ?? 0) + (d.confidence ?? 0)) / 5
          , 0) / chartData.length)
        : 0
      return [
        { label: 'Avg Fidelity', value: `${overallAvg}%` },
        { label: 'Total Checks', value: String(totalChecks) },
        { label: levelLabel, value: String(chartData.length) },
      ]
    }
    if (tab === 'adaptations') {
      const total = chartData.reduce((s, d) => s + d.count, 0)
      const consistent = chartData.reduce((s, d) => s + (d.consistent ?? 0), 0)
      const pct = total ? Math.round(consistent / total * 100) : 0
      return [
        { label: 'Total Adaptations', value: String(total) },
        { label: 'Consistent', value: `${pct}%` },
        { label: levelLabel, value: String(chartData.length) },
      ]
    }
    const totalRecs = chartData.reduce((s, d) => s + d.count, 0)
    const avgScore = chartData.length ? Math.round(chartData.reduce((s, d) => s + (d.value ?? 0), 0) / chartData.length) : 0
    return [
      { label: 'Avg Score', value: `${avgScore}%` },
      { label: 'Records', value: String(totalRecs) },
      { label: levelLabel, value: String(chartData.length) },
    ]
  }, [tab, chartData, levelLabel])

  function drillInto(id: string) {
    if (level === 'global') setScope({ districtId: id })
    else if (level === 'district') setScope({ districtId: scope.districtId, schoolId: id })
    else if (level === 'school') setScope({ districtId: scope.districtId, schoolId: scope.schoolId, teacherId: id })
  }

  const crumbs: { label: string; onClick?: () => void }[] = []
  if (!isDistrictAdmin) crumbs.push({ label: 'All Districts', onClick: level !== 'global' ? () => setScope({}) : undefined })
  if (scope.districtId) crumbs.push({ label: districts.find(d => d.id === scope.districtId)?.name ?? scope.districtId, onClick: level !== 'district' ? () => setScope({ districtId: scope.districtId }) : undefined })
  if (scope.schoolId) crumbs.push({ label: schools.find(s => s.id === scope.schoolId)?.name ?? scope.schoolId, onClick: level !== 'school' ? () => setScope({ districtId: scope.districtId, schoolId: scope.schoolId }) : undefined })
  if (scope.teacherId) crumbs.push({ label: users.find(u => u.id === scope.teacherId)?.name ?? scope.teacherId })

  const chartTitle =
    tab === 'fidelity' ? `Fidelity Dimensions by ${levelLabel}`
    : tab === 'adaptations' ? `Adaptations by ${levelLabel}`
    : `Avg Student Score by ${levelLabel}`

  const drillHint =
    level === 'global' ? 'Click a bar to see schools'
    : level === 'district' ? 'Click a bar to see teachers'
    : 'Click a bar for teacher detail'

  const barHeight = Math.max(220, Math.min(320, chartData.length * 60))

  return (
    <div className="space-y-4">
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

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['fidelity', 'adaptations', 'students'] as DrillTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
            style={tab === t ? { backgroundColor: roleColor, color: '#fff' } : { color: '#6B7280' }}>
            {t === 'fidelity' ? 'Fidelity' : t === 'adaptations' ? 'Adaptations' : 'Students'}
          </button>
        ))}
      </div>

      {level === 'teacher' && scope.teacherId && (
        <TeacherDrillDetail teacherId={scope.teacherId} tab={tab} roleColor={roleColor} />
      )}

      {level !== 'teacher' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {summaryStats.map(s => (
              <StatCard key={s.label} label={s.label} value={s.value} color={roleColor} />
            ))}
          </div>

          <Card title={chartTitle}>
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No data found.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={barHeight}>
                  <BarChart data={chartData} margin={{ top: 16, right: 16, left: -8, bottom: 4 }} style={{ cursor: 'pointer' }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    {tab === 'adaptations'
                      ? <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      : <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    }
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E5E7EB' }}
                      cursor={{ fill: '#F9FAFB' }}
                      formatter={(value, name, props) => {
                        const v = Number(value)
                        const full = (props.payload as ChartEntry | undefined)?.fullName ?? ''
                        if (tab === 'fidelity') {
                          const dim = DIMS.find(d => d.key === String(name))
                          return [`${v}%`, `${dim?.label ?? name} — ${full}`]
                        }
                        if (tab === 'adaptations') return [v, `${name === 'consistent' ? 'Consistent' : 'Inconsistent'} — ${full}`]
                        return [`${v}%`, full]
                      }}
                    />
                    {tab === 'fidelity' && DIMS.map(d => (
                      <Bar key={d.key} dataKey={d.key} name={d.key} fill={d.color} radius={[4, 4, 0, 0]}
                        onClick={(_d, index) => drillInto(chartData[index]?.id ?? '')} />
                    ))}
                    {tab === 'adaptations' && (
                      <>
                        <Bar dataKey="consistent" name="consistent" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]}
                          onClick={(_d, index) => drillInto(chartData[index]?.id ?? '')} />
                        <Bar dataKey="inconsistent" name="inconsistent" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]}
                          onClick={(_d, index) => drillInto(chartData[index]?.id ?? '')} />
                      </>
                    )}
                    {tab === 'students' && (
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} onClick={(_d, index) => drillInto(chartData[index]?.id ?? '')}>
                        <LabelList dataKey="value" position="top"
                          formatter={(v) => `${v ?? 0}%`}
                          style={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }} />
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={scoreColor(entry.value ?? 0)} />
                        ))}
                      </Bar>
                    )}
                  </BarChart>
                </ResponsiveContainer>

                {tab === 'fidelity' && (
                  <div className="flex flex-wrap gap-3 justify-center mt-2">
                    {DIMS.map(d => (
                      <span key={d.key} className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: d.color }} />
                        {d.label}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center mt-2">{drillHint} ↓</p>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
