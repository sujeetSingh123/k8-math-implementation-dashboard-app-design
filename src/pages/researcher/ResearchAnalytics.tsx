import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Shield, Database, BookOpen, CheckCircle, MessageSquare } from 'lucide-react'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { LogDetailModal } from '../shared/LogDetailModal'
import { toast } from '../../store/useToastStore'
import { monthlyFidelityTrend } from '../../data/mockData'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'
import type { ImplementationLog } from '../../types'

const roleColor = roleColors.researcher

const dsaiiNotes: Record<string, string> = {
  'Leadership Support (Determinant)': 'Principal walkthrough frequency correlates strongly with fidelity (r=0.61). Sites with bi-weekly walkthroughs show 18% higher log completion rates.',
  'Coaching Access (Strategy)': 'Coaching contact hours are the strongest predictor of fidelity growth. Sites averaging ≥4 hrs/month show consistent upward trajectories.',
  'Adaptation Rate': '67% of teachers document at least one adaptation per month. FRAME-IS records show 72% are fidelity-consistent, indicating quality adaptations.',
  'Implementation Fidelity': 'Adherence (78%) and Dosage (81%) are highest-performing dimensions. Confidence (64%) is the most common coaching focus area.',
  'Student Outcome Trend': 'Preliminary data shows 12% improvement in math benchmark scores at high-fidelity sites. Full outcome data available in Q4 final report.',
}

const siteDetails: Record<string, { trend: { month: string; fidelity: number }[]; notes: string }> = {
  'Site A': {
    trend: [{ month: 'Jan', fidelity: 3.5 }, { month: 'Feb', fidelity: 3.7 }, { month: 'Mar', fidelity: 3.9 }],
    notes: 'Strongest implementation site. Math coach embedded 3 days/week. MTSS team well-established with clear data protocols.',
  },
  'Site B': {
    trend: [{ month: 'Jan', fidelity: 3.2 }, { month: 'Feb', fidelity: 3.4 }, { month: 'Mar', fidelity: 3.7 }],
    notes: 'Steady upward progress. New principal is supportive of research goals. Coaching contact increased in March with positive results.',
  },
  'Site C': {
    trend: [{ month: 'Jan', fidelity: 2.8 }, { month: 'Feb', fidelity: 2.9 }, { month: 'Mar', fidelity: 3.2 }],
    notes: 'Lowest fidelity site. Staff turnover impacting data completeness. Designated priority site for Q4 intensive support and coaching.',
  },
}

interface ProgressBarProps { label: string; value: number; onClick?: () => void }

function ProgressBar({ label, value, onClick }: ProgressBarProps) {
  return (
    <div className={`space-y-1 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex justify-between items-center gap-2">
        <span className="text-xs sm:text-sm text-gray-700 truncate">{label}</span>
        <span className="text-sm font-semibold text-gray-800 flex-shrink-0">{value}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: roleColor }} />
      </div>
    </div>
  )
}

const dsaii = [
  { label: 'Leadership Support (Determinant)', value: 72 },
  { label: 'Coaching Access (Strategy)', value: 85 },
  { label: 'Adaptation Rate', value: 67 },
  { label: 'Implementation Fidelity', value: 78 },
  { label: 'Student Outcome Trend', value: 54 },
]

type SiteRow = { site: string; logRate: string; avgFidelity: string; adaptations: number; pctConsistent: string; dataCompleteness: string }

const siteData: SiteRow[] = [
  { site: 'Site A', logRate: '78%', avgFidelity: '3.9', adaptations: 18, pctConsistent: '72%', dataCompleteness: '91%' },
  { site: 'Site B', logRate: '71%', avgFidelity: '3.7', adaptations: 14, pctConsistent: '68%', dataCompleteness: '85%' },
  { site: 'Site C', logRate: '65%', avgFidelity: '3.2', adaptations: 22, pctConsistent: '45%', dataCompleteness: '74%' },
]

export function ResearchAnalytics() {
  const { implementationLogs } = useAppStore()
  const [siteModal, setSiteModal] = useState<SiteRow | null>(null)
  const [selectedLog, setSelectedLog] = useState<ImplementationLog | null>(null)

  const trendData = monthlyFidelityTrend.map(m => ({ month: m.month, adherence: m.adherence }))

  const siteColumns = [
    { key: 'site', header: 'Site', render: (row: SiteRow) => <span className="font-medium text-gray-800">{row.site}</span> },
    { key: 'logRate', header: 'Log Rate' },
    { key: 'avgFidelity', header: 'Fidelity' },
    { key: 'adaptations', header: 'Adapt.', render: (row: SiteRow) => String(row.adaptations) },
    { key: 'pctConsistent', header: '% Consistent', className: 'hidden sm:table-cell' },
    { key: 'dataCompleteness', header: 'Completeness', render: (row: SiteRow) => {
      const val = parseInt(row.dataCompleteness)
      return <Badge color={val >= 90 ? 'green' : val >= 80 ? 'amber' : 'red'}>{row.dataCompleteness}</Badge>
    }},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-800 cursor-pointer"
        onClick={() => toast.info('IRB protocol #2025-0031 covers all data displayed here. Contact the PI for data access requests.')}>
        <Shield size={16} className="flex-shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm">All data is de-identified. No individual teachers or students are identifiable. Click for IRB details.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="cursor-pointer" onClick={() => toast.info('3 active sites: Lincoln, Washington, and Jefferson Elementary.')}><StatCard label="Sites in Study" value="3" sub="Active sites" icon={<Database size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={() => toast.info('60 log entries across all 3 sites. 78% average completion rate.')}><StatCard label="Log Entries" value="60" sub="All sites" icon={<BookOpen size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={() => toast.info('25 FRAME-IS adaptation records — 72% classified as fidelity-consistent.')}><StatCard label="Adaptations" value="25" sub="FRAME-IS records" icon={<BookOpen size={18} />} iconColor={roleColor} /></div>
        <div className="cursor-pointer" onClick={() => toast.info('82% overall data completeness. Site C (74%) is below the 80% threshold.')}><StatCard label="Completeness" value="82%" sub="All measures" icon={<CheckCircle size={18} />} iconColor={roleColor} /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Longitudinal Fidelity Trajectories (Sep–May)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} onClick={d => { if (d?.activeLabel) toast.info(`${d.activeLabel} — Adherence: ${trendData.find(t => t.month === d.activeLabel)?.adherence ?? '—'}`) }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis domain={[2, 5]} tick={{ fontSize: 10 }} width={25} />
              <Tooltip />
              <Line type="monotone" dataKey="adherence" name="Avg Adherence" stroke={roleColor} strokeWidth={2.5} dot={{ r: 3, fill: roleColor }} activeDot={{ r: 5, cursor: 'pointer' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">DSAII Pathway Indicators</h3>
            <button onClick={() => toast.info('DSAII = Drivers, Strategies, Adaptations, Implementation, and Impact — click any bar for details.')} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">What's this?</button>
          </div>
          <div className="space-y-4">
            {dsaii.map(d => (
              <ProgressBar key={d.label} label={d.label} value={d.value} onClick={() => toast.info(dsaiiNotes[d.label] ?? d.label)} />
            ))}
          </div>
        </Card>
      </div>
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Cross-Site Comparison (Anonymized)</h2>
          <Button size="sm" variant="secondary" roleColor={roleColor} onClick={() => toast.info('Generating cross-site comparison report…')}>Export</Button>
        </div>
        <Table
          columns={siteColumns as Parameters<typeof Table>[0]['columns']}
          data={siteData as unknown as Record<string, unknown>[]}
          emptyMessage="No site data available."
          onRowClick={row => setSiteModal(row as unknown as SiteRow)}
        />
      </Card>

      <Card padding="none">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <MessageSquare size={14} style={{ color: roleColor }} />
          <h2 className="text-sm font-semibold text-gray-800">Recent Implementation Logs</h2>
        </div>
        {implementationLogs.slice(0, 6).map(log => (
          <button key={log.id} onClick={() => setSelectedLog(log)} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{log.teacherId} · {log.date} · {log.instructionalRoutine}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Badge color={log.adaptationOccurred ? 'purple' : 'blue'}>{log.tier}</Badge>
              <Badge color={log.lessonCompletion === 'fully' ? 'green' : log.lessonCompletion === 'partially' ? 'amber' : 'red'}>{log.lessonCompletion.replace('_', ' ')}</Badge>
            </div>
          </button>
        ))}
      </Card>
      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      {siteModal && (
        <Modal open onClose={() => setSiteModal(null)} title={`${siteModal.site} — Research Detail`} size="lg">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span>Log Rate: <strong>{siteModal.logRate}</strong></span>
              <span>Avg Fidelity: <strong>{siteModal.avgFidelity}</strong></span>
              <span>Adaptations: <strong>{siteModal.adaptations}</strong></span>
              <span>% Consistent: <strong>{siteModal.pctConsistent}</strong></span>
              <span>Data Completeness: <strong>{siteModal.dataCompleteness}</strong></span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">Site Notes</p>
              <p className="text-sm text-gray-600">{siteDetails[siteModal.site]?.notes}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Fidelity Trend (Last 3 Months)</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={siteDetails[siteModal.site]?.trend ?? []}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[2, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="fidelity" fill={roleColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button roleColor={roleColor} onClick={() => { toast.success(`Exporting full dataset for ${siteModal.site}…`); setSiteModal(null) }}>Export Site Data</Button>
              <Button variant="secondary" roleColor={roleColor} onClick={() => { toast.info(`Generating site report for ${siteModal.site}…`); setSiteModal(null) }}>Generate Report</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setSiteModal(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
