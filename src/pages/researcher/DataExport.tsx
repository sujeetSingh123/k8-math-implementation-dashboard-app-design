import { useForm } from 'react-hook-form'
import { Download, FileDown } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'

const roleColor = '#8B5CF6'

type ExportForm = {
  dataset: string
  deIdentification: string
  startDate: string
  endDate: string
  site: string
  format: 'csv' | 'json' | 'spss'
}

type ExportRow = {
  date: string
  dataset: string
  records: string
  format: string
  status: string
}

const recentExports: ExportRow[] = [
  { date: '2026-05-10', dataset: 'Full longitudinal', records: '312 records', format: 'CSV', status: 'Complete' },
  { date: '2026-04-28', dataset: 'Adaptation records (FRAME-IS)', records: '89 records', format: 'JSON', status: 'Complete' },
  { date: '2026-04-15', dataset: 'Fidelity self-checks', records: '180 records', format: 'SPSS-ready', status: 'Complete' },
  { date: '2026-03-31', dataset: 'Implementation logs only', records: '156 records', format: 'CSV', status: 'Complete' },
]

const exportColumns = [
  { key: 'date', header: 'Date', className: 'whitespace-nowrap' },
  { key: 'dataset', header: 'Dataset' },
  { key: 'records', header: 'Records', className: 'hidden sm:table-cell' },
  { key: 'format', header: 'Format', render: (row: ExportRow) => <Badge color="purple">{row.format}</Badge> },
  { key: 'status', header: 'Status', className: 'hidden sm:table-cell', render: (row: ExportRow) => <Badge color="green">{row.status}</Badge> },
  {
    key: 'download',
    header: '',
    render: () => (
      <button className="flex items-center gap-1 text-xs text-purple-600 font-medium hover:text-purple-800 cursor-pointer whitespace-nowrap">
        <Download size={12} />Download
      </button>
    ),
  },
]

export function DataExport() {
  const { register, handleSubmit } = useForm<ExportForm>({
    defaultValues: {
      dataset: 'Full longitudinal',
      deIdentification: 'De-identified (research)',
      startDate: '2025-09-01',
      endDate: '2026-05-17',
      site: 'All sites',
      format: 'csv',
    },
  })

  const onSubmit = (data: ExportForm) => {
    alert(`Export generated: ${data.dataset} as ${data.format.toUpperCase()}`)
  }

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
            <Button type="button" variant="secondary" roleColor={roleColor}>Preview Dataset</Button>
          </div>
        </form>
      </Card>
      <Card padding="none">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Exports</h2>
        </div>
        <Table
          columns={exportColumns as Parameters<typeof Table>[0]['columns']}
          data={recentExports as unknown as Record<string, unknown>[]}
          emptyMessage="No exports yet."
        />
      </Card>
    </div>
  )
}
