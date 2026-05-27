import { useMemo } from 'react'
import { Award, TrendingUp, Users } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import { calcAdminBreakdown, calcTeacherBreakdown, rateTierLabel, calcLogRate } from '../../utils/incentiveCalc'

export function AdminIncentives() {
  const { currentUser, users, implementationLogs, schools } = useAppStore()
  const roleColor = roleColors[currentUser.role]

  const schoolTeachers = useMemo(
    () => users.filter(u => u.role === 'teacher' && u.schoolId === currentUser.schoolId),
    [users, currentUser.schoolId],
  )

  const adminCalc = useMemo(
    () => calcAdminBreakdown(currentUser, users, implementationLogs),
    [currentUser, users, implementationLogs],
  )

  const teacherCalcs = useMemo(
    () => schoolTeachers.map(t => ({ ...calcTeacherBreakdown(t, implementationLogs), logRate: calcLogRate(implementationLogs, t.id) })),
    [schoolTeachers, implementationLogs],
  )

  const schoolName = schools.find(s => s.id === currentUser.schoolId)?.name ?? currentUser.schoolId
  const tierColor = (r: number) => r >= 81 ? 'green' : r >= 71 ? 'blue' : r >= 60 ? 'amber' : 'red'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <Award size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Incentives</h2>
          <p className="text-sm text-gray-500">{schoolName} · Semester earnings</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Semester Total" value={`$${adminCalc.total}`} sub="Calculated" icon={<Award size={18} />} iconColor={roleColor} />
        <StatCard label="Base Pay" value="$200" sub="Participation" icon={<Award size={18} />} iconColor={roleColor} />
        <StatCard label="Log Rate Bonus" value={`$${adminCalc.rateBonus}`} sub={`${adminCalc.avgLogRate}% school avg`} icon={<TrendingUp size={18} />} iconColor={roleColor} />
      </div>

      <Card title="My Semester Breakdown">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">Base Participation Incentive</p>
              <p className="text-xs text-gray-400">Per semester</p>
            </div>
            <span className="text-base font-bold text-gray-900">$200</span>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">School Average Log Rate</p>
                <p className="text-xs text-gray-400">{rateTierLabel(adminCalc.avgLogRate, 'admin')}</p>
              </div>
              <Badge color={tierColor(adminCalc.avgLogRate)}>{adminCalc.avgLogRate}%</Badge>
            </div>
            <span className="text-base font-bold text-gray-900">${adminCalc.rateBonus}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm font-bold text-gray-900">Semester Total</p>
            <span className="text-xl font-bold" style={{ color: roleColor }}>${adminCalc.total}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p><strong>Log Rate Tiers (all-school teacher avg):</strong> 81–100% → +$100 · 71–80% → +$80 · 60–70% → +$50</p>
        </div>
      </Card>

      <Card title={`${schoolName} Teacher Log Rates`}>
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} style={{ color: roleColor }} />
          <span className="text-xs text-gray-500">
            School average: <strong>{adminCalc.avgLogRate}%</strong> · determines your rate bonus
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Log Rate</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">2-Wk Periods</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Semester</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teacherCalcs.map(t => (
                <tr key={t.userId} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{t.name}</td>
                  <td className="py-2.5 text-center">
                    <Badge color={tierColor(t.logRate)}>{t.logRate}%</Badge>
                  </td>
                  <td className="py-2.5 text-center text-gray-500 hidden sm:table-cell">{t.twoWeekPerfect}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-800">${t.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
