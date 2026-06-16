import { useState, useMemo } from 'react'
import { Building2, School, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { districts, schools } from '../../data/mockData'
import { Card } from '../../components/ui/Card'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.researcher

type Metrics = {
  id: string; name: string
  teacherCount: number; logCount: number
  avgFidelity: number | null; completionRate: number | null
  avgStudentScore: number | null; adaptationCount: number
}

const METRIC_DEFS = [
  { key: 'teacherCount' as const,    label: 'Teachers',          unit: '',   max: null },
  { key: 'logCount' as const,        label: 'Impl. Logs',        unit: '',   max: null },
  { key: 'completionRate' as const,  label: 'Completion Rate',   unit: '%',  max: 100 },
  { key: 'avgFidelity' as const,     label: 'Avg Fidelity',      unit: '%',  max: 100 },
  { key: 'avgStudentScore' as const, label: 'Avg Student Score', unit: '%',  max: 100 },
  { key: 'adaptationCount' as const, label: 'Adaptations',       unit: '',   max: null },
]

function computeEntityMetrics(
  schoolIds: string[],
  entityId: string,
  entityName: string,
  storeData: ReturnType<typeof useAppStore.getState>,
): Metrics {
  const { users, implementationLogs, fidelityChecks, studentDataRecords, adaptations } = storeData
  const teachers = users.filter(u => schoolIds.includes(u.schoolId) && (u.role === 'teacher' || u.role === 'paraprofessional'))
  const teacherIds = new Set(teachers.map(u => u.id))
  const logs = implementationLogs.filter(l => schoolIds.includes(l.schoolId))
  const logIds = new Set(logs.map(l => l.id))
  const checks = fidelityChecks.filter(f => teacherIds.has(f.teacherId))
  const records = studentDataRecords.filter(r => r.schoolId && schoolIds.includes(r.schoolId))
  const adaptList = adaptations.filter(a => logIds.has(a.logId))
  const fidScores = checks.map(c => (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5)
  const completedLogs = logs.filter(l => l.lessonCompletion === 'fully')
  return {
    id: entityId, name: entityName,
    teacherCount: teachers.length,
    logCount: logs.length,
    completionRate: logs.length ? Math.round((completedLogs.length / logs.length) * 100) : null,
    avgFidelity: fidScores.length ? parseFloat((fidScores.reduce((a, b) => a + b, 0) / fidScores.length * 20).toFixed(1)) : null,
    avgStudentScore: records.length ? Math.round(records.reduce((s, r) => s + r.currentAvg, 0) / records.length) : null,
    adaptationCount: adaptList.length,
  }
}

function MetricBar({ value, max, peers }: { value: number | null; max: number | null; peers: (number | null)[] }) {
  if (value === null) return <span className="text-gray-300 text-xs">—</span>
  const allVals = peers.filter((v): v is number => v !== null)
  const peak = max ?? (allVals.length ? Math.max(...allVals) : 1)
  const pct = peak > 0 ? Math.round((value / peak) * 100) : 0
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: roleColor }} />
    </div>
  )
}

function CompareTable({ entities }: { entities: Metrics[] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide w-44">Metric</th>
              {entities.map(e => (
                <th key={e.id} className="text-left py-3 px-4 text-xs font-semibold text-gray-700">{e.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {METRIC_DEFS.map(def => {
              const vals = entities.map(e => e[def.key])
              const numVals = vals.filter((v): v is number => v !== null)
              const best = numVals.length > 1 ? Math.max(...numVals) : null
              return (
                <tr key={def.key} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-xs font-medium text-gray-500">{def.label}</td>
                  {entities.map(e => {
                    const val = e[def.key]
                    const isBest = best !== null && val === best
                    return (
                      <td key={e.id} className="py-3 px-4">
                        <div className="space-y-1.5">
                          <span className={`text-sm font-semibold ${isBest ? 'text-purple-600' : 'text-gray-800'}`}>
                            {val !== null ? `${val}${def.unit}` : '—'}
                          </span>
                          <MetricBar value={val} max={def.max} peers={vals} />
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3 px-4"><span className="font-semibold" style={{ color: roleColor }}>Highlighted</span> = highest value among entities shown</p>
    </Card>
  )
}

function DistrictsTab() {
  const storeData = useAppStore()
  const entities = useMemo(() => districts.map(d => {
    const distSchoolIds = schools.filter(s => s.districtId === d.id).map(s => s.id)
    return computeEntityMetrics(distSchoolIds, d.id, d.name, storeData)
  }), [storeData])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entities.map(e => (
          <Card key={e.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}18` }}>
                <Building2 size={18} style={{ color: roleColor }} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{e.name}</p>
                <p className="text-xs text-gray-400">{schools.filter(s => districts.find(d => d.id === e.id)?.id === s.districtId).length} schools · {e.teacherCount} teachers</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[{ l: 'Logs', v: e.logCount, u: '' }, { l: 'Completion', v: e.completionRate, u: '%' }, { l: 'Avg Fidelity', v: e.avgFidelity, u: '%' }].map(({ l, v, u }) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-base font-bold text-gray-900">{v !== null ? `${v}${u}` : '—'}</p>
                  <p className="text-xs text-gray-400">{l}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <CompareTable entities={entities} />
    </div>
  )
}

function SchoolsTab() {
  const [selectedDistrict, setSelectedDistrict] = useState('dist1')
  const storeData = useAppStore()
  const navigate = useNavigate()
  const districtSchools = schools.filter(s => s.districtId === selectedDistrict)
  const entities = useMemo(() =>
    districtSchools.map(s => computeEntityMetrics([s.id], s.id, s.name, storeData)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [selectedDistrict, storeData])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {districts.map(d => (
          <button key={d.id} onClick={() => setSelectedDistrict(d.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer"
            style={{
              borderColor: selectedDistrict === d.id ? roleColor : '#E5E7EB',
              backgroundColor: selectedDistrict === d.id ? roleColor : '#FFFFFF',
              color: selectedDistrict === d.id ? '#FFFFFF' : '#6B7280',
            }}>
            {d.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entities.map(e => (
          <Card key={e.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}18` }}>
                <School size={18} style={{ color: roleColor }} />
              </div>
              <p className="text-sm font-bold text-gray-900">{e.name}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[{ l: 'Teachers', v: e.teacherCount, u: '' }, { l: 'Logs', v: e.logCount, u: '' }, { l: 'Fidelity', v: e.avgFidelity, u: '%' }].map(({ l, v, u }) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-base font-bold text-gray-900">{v !== null ? `${v}${u}` : '—'}</p>
                  <p className="text-xs text-gray-400">{l}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/researcher/data-browser', { state: { schoolId: e.id } })}
              className="flex items-center gap-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: roleColor }}>
              View Teachers <ArrowRight size={12} />
            </button>
          </Card>
        ))}
      </div>
      <CompareTable entities={entities} />
    </div>
  )
}

type Tab = 'districts' | 'schools'

export function DistrictComparison() {
  const [tab, setTab] = useState<Tab>('districts')
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}18` }}>
          <Building2 size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Districts &amp; Schools</h2>
          <p className="text-sm text-gray-500">Compare implementation data across districts and schools</p>
        </div>
      </div>
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['districts', 'schools'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'districts' ? 'Compare Districts' : 'Compare Schools'}
          </button>
        ))}
      </div>
      {tab === 'districts' ? <DistrictsTab /> : <SchoolsTab />}
    </div>
  )
}
