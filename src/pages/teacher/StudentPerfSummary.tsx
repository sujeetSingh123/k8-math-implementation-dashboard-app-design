import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.teacher

const tierOrder = ['Tier 1', 'Tier 2', 'Tier 3', 'SPED'] as const

export function StudentPerfSummary() {
  const { currentUser, studentDataRecords } = useAppStore()

  const myRecords = useMemo(
    () => studentDataRecords.filter(r => r.teacherId === currentUser.id),
    [studentDataRecords, currentUser.id],
  )

  const tierRows = useMemo(() => {
    return tierOrder.map(tier => {
      const recs = myRecords.filter(r => r.mtssTier === tier)
      if (!recs.length) return null
      const latest = [...recs].sort((a, b) => b.date.localeCompare(a.date))
      const uniqueLatest = Object.values(
        Object.fromEntries(latest.map(r => [r.mtssTier + r.grade, r]))
      )
      const avgScore = (uniqueLatest.reduce((s, r) => s + r.currentAvg, 0) / uniqueLatest.length).toFixed(1)
      const avgGrowth = (uniqueLatest.reduce((s, r) => s + (r.growth ?? 0), 0) / uniqueLatest.length).toFixed(1)
      const atBench = Math.round(uniqueLatest.reduce((s, r) => s + r.atOrAboveBenchmark, 0) / uniqueLatest.length)
      return { tier, avgScore, avgGrowth: +avgGrowth, atBench, n: uniqueLatest.length }
    }).filter(Boolean) as { tier: string; avgScore: string; avgGrowth: number; atBench: number; n: number }[]
  }, [myRecords])

  if (!tierRows.length) return null

  const overallAvgScore = (tierRows.reduce((s, r) => s + parseFloat(r.avgScore), 0) / tierRows.length).toFixed(1)
  const overallAtBench = Math.round(tierRows.reduce((s, r) => s + r.atBench, 0) / tierRows.length)

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={15} style={{ color: roleColor }} />
        <p className="text-sm font-semibold text-gray-800">Students' Aggregated Performance</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-50 rounded-lg px-3 py-2 text-center">
          <p className="text-lg font-bold text-emerald-700">{overallAvgScore}%</p>
          <p className="text-xs text-gray-400">Avg Score</p>
        </div>
        <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
          <p className="text-lg font-bold text-blue-700">{overallAtBench}%</p>
          <p className="text-xs text-gray-400">At/Above Benchmark</p>
        </div>
      </div>
      <div className="space-y-2">
        {tierRows.map(r => (
          <div key={r.tier} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
            <span className="font-medium text-gray-700 w-16">{r.tier}</span>
            <span className="text-gray-500">Avg: <span className="font-semibold text-gray-700">{r.avgScore}%</span></span>
            <span className="text-gray-500">Growth: <span className="font-semibold text-emerald-600">+{r.avgGrowth}</span></span>
            <span className="text-gray-500">Bench: <span className="font-semibold" style={{ color: roleColor }}>{r.atBench}%</span></span>
          </div>
        ))}
      </div>
    </Card>
  )
}
