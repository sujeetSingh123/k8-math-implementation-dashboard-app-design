import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import type { ImplementationLog, FidelityCheck, Adaptation } from '../../types'

const TIERS = ['Tier 1', 'Tier 2', 'Tier 3', 'Special Education'] as const
type Tier = typeof TIERS[number]

const TIER_COLOR: Record<Tier, string> = {
  'Tier 1': '#10B981',
  'Tier 2': '#F59E0B',
  'Tier 3': '#EF4444',
  'Special Education': '#8B5CF6',
}

const TIER_PILL: Record<Tier, string> = {
  'Tier 1': 'bg-emerald-50 text-emerald-700',
  'Tier 2': 'bg-amber-50 text-amber-700',
  'Tier 3': 'bg-red-50 text-red-600',
  'Special Education': 'bg-purple-50 text-purple-700',
}

export function TierBreakdown({ logs, checks, adaptations }: {
  logs: ImplementationLog[]
  checks: FidelityCheck[]
  adaptations: Adaptation[]
}) {
  const navigate = useNavigate()
  const activeTiers = TIERS.filter(t => logs.some(l => l.tier === t))
  if (activeTiers.length === 0) return null

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Tier Breakdown</h3>
        <button onClick={() => navigate('/teacher/log')} className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer">
          Log entry →
        </button>
      </div>
      <div className="space-y-4">
        {activeTiers.map(tier => {
          const tierLogs = logs.filter(l => l.tier === tier)
          const fullyCount = tierLogs.filter(l => l.lessonCompletion === 'fully').length
          const completionPct = Math.round((fullyCount / tierLogs.length) * 100)
          const tierLogIds = new Set(tierLogs.map(l => l.id))
          const tierChecks = checks.filter(c => c.logId && tierLogIds.has(c.logId))
          const avgFidelity = tierChecks.length > 0
            ? (tierChecks.reduce((sum, c) =>
                sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0
              ) / tierChecks.length).toFixed(1)
            : '—'
          const adaptCount = adaptations.filter(a => tierLogIds.has(a.logId)).length
          const color = TIER_COLOR[tier]

          return (
            <div key={tier}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${TIER_PILL[tier]}`}>
                  {tier}
                </span>
                <div className="flex-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{tierLogs.length} logs · <span className="font-medium text-gray-700">{completionPct}%</span> fully completed</span>
                  <span>{adaptCount} adaptation{adaptCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex-shrink-0 text-right w-16">
                  <span className="text-sm font-bold text-gray-800">{avgFidelity}</span>
                  <span className="text-xs text-gray-400"> / 5</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%`, backgroundColor: color }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
        <span>Bar = lesson completion rate</span>
        <span>Score = avg fidelity (1–5)</span>
      </div>
    </Card>
  )
}
