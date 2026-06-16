import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'

export type DrillTab = 'fidelity' | 'adaptations' | 'students'

const tierBadge: Record<string, 'green' | 'blue' | 'purple' | 'red'> = {
  'Tier 1': 'green', 'Tier 2': 'blue', 'Tier 3': 'purple', 'Special Education': 'red',
}

const DIMS = ['adherence', 'dosage', 'quality', 'responsiveness', 'confidence'] as const
type Dim = typeof DIMS[number]

export function TeacherDrillDetail({ teacherId, tab, roleColor }: { teacherId: string; tab: DrillTab; roleColor: string }) {
  const { users, fidelityChecks, adaptations, studentDataRecords } = useAppStore()
  const teacher = users.find(u => u.id === teacherId)

  const myChecks = useMemo(() => fidelityChecks.filter(c => c.teacherId === teacherId), [fidelityChecks, teacherId])
  const myAdaptations = useMemo(() => adaptations.filter(a => a.teacherId === teacherId), [adaptations, teacherId])
  const myRecords = useMemo(() => studentDataRecords.filter(r => r.teacherId === teacherId), [studentDataRecords, teacherId])

  const avgFidelity = myChecks.length
    ? Math.round(myChecks.reduce((s, c) => s + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / myChecks.length * 20)
    : 0

  const dimData = DIMS.map(d => ({
    dim: d.slice(0, 4).toUpperCase(),
    value: myChecks.length ? Math.round(myChecks.reduce((s, c) => s + (c[d as Dim] as number), 0) / myChecks.length * 20) : 0,
  }))

  const reasonCounts: Record<string, number> = {}
  myAdaptations.forEach(a => a.reasons.forEach(r => { reasonCounts[r] = (reasonCounts[r] ?? 0) + 1 }))
  const reasonData = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 22) + '…' : name, count }))

  const consistentPct = myAdaptations.length
    ? Math.round(myAdaptations.filter(a => a.fidelityType === 'consistent').length / myAdaptations.length * 100)
    : 0

  const tierData = ['Tier 1', 'Tier 2', 'Tier 3', 'Special Education'].map(tier => {
    const recs = myRecords.filter(r => r.mtssTier === tier)
    return { tier: tier.replace('Tier ', 'T').replace('Special Education', 'SpEd'), avg: recs.length ? Math.round(recs.reduce((s, r) => s + r.currentAvg, 0) / recs.length) : 0, count: recs.length }
  }).filter(d => d.count > 0)

  const avgScore = myRecords.length ? Math.round(myRecords.reduce((s, r) => s + r.currentAvg, 0) / myRecords.length) : 0

  if (tab === 'fidelity') return (
    <div className="space-y-4">
      <div className="px-1 pb-1">
        <p className="text-xs text-gray-500">Teacher: <span className="font-semibold text-gray-800">{teacher?.name}</span></p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Fidelity" value={`${avgFidelity}%`} color={roleColor} />
        <StatCard label="Checks" value={String(myChecks.length)} color={roleColor} />
      </div>
      <Card title="Fidelity by Dimension">
        {myChecks.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No fidelity checks.</p> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dimData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="dim" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => [`${Number(v)}%`, 'Fidelity']} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" fill={roleColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )

  if (tab === 'adaptations') return (
    <div className="space-y-4">
      <div className="px-1 pb-1">
        <p className="text-xs text-gray-500">Teacher: <span className="font-semibold text-gray-800">{teacher?.name}</span></p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Adaptations" value={String(myAdaptations.length)} color={roleColor} />
        <StatCard label="Consistent" value={`${consistentPct}%`} color="#10B981" />
      </div>
      <Card title="Top Adaptation Reasons">
        {reasonData.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No adaptations.</p> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={reasonData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="count" fill={roleColor} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="px-1 pb-1">
        <p className="text-xs text-gray-500">Teacher: <span className="font-semibold text-gray-800">{teacher?.name}</span></p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Score" value={`${avgScore}%`} color={roleColor} />
        <StatCard label="Records" value={String(myRecords.length)} color={roleColor} />
      </div>
      {tierData.length > 0 && (
        <Card title="Avg Score by MTSS Tier">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={tierData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => [`${Number(v)}%`, 'Avg Score']} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="avg" fill={roleColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
      <Card padding="none">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Records</p>
        </div>
        <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
          {myRecords.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">No student data.</p>
            : myRecords.slice(0, 20).map(r => (
              <div key={r.id} className="px-4 py-2.5 flex items-center gap-3">
                <Badge color={tierBadge[r.mtssTier] ?? 'blue'}>{r.mtssTier}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{r.date} · {r.measureType}</p>
                </div>
                <span className="text-sm font-semibold text-gray-800">{r.currentAvg}%</span>
              </div>
            ))
          }
        </div>
      </Card>
    </div>
  )
}
