import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Download, FileDown, Eye } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.researcher

type ExportForm = {
  dataset: string
  deIdentification: string
  startDate: string
  endDate: string
  site: string
  format: 'csv' | 'json' | 'spss'
}

type ExportRow = { date: string; dataset: string; records: string; format: string; status: string }

const recentExports: ExportRow[] = [
  { date: '2026-05-10', dataset: 'Full longitudinal', records: '312 records', format: 'CSV', status: 'Complete' },
  { date: '2026-04-28', dataset: 'Adaptation records (FRAME-IS)', records: '89 records', format: 'JSON', status: 'Complete' },
  { date: '2026-04-15', dataset: 'Fidelity self-checks', records: '180 records', format: 'SPSS-ready', status: 'Complete' },
  { date: '2026-03-31', dataset: 'Implementation logs only', records: '156 records', format: 'CSV', status: 'Complete' },
]

const previewRows = [
  { id: 'LOG-001', site: 'Site A', date: '2026-05-12', routine: 'Number Talks', completion: 'fully', fidelity: '4.2', adaptation: 'No' },
  { id: 'LOG-002', site: 'Site B', date: '2026-05-11', routine: 'Math Workshop', completion: 'partially', fidelity: '3.7', adaptation: 'Yes' },
  { id: 'LOG-003', site: 'Site A', date: '2026-05-10', routine: 'CRA Sequence', completion: 'fully', fidelity: '4.5', adaptation: 'No' },
  { id: 'LOG-004', site: 'Site C', date: '2026-05-09', routine: 'Error Analysis', completion: 'not_completed', fidelity: '—', adaptation: 'Yes' },
  { id: 'LOG-005', site: 'Site B', date: '2026-05-08', routine: 'Number Talks', completion: 'fully', fidelity: '3.9', adaptation: 'No' },
]

export function DataExport() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const { register, handleSubmit, watch } = useForm<ExportForm>({
    defaultValues: {
      dataset: 'Full longitudinal',
      deIdentification: 'De-identified (research)',
      startDate: '2025-09-01',
      endDate: '2026-05-17',
      site: 'All sites',
      format: 'csv',
    },
  })
  const currentDataset = watch('dataset')

  const onSubmit = (data: ExportForm) => {
    toast.success(`Export generated: ${data.dataset} (${data.format.toUpperCase()}) — download will begin shortly.`)
  }

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

  const previewColumns = [
    { key: 'id', header: 'ID' },
    { key: 'site', header: 'Site' },
    { key: 'date', header: 'Date' },
    { key: 'routine', header: 'Routine', className: 'hidden sm:table-cell' },
    { key: 'completion', header: 'Completion', render: (row: typeof previewRows[0]) => (
      <Badge color={row.completion === 'fully' ? 'green' : row.completion === 'partially' ? 'amber' : 'red'}>{row.completion}</Badge>
    )},
    { key: 'fidelity', header: 'Fidelity', className: 'hidden sm:table-cell' },
    { key: 'adaptation', header: 'Adapt.', render: (row: typeof previewRows[0]) => (
      <Badge color={row.adaptation === 'Yes' ? 'blue' : 'gray'}>{row.adaptation}</Badge>
    )},
  ]

  return (
    <div className="w-full max-w-2xl space-y-4">
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
                <option>Coaching records</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">De-identification Level</label>
              <select {...register('deIdentification')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                <option>De-identified (research)</option>
                <option>School-level aggregated</option>
                <option>District-level aggregated</option>
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
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Site Filter</label>
              <select {...register('site')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                <option>All sites</option>
                <option>Site A (Lincoln Elementary)</option>
                <option>Site B (Washington Elementary)</option>
                <option>Site C (Jefferson Elementary)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Export Format</label>
            <div className="flex flex-wrap gap-4">
              {([['csv','CSV'],['json','JSON'],['spss','SPSS-ready']] as const).map(([v, l]) => (
                <label key={v} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" value={v} {...register('format')} className="accent-purple-500" />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" roleColor={roleColor}><FileDown size={14}/>Generate Export</Button>
            <Button type="button" variant="secondary" roleColor={roleColor} onClick={() => setPreviewOpen(true)}><Eye size={14}/>Preview Dataset</Button>
          </div>
        </form>
      </Card>
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Recent Exports</h2>
          <button onClick={() => toast.info('Exports are retained for 90 days. Contact data admin to extend retention.')} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Retention policy</button>
        </div>
        <Table
          columns={exportColumns as Parameters<typeof Table>[0]['columns']}
          data={recentExports as unknown as Record<string, unknown>[]}
          emptyMessage="No exports yet."
          onRowClick={row => { const r = row as unknown as ExportRow; toast.info(`${r.dataset} — ${r.records}, exported ${r.date}`) }}
        />
      </Card>

      {previewOpen && (
        <Modal open onClose={() => setPreviewOpen(false)} title={`Preview: ${currentDataset}`} size="lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
              <p className="text-xs text-purple-700">Showing 5 sample de-identified records. All IDs and dates are synthetic.</p>
            </div>
            <Table
              columns={previewColumns as Parameters<typeof Table>[0]['columns']}
              data={previewRows as unknown as Record<string, unknown>[]}
              emptyMessage="No preview available."
            />
            <div className="flex gap-2 pt-1">
              <Button roleColor={roleColor} onClick={() => { toast.success('Full export queued — check Recent Exports shortly.'); setPreviewOpen(false) }}>Generate Full Export</Button>
              <Button variant="ghost" roleColor={roleColor} onClick={() => setPreviewOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
