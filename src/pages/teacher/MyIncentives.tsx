import { useState, useMemo } from 'react'
import { Award, CheckCircle, Clock } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/useAppStore'
import { roleColors } from '../../constants/roles'
import {
  calcTeacherBreakdown, rateTierLabel,
  getSemester, filterLogsBySemester,
  currentSemester, sortSemesters,
} from '../../utils/incentiveCalc'

export function MyIncentives() {
  const { currentUser, implementationLogs, incentives } = useAppStore()
  const roleColor = roleColors[currentUser.role]

  const mine = useMemo(
    () => incentives.filter(i => i.recipientId === currentUser.id).sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)),
    [incentives, currentUser.id],
  )

  const allTimeAwarded = useMemo(() => mine.filter(i => i.status === 'approved').reduce((s, i) => s + i.amount, 0), [mine])
  const allTimePending = useMemo(() => mine.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0), [mine])

  const semesters = useMemo(() => {
    const set = new Set<string>([currentSemester()])
    mine.forEach(i => set.add(getSemester(i.awardedAt)))
    return sortSemesters([...set])
  }, [mine])

  const [selected, setSelected] = useState(() => currentSemester())

  const semLogs = useMemo(() => filterLogsBySemester(implementationLogs, selected), [implementationLogs, selected])
  const calc = useMemo(() => calcTeacherBreakdown(currentUser, semLogs), [currentUser, semLogs])
  const semApproved = useMemo(() => mine.filter(i => i.status === 'approved' && getSemester(i.awardedAt) === selected), [mine, selected])
  const semPending  = useMemo(() => mine.filter(i => i.status === 'pending'  && getSemester(i.awardedAt) === selected), [mine, selected])

  const tierColor = calc.logRate >= 81 ? 'green' : calc.logRate >= 71 ? 'blue' : calc.logRate >= 60 ? 'amber' : 'red'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColor}20` }}>
          <Award size={20} style={{ color: roleColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">My Incentives</h2>
          <p className="text-sm text-gray-500">Semester earnings — all-time view</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Awarded" value={`$${allTimeAwarded}`} sub="All semesters" icon={<Award size={18} />} iconColor={roleColor} />
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

      <Card title={`${selected} — Formula Breakdown`}>
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
              <p className="text-xs text-gray-400">{calc.twoWeekPerfect} perfect period{calc.twoWeekPerfect !== 1 ? 's' : ''} × $5</p>
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
            <p className="text-sm font-bold text-gray-900">Formula Total</p>
            <span className="text-xl font-bold" style={{ color: roleColor }}>${calc.total}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p><strong>Log Rate Tiers:</strong> 81–100% → +$30 · 71–80% → +$20 · 60–70% → +$10</p>
          <p><strong>2-Week Bonus:</strong> $5 per 2-week window with 100% fully-completed logs</p>
        </div>
      </Card>

      <Card title={`Incentives — ${selected}`}>
        {semPending.length === 0 && semApproved.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No incentives recorded for {selected}.</p>
        ) : (
          <div className="space-y-5">
            {semPending.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Clock size={11} /> To Be Awarded — Pending Approval
                </p>
                <div className="space-y-2">
                  {semPending.map(inc => (
                    <div key={inc.id} className="flex items-start justify-between gap-3 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white capitalize" style={{ backgroundColor: '#F59E0B' }}>{inc.category}</span>
                          <span className="text-xs text-gray-400">{inc.awardedAt}</span>
                        </div>
                        <p className="text-sm text-gray-600">{inc.reason}</p>
                      </div>
                      <span className="text-base font-bold text-amber-700 flex-shrink-0">${inc.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-amber-600 font-medium">To Be Awarded</span>
                    <span className="font-bold text-amber-700">${semPending.reduce((s, i) => s + i.amount, 0)}</span>
                  </div>
                </div>
              </div>
            )}
            {semApproved.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckCircle size={11} /> Awarded
                </p>
                <div className="space-y-2.5">
                  {semApproved.map(inc => (
                    <div key={inc.id} className="flex items-start justify-between gap-3 pb-2.5 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
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
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
