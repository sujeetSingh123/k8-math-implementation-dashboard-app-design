import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ArrowRight } from 'lucide-react'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.researcher

type StatusLevel = 'green' | 'amber' | 'red'

function statusBadge(value: number, greenThreshold: number, amberThreshold: number): StatusLevel {
  if (value >= greenThreshold) return 'green'
  if (value >= amberThreshold) return 'amber'
  return 'red'
}

function PathwayCard({ title, metrics, status }: {
  title: string
  metrics: { label: string; value: string; sub?: string }[]
  status: StatusLevel
}) {
  return (
    <Card className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <Badge color={status}>{status === 'green' ? 'On Target' : status === 'amber' ? 'Monitor' : 'Needs Work'}</Badge>
      </div>
      <div className="space-y-2.5">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-gray-500">{m.label}</span>
              <span className="text-sm font-bold text-gray-800">{m.value}</span>
            </div>
            {m.sub && <p className="text-xs text-gray-400">{m.sub}</p>}
          </div>
        ))}
      </div>
    </Card>
  )
}

export function DSAIIPathway() {
  const { determinants, coachingCycles, trainingAttendances, adaptations, fidelityChecks, studentDataRecords } = useAppStore()

  // Panel 1: Determinants
  const det = determinants
  const avgDet = Math.round(Object.values(det).reduce((a, b) => a + b, 0) / Object.values(det).length)
  const detStatus = statusBadge(avgDet, 75, 60)

  // Panel 2: Strategies
  const coachMsgCount = coachingCycles.reduce((sum, c) => sum + c.messages.filter(m => m.senderId !== c.teacherId).length, 0)
  const trainedCount = trainingAttendances.filter(a => !!a.checkedOutAt).length
  const feedbackCycles = coachingCycles.reduce((sum, c) => sum + c.actions.length, 0)
  const stratStatus = statusBadge(coachMsgCount, 20, 10)

  // Panel 3: Adaptations
  const totalAdapt = adaptations.length
  const consistentAdapt = adaptations.filter(a => a.fidelityType === 'consistent').length
  const pctConsistent = totalAdapt > 0 ? Math.round((consistentAdapt / totalAdapt) * 100) : 0
  const adaptStatus = statusBadge(pctConsistent, 70, 50)

  // Panel 4: Implementation Outcomes
  const avgFidelity = fidelityChecks.length > 0
    ? fidelityChecks.reduce((sum, c) => sum + (c.adherence + c.dosage + c.quality + c.responsiveness + c.confidence) / 5, 0) / fidelityChecks.length
    : 0
  const checksWithFeas = fidelityChecks.filter(c => c.feasibility !== undefined)
  const avgFeas = checksWithFeas.length > 0
    ? checksWithFeas.reduce((sum, c) => sum + (c.feasibility ?? 0), 0) / checksWithFeas.length
    : 0
  const checksWithAcc = fidelityChecks.filter(c => c.acceptability !== undefined)
  const avgAcc = checksWithAcc.length > 0
    ? checksWithAcc.reduce((sum, c) => sum + (c.acceptability ?? 0), 0) / checksWithAcc.length
    : 0
  const implStatus = statusBadge(avgFidelity, 4.0, 3.0)

  // Panel 5: Instructional Outcomes
  const uploadCount = studentDataRecords.length
  const sortedRecords = [...studentDataRecords].sort((a, b) => a.date.localeCompare(b.date))
  const recentScores = sortedRecords.slice(-5)
  const avgScore = recentScores.length > 0
    ? Math.round(recentScores.reduce((sum, r) => sum + r.currentAvg, 0) / recentScores.length)
    : 0
  const scoreStatus = statusBadge(avgScore, 80, 65)

  // Summary
  const panels = [detStatus, stratStatus, adaptStatus, implStatus, scoreStatus]
  const atTarget = panels.filter(s => s === 'green').length

  const panelData = [
    {
      title: 'Determinants',
      status: detStatus,
      metrics: [
        { label: 'Avg Capacity Score', value: `${avgDet}%` },
        { label: 'Leadership Support', value: `${det['Leadership Support']}%` },
        { label: 'Coaching Access', value: `${det['Coaching Access']}%`, sub: 'Top determinant' },
      ],
    },
    {
      title: 'Strategies',
      status: stratStatus,
      metrics: [
        { label: 'Coach Messages', value: coachMsgCount.toString() },
        { label: 'Training Sessions Attended', value: trainedCount.toString() },
        { label: 'Feedback Cycles', value: feedbackCycles.toString() },
      ],
    },
    {
      title: 'Adaptations',
      status: adaptStatus,
      metrics: [
        { label: 'Total Adaptations', value: totalAdapt.toString() },
        { label: '% Consistent', value: `${pctConsistent}%` },
        { label: 'Top Reason', value: 'Time constraints', sub: 'Most frequent' },
      ],
    },
    {
      title: 'Implementation Outcomes',
      status: implStatus,
      metrics: [
        { label: 'Avg Fidelity', value: avgFidelity > 0 ? `${Math.round(avgFidelity * 20)}%` : 'N/A' },
        { label: 'Avg Feasibility', value: avgFeas > 0 ? `${Math.round(avgFeas * 20)}%` : 'N/A' },
        { label: 'Avg Acceptability', value: avgAcc > 0 ? `${Math.round(avgAcc * 20)}%` : 'N/A' },
      ],
    },
    {
      title: 'Instructional Outcomes',
      status: scoreStatus,
      metrics: [
        { label: 'Student Data Uploads', value: uploadCount.toString() },
        { label: 'Avg Recent Score', value: avgScore > 0 ? avgScore.toString() : 'N/A' },
        { label: 'Score Range', value: '0–100', sub: 'Class averages' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-base font-semibold text-gray-900">DSAII Pathway Analysis</h1>
        <p className="text-xs text-gray-500 mt-1">Visualizing the causal chain from determinants through strategies to outcomes</p>
      </div>

      {/* Pathway Flow */}
      <div className="flex flex-col xl:flex-row items-stretch gap-3">
        {panelData.map((panel, idx) => (
          <div key={panel.title} className="flex flex-col xl:flex-row items-center gap-3 flex-1 min-w-0">
            <PathwayCard title={panel.title} metrics={panel.metrics} status={panel.status} />
            {idx < panelData.length - 1 && (
              <div className="flex xl:flex-col items-center justify-center flex-shrink-0">
                <ArrowRight size={20} className="text-gray-300 rotate-90 xl:rotate-0" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Insight */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Pathway Strength</h3>
            <p className="text-xs text-gray-500 mt-0.5">{atTarget}/5 indicators at target — {atTarget >= 4 ? 'Strong pathway alignment' : atTarget >= 2 ? 'Moderate pathway — monitor flagged panels' : 'Weak pathway — targeted support needed'}</p>
          </div>
          <div className="flex items-center gap-2">
            {panels.map((s, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: s === 'green' ? '#10B981' : s === 'amber' ? '#F59E0B' : '#EF4444', borderColor: s === 'green' ? '#059669' : s === 'amber' ? '#D97706' : '#DC2626' }} title={panelData[i].title} />
            ))}
            <span className="text-sm font-bold ml-1" style={{ color: roleColor }}>{atTarget}/5</span>
          </div>
        </div>
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(atTarget / 5) * 100}%`, backgroundColor: atTarget >= 4 ? '#10B981' : atTarget >= 2 ? '#F59E0B' : '#EF4444' }} />
        </div>
      </Card>
    </div>
  )
}
