import { useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/useAppStore'
import { calcTeacherBreakdown, calcCoachBreakdown, calcAdminBreakdown } from '../../utils/incentiveCalc'

const roleColor = '#8B5CF6'

const tierColor = (r: number) => r >= 81 ? 'green' : r >= 71 ? 'blue' : r >= 60 ? 'amber' : 'red'

export function EarningsBreakdown() {
  const { users, implementationLogs, schools } = useAppStore()

  const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users])
  const coaches = useMemo(() => users.filter(u => u.role === 'coach'), [users])
  const admins = useMemo(() => users.filter(u => u.role === 'admin'), [users])

  const teacherRows = useMemo(() => teachers.map(t => calcTeacherBreakdown(t, implementationLogs)), [teachers, implementationLogs])
  const coachRows = useMemo(() => coaches.map(c => calcCoachBreakdown(c, users, implementationLogs)), [coaches, users, implementationLogs])
  const adminRows = useMemo(() => admins.map(a => calcAdminBreakdown(a, users, implementationLogs)), [admins, users, implementationLogs])

  const schoolTotals = useMemo(() => schools.map(s => {
    const t = teacherRows.filter(r => r.schoolId === s.id).reduce((sum, r) => sum + r.total, 0)
    const c = coachRows.filter(r => r.schoolId === s.id).reduce((sum, r) => sum + r.total, 0)
    const a = adminRows.filter(r => r.schoolId === s.id).reduce((sum, r) => sum + r.total, 0)
    return { ...s, teachersTotal: t, coachesTotal: c, adminsTotal: a, total: t + c + a }
  }), [schools, teacherRows, coachRows, adminRows])

  const districtTotal = schoolTotals.reduce((s, sc) => s + sc.total, 0)

  return (
    <div className="space-y-4">
      {/* District summary */}
      <Card title="District Totals">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">School</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Teachers</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Coaches</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Admins</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">School Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {schoolTotals.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{s.name}</td>
                  <td className="py-2.5 text-right text-gray-600">${s.teachersTotal}</td>
                  <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">${s.coachesTotal}</td>
                  <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">${s.adminsTotal}</td>
                  <td className="py-2.5 text-right font-bold text-gray-900">${s.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="py-2 text-xs font-bold text-gray-700 uppercase">District Total</td>
                <td colSpan={3} />
                <td className="py-2 text-right text-lg font-bold" style={{ color: roleColor }}>${districtTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Teacher breakdown */}
      <Card title="Teacher Earnings — All Schools">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">School</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Rate</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">2-Wk</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Base</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Bonus</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teacherRows.map(t => {
                const school = schools.find(s => s.id === t.schoolId)
                return (
                  <tr key={t.userId} className="hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{t.name}</td>
                    <td className="py-2.5 text-gray-500 text-xs hidden md:table-cell">{school?.name ?? t.schoolId}</td>
                    <td className="py-2.5 text-center"><Badge color={tierColor(t.logRate)}>{t.logRate}%</Badge></td>
                    <td className="py-2.5 text-center text-gray-500 hidden sm:table-cell">{t.twoWeekPerfect} × $5</td>
                    <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">$50</td>
                    <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">${t.twoWeekBonus + t.rateBonus}</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">${t.total}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Coach breakdown */}
      <Card title="Coach Earnings">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Coach</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Avg Rate</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Base</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Bonus</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coachRows.map(c => (
                <tr key={c.userId} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{c.name}</td>
                  <td className="py-2.5 text-center"><Badge color={tierColor(c.avgLogRate)}>{c.avgLogRate}%</Badge></td>
                  <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">$100</td>
                  <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">${c.rateBonus}</td>
                  <td className="py-2.5 text-right font-bold text-gray-900">${c.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Admin breakdown */}
      <Card title="Admin Earnings">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Admin</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">School</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">School Avg Rate</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Base</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Bonus</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adminRows.map(a => {
                const school = schools.find(s => s.id === a.schoolId)
                return (
                  <tr key={a.userId} className="hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-800">{a.name}</td>
                    <td className="py-2.5 text-gray-500 text-xs hidden md:table-cell">{school?.name ?? a.schoolId}</td>
                    <td className="py-2.5 text-center"><Badge color={tierColor(a.avgLogRate)}>{a.avgLogRate}%</Badge></td>
                    <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">$200</td>
                    <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">${a.rateBonus}</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">${a.total}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
