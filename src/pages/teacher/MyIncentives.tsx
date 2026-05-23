import { useMemo } from 'react'
import { Award } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import type { IncentiveCategory } from '../../types'

const CAT_COLORS: Record<IncentiveCategory, string> = {
  training: '#3B82F6',
  performance: '#10B981',
  logging: '#F59E0B',
}

const CAT_LABELS: Record<IncentiveCategory, string> = {
  training: 'Training',
  performance: 'Performance',
  logging: 'Logging',
}

export function MyIncentives() {
  const { currentUser, incentives } = useAppStore()
  const roleColor = roleColors[currentUser.role]

  const myIncentives = useMemo(() =>
    incentives.filter(i => i.recipientId === currentUser.id).sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)),
    [incentives, currentUser.id],
  )

  const totalEarned = myIncentives.reduce((s, i) => s + i.amount, 0)

  const byCategory = useMemo(() => {
    const cats: Record<IncentiveCategory, number> = { training: 0, performance: 0, logging: 0 }
    myIncentives.forEach(i => { cats[i.category] += i.amount })
    return cats
  }, [myIncentives])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <Award size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Incentives</h2>
          <p className="text-sm text-gray-500">Incentives earned across all categories</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Earned" value={`$${totalEarned.toLocaleString()}`} color={roleColor} />
        <StatCard label="Training" value={`$${byCategory.training}`} color={CAT_COLORS.training} />
        <StatCard label="Performance" value={`$${byCategory.performance}`} color={CAT_COLORS.performance} />
        <StatCard label="Logging" value={`$${byCategory.logging}`} color={CAT_COLORS.logging} />
      </div>

      <Card title="Incentive History">
        {myIncentives.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">No incentives awarded yet.</p>
        ) : (
          <div className="space-y-3">
            {myIncentives.map(inc => (
              <div key={inc.id} className="flex items-start justify-between gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: CAT_COLORS[inc.category] }}>
                      {CAT_LABELS[inc.category]}
                    </span>
                    <span className="text-xs text-gray-400">{inc.awardedAt}</span>
                  </div>
                  <p className="text-sm text-gray-600">{inc.reason}</p>
                </div>
                <span className="text-base font-bold text-gray-800 flex-shrink-0">${inc.amount}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
