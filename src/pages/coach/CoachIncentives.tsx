import { useMemo } from 'react'
import { Award, Users, TrendingUp } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import { calcCoachBreakdown, calcTeacherBreakdown, rateTierLabel, calcLogRate } from '../../utils/incentiveCalc'

export function CoachIncentives() {
  const { currentUser, users, implementationLogs } = useAppStore()
  const roleColor = roleColors[currentUser.role]

  const teachers = useMemo(() => users.filter(u => u.role === 'teacher' && u.coachId === currentUser.id), [users, currentUser.id])

  const coachCalc = useMemo(
    () => calcCoachBreakdown(currentUser, users, implementationLogs),
    [currentUser, users, implementationLogs],
  )

  const teacherCalcs = useMemo(
    () => teachers.map(t => ({ ...calcTeacherBreakdown(t, implementationLogs), logRate: calcLogRate(implementationLogs, t.id) })),
    [teachers, implementationLogs],
  )

  const tierColor = (r: number) => r >= 81 ? 'green' : r >= 71 ? 'blue' : r >= 60 ? 'amber' : 'red'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <Award size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Incentives</h2>
          <p className="text-sm text-gray-500">Your semester earnings · {teachers.length} teachers in caseload</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Semester Total" value={`$${coachCalc.total}`} sub="Calculated" icon={<Award size={18} />} iconColor={roleColor} />
        <StatCard label="Base Pay" value="$100" sub="Participation" icon={<Award size={18} />} iconColor={roleColor} />
        <StatCard label="Log Rate Bonus" value={`$${coachCalc.rateBonus}`} sub={`${coachCalc.avgLogRate}% avg rate`} icon={<TrendingUp size={18} />} iconColor={roleColor} />
      </div>

      {/* My breakdown */}
      <Card title="My Semester Breakdown">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">Base Participation Incentive</p>
              <p className="text-xs text-gray-400">Per semester</p>
            </div>
            <span className="text-base font-bold text-gray-900">$100</span>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">Caseload Average Log Rate</p>
                <p className="text-xs text-gray-400">{rateTierLabel(coachCalc.avgLogRate, 'coach')}</p>
              </div>
              <Badge color={tierColor(coachCalc.avgLogRate)}>{coachCalc.avgLogRate}%</Badge>
            </div>
            <span className="text-base font-bold text-gray-900">${coachCalc.rateBonus}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm font-bold text-gray-900">Semester Total</p>
            <span className="text-xl font-bold" style={{ color: roleColor }}>${coachCalc.total}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p><strong>Log Rate Tiers (all-teacher avg):</strong> 81–100% → +$30 · 71–80% → +$20 · 60–70% → +$10</p>
        </div>
      </Card>

      {/* Caseload teacher earnings */}
      <Card title="Caseload Teacher Earnings">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} style={{ color: roleColor }} />
          <span className="text-xs text-gray-500">Individual teacher semester projections</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Log Rate</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">2-Wk Periods</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Base</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teacherCalcs.map(t => (
                <tr key={t.userId} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{t.name}</td>
                  <td className="py-2.5 text-center">
                    <Badge color={tierColor(t.logRate)}>{t.logRate}%</Badge>
                  </td>
                  <td className="py-2.5 text-center text-gray-600 hidden sm:table-cell">{t.twoWeekPerfect} × $5</td>
                  <td className="py-2.5 text-center text-gray-600 hidden sm:table-cell">$50</td>
                  <td className="py-2.5 text-right font-bold text-gray-800">${t.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200">
                <td colSpan={4} className="py-2 text-xs font-semibold text-gray-400 uppercase">Caseload Total</td>
                <td className="py-2 text-right font-bold text-gray-900">
                  ${teacherCalcs.reduce((s, t) => s + t.total, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
