import { useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import { getSemester, filterLogsBySemester } from '../../utils/incentiveCalc'
import type { IncentiveCategory } from '../../types'

const roleColor = roleColors.researcher

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

interface Props {
  semester: string
  onAward: (id: string, role: 'teacher' | 'coach') => void
}

export function AwardHistoryTab({ semester, onAward }: Props) {
  const { users, schools, implementationLogs, fidelityChecks, trainingAttendances, incentives } = useAppStore()

  const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users])
  const coaches = useMemo(() => users.filter(u => u.role === 'coach'), [users])
  const schoolName = useMemo(
    () => Object.fromEntries(schools.map(s => [s.id, s.name.replace(' School', '').replace(' Middle', '')])),
    [schools],
  )

  const semLogs = useMemo(() => filterLogsBySemester(implementationLogs, semester), [implementationLogs, semester])

  const semApproved = useMemo(
    () => incentives.filter(i => getSemester(i.awardedAt) === semester && i.status === 'approved'),
    [incentives, semester],
  )

  const recentAwards = useMemo(
    () => [...semApproved].sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)).slice(0, 8),
    [semApproved],
  )

  const teacherAwards = useMemo(() => semApproved.filter(i => i.recipientRole === 'teacher'), [semApproved])
  const coachAwards = useMemo(() => semApproved.filter(i => i.recipientRole === 'coach'), [semApproved])

  const teacherStats = useMemo(() => teachers.map(t => {
    const checks = fidelityChecks.filter(c => c.teacherId === t.id && getSemester(c.date) === semester)
    const avgFidelity = checks.length
      ? +(checks.reduce((s, c) => s + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / checks.length).toFixed(1)
      : 0
    return {
      ...t,
      logCount: semLogs.filter(l => l.teacherId === t.id).length,
      avgFidelity,
      trainings: trainingAttendances.filter(a => a.teacherId === t.id && getSemester(a.checkedInAt) === semester).length,
      totalAwards: teacherAwards.filter(i => i.recipientId === t.id).reduce((s, i) => s + i.amount, 0),
    }
  }), [teachers, semLogs, fidelityChecks, trainingAttendances, teacherAwards, semester])

  const coachStats = useMemo(() => coaches.map(c => ({
    ...c,
    totalAwards: coachAwards.filter(i => i.recipientId === c.id).reduce((s, i) => s + i.amount, 0),
    count: coachAwards.filter(i => i.recipientId === c.id).length,
  })), [coaches, coachAwards])

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title={`Teacher Tracker — ${semester}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Logs</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Fidelity</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Training</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Awards</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teacherStats.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="py-2.5">
                      <p className="font-medium text-gray-800">{t.name.split(' ')[0]}</p>
                      <p className="text-xs text-gray-400">{schoolName[t.schoolId]}</p>
                    </td>
                    <td className="py-2.5 text-center text-gray-600">{t.logCount}</td>
                    <td className="py-2.5 text-center font-medium" style={{ color: t.avgFidelity >= 4 ? '#10B981' : t.avgFidelity >= 3.5 ? '#F59E0B' : '#EF4444' }}>
                      {t.avgFidelity > 0 ? `${Math.round(t.avgFidelity * 20)}%` : '—'}
                    </td>
                    <td className="py-2.5 text-center text-gray-600">{t.trainings}</td>
                    <td className="py-2.5 text-center font-semibold text-gray-800">${t.totalAwards}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => onAward(t.id, 'teacher')} className="text-xs px-2.5 py-1 rounded-md text-white cursor-pointer" style={{ backgroundColor: roleColor }}>
                        Award
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title={`Recent Awards — ${semester}`}>
          {recentAwards.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No approved awards for {semester}.</p>
          ) : (
            <div className="space-y-3">
              {recentAwards.map(inc => (
                <div key={inc.id} className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: CAT_COLORS[inc.category] }}>
                        {CAT_LABELS[inc.category]}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium capitalize">{inc.recipientRole}</span>
                      <span className="text-sm font-medium text-gray-800">{inc.recipientName.split(' ')[0]}</span>
                      <span className="text-xs text-gray-400">{inc.awardedAt}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{inc.reason}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-800 flex-shrink-0">${inc.amount}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title={`Coach Tracker — ${semester}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Coach</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Awards</th>
                <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Total Earned</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coachStats.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-2.5">
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{schoolName[c.schoolId]}</p>
                  </td>
                  <td className="py-2.5 text-center text-gray-600">{c.count}</td>
                  <td className="py-2.5 text-center font-semibold text-gray-800">${c.totalAwards}</td>
                  <td className="py-2.5 text-right">
                    <button onClick={() => onAward(c.id, 'coach')} className="text-xs px-2.5 py-1 rounded-md text-white cursor-pointer" style={{ backgroundColor: roleColor }}>
                      Award
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
