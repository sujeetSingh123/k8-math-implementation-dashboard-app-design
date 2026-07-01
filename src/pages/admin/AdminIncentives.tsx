import { useState, useMemo } from 'react'
import { Award, Users, Clock, CheckCircle } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import { calcAdminBreakdown, calcTeacherBreakdown, rateTierLabel, calcLogRate, getSemester, filterLogsBySemester, currentSemester, sortSemesters } from '../../utils/incentiveCalc'
import type { TeacherBreakdown } from '../../utils/incentiveCalc'

export function AdminIncentives() {
  const { currentUser, users, implementationLogs, schools, incentives } = useAppStore()
  const roleColor = roleColors[currentUser.role]

  const schoolTeachers = useMemo(
    () => users.filter(u => u.role === 'teacher' && u.schoolId === currentUser.schoolId),
    [users, currentUser.schoolId],
  )

  const schoolUserIds = useMemo(
    () => new Set(users.filter(u => u.schoolId === currentUser.schoolId).map(u => u.id)),
    [users, currentUser.schoolId],
  )

  const schoolIncentives = useMemo(
    () => incentives.filter(i => schoolUserIds.has(i.recipientId)).sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)),
    [incentives, schoolUserIds],
  )

  const allTimeAwarded = useMemo(() => schoolIncentives.filter(i => i.status === 'approved').reduce((s, i) => s + i.amount, 0), [schoolIncentives])
  const allTimePending = useMemo(() => schoolIncentives.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0), [schoolIncentives])

  const semesters = useMemo(() => {
    const set = new Set<string>([currentSemester()])
    schoolIncentives.forEach(i => set.add(getSemester(i.awardedAt)))
    return sortSemesters([...set])
  }, [schoolIncentives])

  const [selected, setSelected] = useState(() => currentSemester())
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherBreakdown | null>(null)

  const semLogs = useMemo(() => filterLogsBySemester(implementationLogs, selected), [implementationLogs, selected])
  const adminCalc = useMemo(() => calcAdminBreakdown(currentUser, users, semLogs), [currentUser, users, semLogs])
  const teacherCalcs = useMemo(
    () => schoolTeachers.map(t => ({ ...calcTeacherBreakdown(t, semLogs), logRate: calcLogRate(semLogs, t.id) })),
    [schoolTeachers, semLogs],
  )
  const semApproved = useMemo(() => schoolIncentives.filter(i => i.status === 'approved' && getSemester(i.awardedAt) === selected), [schoolIncentives, selected])
  const semPending  = useMemo(() => schoolIncentives.filter(i => i.status === 'pending'  && getSemester(i.awardedAt) === selected), [schoolIncentives, selected])

  const schoolName = schools.find(s => s.id === currentUser.schoolId)?.name ?? currentUser.schoolId
  const tc = (r: number) => r >= 81 ? 'green' : r >= 71 ? 'blue' : r >= 60 ? 'amber' : 'red'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <Award size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Incentives</h2>
          <p className="text-sm text-gray-500">{schoolName} — school-wide view</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="School Awarded" value={`$${allTimeAwarded}`} sub="All semesters" icon={<Award size={18} />} iconColor={roleColor} />
        <StatCard label="Pending Approval" value={`$${allTimePending}`} sub="Awaiting researcher" icon={<Clock size={18} />} iconColor="#F59E0B" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {semesters.map(s => (
          <button key={s} onClick={() => setSelected(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              selected === s ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={selected === s ? { backgroundColor: roleColor } : undefined}>
            {s}
          </button>
        ))}
      </div>

      <Card title={`${selected} — My Breakdown`}>
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
              <Badge color={tc(adminCalc.avgLogRate)}>{adminCalc.avgLogRate}%</Badge>
            </div>
            <span className="text-base font-bold text-gray-900">${adminCalc.rateBonus}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm font-bold text-gray-900">Formula Total</p>
            <span className="text-xl font-bold" style={{ color: roleColor }}>${adminCalc.total}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p><strong>Log Rate Tiers (school avg):</strong> 81–100% → +$100 · 71–80% → +$80 · 60–70% → +$50</p>
        </div>
      </Card>

      <Card title={`${schoolName} Teacher Log Rates — ${selected}`}>
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} style={{ color: roleColor }} />
          <span className="text-xs text-gray-500">School avg: <strong>{adminCalc.avgLogRate}%</strong> · determines your rate bonus</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase">Teacher</th>
              <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase">Log Rate</th>
              <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">2-Wk</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase">Semester</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teacherCalcs.map(t => (
              <tr key={t.userId} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTeacher(t)}>
                <td className="py-2.5 font-medium text-gray-800 hover:underline">{t.name}</td>
                <td className="py-2.5 text-center"><Badge color={tc(t.logRate)}>{t.logRate}%</Badge></td>
                <td className="py-2.5 text-center text-gray-500 hidden sm:table-cell">{t.twoWeekPerfect}</td>
                <td className="py-2.5 text-right font-semibold text-gray-800">${t.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title={`School Award History — ${selected}`}>
        {semPending.length === 0 && semApproved.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No incentives recorded for {selected}.</p>
        ) : (
          <div className="space-y-5">
            {semPending.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Clock size={11} /> To Be Awarded</p>
                {semPending.map(inc => (
                  <div key={inc.id} className="flex items-start justify-between gap-3 p-2.5 bg-amber-50 border border-amber-100 rounded-lg mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-medium text-gray-700">{inc.recipientName.split(' ')[0]}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white capitalize" style={{ backgroundColor: '#F59E0B' }}>{inc.category}</span>
                        <span className="text-xs text-gray-400">{inc.awardedAt}</span>
                      </div>
                      <p className="text-sm text-gray-600">{inc.reason}</p>
                    </div>
                    <span className="text-base font-bold text-amber-700 flex-shrink-0">${inc.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm"><span className="text-amber-600 font-medium">Pending Total</span><span className="font-bold text-amber-700">${semPending.reduce((s, i) => s + i.amount, 0)}</span></div>
              </div>
            )}
            {semApproved.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1.5"><CheckCircle size={11} /> Awarded</p>
                {semApproved.map(inc => (
                  <div key={inc.id} className="flex items-start justify-between gap-3 pb-2.5 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-medium text-gray-700">{inc.recipientName.split(' ')[0]}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white capitalize" style={{ backgroundColor: roleColor }}>{inc.category}</span>
                        <span className="text-xs text-gray-400">{inc.awardedAt}</span>
                      </div>
                      <p className="text-sm text-gray-600">{inc.reason}</p>
                    </div>
                    <span className="text-base font-bold text-gray-800 flex-shrink-0">${inc.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-600">Total Awarded</span>
                  <span className="text-sm font-bold text-gray-900">${semApproved.reduce((s, i) => s + i.amount, 0)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {selectedTeacher && (
        <Modal open onClose={() => setSelectedTeacher(null)} title={`${selectedTeacher.name} — ${selected}`} size="sm">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Log Rate', value: `${selectedTeacher.logRate}%` },
                { label: '2-Week Perfect Runs', value: selectedTeacher.twoWeekPerfect },
                { label: 'Base Incentive', value: `$${selectedTeacher.base}` },
                { label: 'Rate Bonus', value: `$${selectedTeacher.rateBonus}` },
                { label: '2-Week Bonus', value: `$${selectedTeacher.twoWeekBonus}` },
                { label: 'Formula Total', value: `$${selectedTeacher.total}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">{rateTierLabel(selectedTeacher.logRate, 'teacher')} · Tier based on log completion rate</p>
          </div>
        </Modal>
      )}
    </div>
  )
}
