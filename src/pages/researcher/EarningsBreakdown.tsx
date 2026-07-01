import { useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { MonthlyAwardTable } from './MonthlyAwardTable'
import { SchoolEarningsGroup } from './SchoolEarningsGroup'
import { useAppStore } from '../../store/useAppStore'
import {
  calcTeacherBreakdown, calcCoachBreakdown, calcAdminBreakdown,
  filterLogsByMonth, filterFidelityByMonth, formatMonthLabel, getSemesterMonths,
  filterLogsBySemester, filterFidelityBySemester,
} from '../../utils/incentiveCalc'

const roleColor = '#8B5CF6'

interface Props { semester: string }

export function EarningsBreakdown({ semester }: Props) {
  const { users, implementationLogs, fidelityChecks, schools } = useAppStore()

  const months = useMemo(() => getSemesterMonths(semester), [semester])

  const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users])
  const coaches = useMemo(() => users.filter(u => u.role === 'coach'), [users])
  const admins = useMemo(() => users.filter(u => u.role === 'admin'), [users])

  // ── Per-month "amount to award" breakdown across the semester ──────────────
  const monthlyBreakdown = useMemo(() => months.map(m => {
    const mLogs = filterLogsByMonth(implementationLogs, m)
    const mChecks = filterFidelityByMonth(fidelityChecks, m)
    const teacherTotal = teachers.reduce((s, t) => s + calcTeacherBreakdown(t, mLogs).total, 0)
    const coachTotal = coaches.reduce((s, c) => s + calcCoachBreakdown(c, users, mLogs, mChecks).total, 0)
    const adminTotal = admins.reduce((s, a) => s + calcAdminBreakdown(a, users, mLogs).total, 0)
    return { month: m, label: formatMonthLabel(m), teacherTotal, coachTotal, adminTotal, total: teacherTotal + coachTotal + adminTotal }
  }), [months, implementationLogs, fidelityChecks, teachers, coaches, admins, users])

  const semesterTotal = monthlyBreakdown.reduce((s, m) => s + m.total, 0)

  // ── Semester-wide earnings, nested per school ────────────────────────────
  const semLogs = useMemo(() => filterLogsBySemester(implementationLogs, semester), [implementationLogs, semester])
  const semChecks = useMemo(() => filterFidelityBySemester(fidelityChecks, semester), [fidelityChecks, semester])

  const teacherRows = useMemo(() => teachers.map(t => calcTeacherBreakdown(t, semLogs)), [teachers, semLogs])
  const coachRows = useMemo(() => coaches.map(c => calcCoachBreakdown(c, users, semLogs, semChecks)), [coaches, users, semLogs, semChecks])
  const adminRows = useMemo(() => admins.map(a => calcAdminBreakdown(a, users, semLogs)), [admins, users, semLogs])

  const schoolBreakdowns = useMemo(() => schools.map(s => ({
    id: s.id,
    name: s.name,
    teachers: teacherRows.filter(r => r.schoolId === s.id),
    coaches: coachRows.filter(r => r.schoolId === s.id),
    admins: adminRows.filter(r => r.schoolId === s.id),
  })), [schools, teacherRows, coachRows, adminRows])

  return (
    <div className="space-y-4">
      <MonthlyAwardTable semester={semester} rows={monthlyBreakdown} total={semesterTotal} color={roleColor} />

      <Card title={`Earnings — ${semester}`}>
        <div className="divide-y divide-gray-100">
          {schoolBreakdowns.map(s => (
            <SchoolEarningsGroup
              key={s.id}
              schoolName={s.name}
              teachers={s.teachers}
              coaches={s.coaches}
              admins={s.admins}
              color={roleColor}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
