import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Download, FileDown, Eye, ShieldCheck } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import { useAppStore } from '../../store/useAppStore'

const roleColor = roleColors.researcher

type ExportForm = {
  dataset: string
  startDate: string
  endDate: string
  schoolId: string
  format: 'csv' | 'json' | 'spss'
}

type ExportRow = { date: string; dataset: string; records: string; format: string; status: string }

const recentExports: ExportRow[] = [
  { date: '2026-05-10', dataset: 'Full longitudinal', records: '312 records', format: 'CSV', status: 'Complete' },
  { date: '2026-04-28', dataset: 'Adaptation records (FRAME-IS)', records: '89 records', format: 'JSON', status: 'Complete' },
  { date: '2026-04-15', dataset: 'Fidelity self-checks', records: '180 records', format: 'SPSS-ready', status: 'Complete' },
  { date: '2026-03-31', dataset: 'Implementation logs only', records: '156 records', format: 'CSV', status: 'Complete' },
]

export function DataExport() {
  const { implementationLogs, users, schools } = useAppStore()
  const [previewOpen, setPreviewOpen] = useState(false)

  const { register, handleSubmit, watch } = useForm<ExportForm>({
    defaultValues: {
      dataset: 'Full longitudinal',
      startDate: '2025-09-01',
      endDate: '2026-05-31',
      schoolId: 'all',
      format: 'csv',
    },
  })

  const watchSchool = watch('schoolId')
  const watchDataset = watch('dataset')

  // Build de-identified preview from real data
  const previewLogs = implementationLogs
    .filter(l => watchSchool === 'all' || l.schoolId === watchSchool)
    .slice(0, 6)
    .map(l => {
      const teacher = users.find(u => u.id === l.teacherId)
      return {
        participant_id: l.teacherId,          // code, not name
        school_id: l.schoolId,                // code, not name
        coach_id: teacher?.coachId ?? '—',   // code, not name
        date: l.date,
        tier: l.tier,
        routine: l.instructionalRoutine ?? l.mathSkill ?? null,
        completion: l.lessonCompletion,
        adaptation: l.adaptationOccurred ? 'Yes' : 'No',
      }
    })

  const previewColumns = [
    { key: 'participant_id', header: 'Participant ID' },
    { key: 'school_id', header: 'School ID' },
    { key: 'coach_id', header: 'Coach ID', className: 'hidden sm:table-cell' },
    { key: 'date', header: 'Date' },
    { key: 'tier', header: 'Tier', className: 'hidden md:table-cell' },
    { key: 'completion', header: 'Completion', render: (row: typeof previewLogs[0]) => (
      <Badge color={row.completion === 'fully' ? 'green' : row.completion === 'partially' ? 'amber' : 'red'}>
        {row.completion.replace('_', ' ')}
      </Badge>
    )},
    { key: 'adaptation', header: 'Adapted', render: (row: typeof previewLogs[0]) => (
      <Badge color={row.adaptation === 'Yes' ? 'blue' : 'gray'}>{row.adaptation}</Badge>
    )},
  ]

  const exportColumns = [
    { key: 'date', header: 'Date', className: 'whitespace-nowrap' },
    { key: 'dataset', header: 'Dataset' },
    { key: 'records', header: 'Records', className: 'hidden sm:table-cell' },
    { key: 'format', header: 'Format', render: (row: ExportRow) => <Badge color="purple">{row.format}</Badge> },
    { key: 'status', header: 'Status', className: 'hidden sm:table-cell', render: (row: ExportRow) => <Badge color="green">{row.status}</Badge> },
    { key: 'download', header: '', render: (row: ExportRow) => (
      <button
        onClick={e => { e.stopPropagation(); toast.success(`Downloading "${row.dataset}" (${row.records})…`) }}
        className="flex items-center gap-1 text-xs text-purple-600 font-medium hover:text-purple-800 cursor-pointer whitespace-nowrap"
      >
        <Download size={12} />Download
      </button>
    )},
  ]

  const onSubmit = (data: ExportForm) => {
    const count = implementationLogs.filter(l => data.schoolId === 'all' || l.schoolId === data.schoolId).length
    toast.success(`De-identified export generated: ${data.dataset} · ${count} records · ${data.format.toUpperCase()}`)
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {/* De-identification notice */}
      <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
        <ShieldCheck size={16} className="flex-shrink-0 mt-0.5 text-purple-600" />
        <div>
          <p className="text-sm font-semibold text-purple-800">All exports are automatically de-identified</p>
          <p className="text-xs text-purple-600 mt-0.5">
            Names are replaced with participant codes (T001, C001, SCH01). No personally identifiable information is included in any export file.
          </p>
        </div>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Export Configuration</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Dataset Type</label>
              <select {...register('dataset')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                <option>Full longitudinal</option>
                <option>Implementation logs only</option>
                <option>Adaptation records (FRAME-IS)</option>
                <option>Fidelity self-checks</option>
                <option>Student data records</option>
                <option>Coaching records</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">School Filter</label>
              <select {...register('schoolId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                <option value="all">All Schools</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Start Date</label>
              <input type="date" {...register('startDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">End Date</label>
              <input type="date" {...register('endDate')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Export Format</label>
            <div className="flex flex-wrap gap-4">
              {([['csv', 'CSV'], ['json', 'JSON'], ['spss', 'SPSS-ready']] as const).map(([v, l]) => (
                <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" value={v} {...register('format')} className="accent-purple-500" />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" roleColor={roleColor}><FileDown size={14} />Generate Export</Button>
            <Button type="button" variant="secondary" roleColor={roleColor} onClick={() => setPreviewOpen(true)}>
              <Eye size={14} />Preview De-identified
            </Button>
          </div>
        </form>
      </Card>

      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Recent Exports</h2>
          <button onClick={() => toast.info('Exports are retained for 90 days.')} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
            Retention policy
          </button>
        </div>
        <Table
          columns={exportColumns as Parameters<typeof Table>[0]['columns']}
          data={recentExports as unknown as Record<string, unknown>[]}
          emptyMessage="No exports yet."
          onRowClick={row => { const r = row as unknown as ExportRow; toast.info(`${r.dataset} — ${r.records}, exported ${r.date}`) }}
        />
      </Card>

      {previewOpen && (
        <Modal open onClose={() => setPreviewOpen(false)} title={`De-identified Preview: ${watchDataset}`} size="lg">
          <div className="space-y-3">
            <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
              <ShieldCheck size={14} className="flex-shrink-0 mt-0.5 text-purple-600" />
              <p className="text-xs text-purple-700">
                Names replaced with participant codes. This is exactly how exported data will appear — no real names are present.
              </p>
            </div>
            <Table
              columns={previewColumns as Parameters<typeof Table>[0]['columns']}
              data={previewLogs as unknown as Record<string, unknown>[]}
              emptyMessage="No records match the current filter."
            />
            <div className="flex gap-2 pt-1">
              <Button roleColor={roleColor} onClick={() => { toast.success('Full de-identified export queued.'); setPreviewOpen(false) }}>
                Generate Full Export
              </Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setPreviewOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
