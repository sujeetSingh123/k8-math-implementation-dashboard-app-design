import { useState } from 'react'
import { EarningsGroup } from './EarningsGroup'
import { Badge } from '../../components/ui/Badge'
import type { TeacherBreakdown, CoachBreakdown, AdminBreakdown } from '../../utils/incentiveCalc'

const tierColor = (r: number) => r >= 81 ? 'green' : r >= 71 ? 'blue' : r >= 60 ? 'amber' : 'red'

type Role = 'teachers' | 'coaches' | 'admins'

interface Props {
  schoolName: string
  teachers: TeacherBreakdown[]
  coaches: CoachBreakdown[]
  admins: AdminBreakdown[]
  color: string
}

export function SchoolEarningsGroup({ schoolName, teachers, coaches, admins, color }: Props) {
  const [schoolOpen, setSchoolOpen] = useState(false)
  const [openRoles, setOpenRoles] = useState<Set<Role>>(new Set())

  const toggleRole = (r: Role) => setOpenRoles(prev => {
    const next = new Set(prev)
    if (next.has(r)) next.delete(r)
    else next.add(r)
    return next
  })

  const teachersTotal = teachers.reduce((s, t) => s + t.total, 0)
  const coachesTotal = coaches.reduce((s, c) => s + c.total, 0)
  const adminsTotal = admins.reduce((s, a) => s + a.total, 0)

  return (
    <EarningsGroup title={schoolName} total={teachersTotal + coachesTotal + adminsTotal} color={color}
      expanded={schoolOpen} onToggle={() => setSchoolOpen(v => !v)}>
      <div className="pl-4 divide-y divide-gray-50">
        <EarningsGroup title="Teachers" total={teachersTotal} color={color}
          expanded={openRoles.has('teachers')} onToggle={() => toggleRole('teachers')}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teachers.map(t => (
                <tr key={t.userId} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{t.name}</td>
                  <td className="py-2.5 text-right font-bold text-gray-900">${t.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </EarningsGroup>

        <EarningsGroup title="Coaches" total={coachesTotal} color={color}
          expanded={openRoles.has('coaches')} onToggle={() => toggleRole('coaches')}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Coach</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coaches.map(c => (
                <tr key={c.userId} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{c.name}</td>
                  <td className="py-2.5 text-right font-bold text-gray-900">${c.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </EarningsGroup>

        <EarningsGroup title="Admins" total={adminsTotal} color={color}
          expanded={openRoles.has('admins')} onToggle={() => toggleRole('admins')}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Admin</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">School Avg Rate</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Base</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Bonus</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map(a => (
                <tr key={a.userId} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-800">{a.name}</td>
                  <td className="py-2.5 text-center"><Badge color={tierColor(a.avgLogRate)}>{a.avgLogRate}%</Badge></td>
                  <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">$200</td>
                  <td className="py-2.5 text-right text-gray-600 hidden sm:table-cell">${a.rateBonus}</td>
                  <td className="py-2.5 text-right font-bold text-gray-900">${a.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </EarningsGroup>
      </div>
    </EarningsGroup>
  )
}
