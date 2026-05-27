import { useMemo } from 'react'
import { Award, CheckCircle, TrendingUp, Calendar } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import { calcTeacherBreakdown, rateTierLabel } from '../../utils/incentiveCalc'

export function MyIncentives() {
  const { currentUser, implementationLogs, incentives } = useAppStore()
  const roleColor = roleColors[currentUser.role]

  const calc = useMemo(
    () => calcTeacherBreakdown(currentUser, implementationLogs),
    [currentUser, implementationLogs],
  )

  const history = useMemo(
    () => incentives.filter(i => i.recipientId === currentUser.id).sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)),
    [incentives, currentUser.id],
  )

  const tierColor = calc.logRate >= 81 ? 'green' : calc.logRate >= 71 ? 'blue' : calc.logRate >= 60 ? 'amber' : 'red'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <Award size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Incentives</h2>
          <p className="text-sm text-gray-500">Current semester formula-based earnings</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Semester Total" value={`$${calc.total}`} sub="Calculated" icon={<Award size={18} />} iconColor={roleColor} />
        <StatCard label="Base Pay" value="$50" sub="Participation" icon={<CheckCircle size={18} />} iconColor={roleColor} />
        <StatCard label="2-Week Bonus" value={`$${calc.twoWeekBonus}`} sub={`${calc.twoWeekPerfect} perfect periods`} icon={<Calendar size={18} />} iconColor={roleColor} />
        <StatCard label="Log Rate Bonus" value={`$${calc.rateBonus}`} sub={`${calc.logRate}% rate`} icon={<TrendingUp size={18} />} iconColor={roleColor} />
      </div>

      {/* Formula breakdown */}
      <Card title="Semester Breakdown">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">Base Participation Incentive</p>
              <p className="text-xs text-gray-400">Per semester</p>
            </div>
            <span className="text-base font-bold text-gray-900">$50</span>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">2-Week 100% Log Bonus</p>
              <p className="text-xs text-gray-400">
                {calc.twoWeekPerfect} perfect period{calc.twoWeekPerfect !== 1 ? 's' : ''} × $5
              </p>
            </div>
            <span className="text-base font-bold text-gray-900">${calc.twoWeekBonus}</span>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">Log Rate Tier Bonus</p>
                <p className="text-xs text-gray-400">{rateTierLabel(calc.logRate, 'teacher')}</p>
              </div>
              <Badge color={tierColor}>{calc.logRate}%</Badge>
            </div>
            <span className="text-base font-bold text-gray-900">${calc.rateBonus}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm font-bold text-gray-900">Semester Total</p>
            <span className="text-xl font-bold" style={{ color: roleColor }}>${calc.total}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p><strong>Log Rate Tiers:</strong> 81–100% → +$30 · 71–80% → +$20 · 60–70% → +$10</p>
          <p><strong>2-Week Bonus:</strong> $5 per 2-week window with 100% fully-completed logs</p>
        </div>
      </Card>

      {/* Historical awards */}
      {history.length > 0 && (
        <Card title="Award History">
          <div className="space-y-3">
            {history.map(inc => (
              <div key={inc.id} className="flex items-start justify-between gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white capitalize" style={{ backgroundColor: roleColor }}>
                      {inc.category}
                    </span>
                    <span className="text-xs text-gray-400">{inc.awardedAt}</span>
                  </div>
                  <p className="text-sm text-gray-600">{inc.reason}</p>
                </div>
                <span className="text-base font-bold text-gray-800 flex-shrink-0">${inc.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
