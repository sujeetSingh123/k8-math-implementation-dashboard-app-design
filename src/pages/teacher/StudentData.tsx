import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, BarChart2, Upload, Plus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { toast } from '../../store/useToastStore'
import { roleColors } from '../../constants/roles'
import type { StudentDataRecord } from '../../types'

const roleColor = roleColors.teacher

type DataTypeOption = StudentDataRecord['dataType']
const DATA_TYPES: DataTypeOption[] = ['Class Average', 'Progress Monitoring', 'Benchmark Score']
const DATA_TYPE_COLORS: Record<DataTypeOption, string> = {
  'Class Average': '#10B981',
  'Progress Monitoring': '#3B82F6',
  'Benchmark Score': '#F59E0B',
}

const tierBadge: Record<string, 'blue' | 'green' | 'purple' | 'red'> = {
  'Tier 1': 'green', 'Tier 2': 'blue', 'Tier 3': 'purple', 'SPED': 'red',
}

type FormData = {
  dataType: DataTypeOption
  value: number
  date: string
  tier: string
}

function DataUploadModal({ onClose }: { onClose: () => void }) {
  const { currentUser, addStudentDataRecord } = useAppStore()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { dataType: 'Class Average', value: 0, date: new Date().toISOString().split('T')[0], tier: 'Tier 1' },
  })

  const onSubmit = (data: FormData) => {
    const record: StudentDataRecord = {
      id: `sdr-new-${Date.now()}`,
      teacherId: currentUser.id,
      date: data.date,
      dataType: data.dataType,
      value: Number(data.value),
      tier: data.tier,
    }
    addStudentDataRecord(record)
    toast.success('Student data record saved!')
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Upload Student Data">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Data Type</label>
          <select {...register('dataType', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
            {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Tier</label>
          <select {...register('tier', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
            {['Tier 1', 'Tier 2', 'Tier 3', 'SPED'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Score (0–100)</label>
          <input type="number" min={0} max={100} step={0.1}
            {...register('value', { required: true, min: 0, max: 100 })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          {errors.value && <p className="text-xs text-red-500 mt-1">Enter a score between 0 and 100.</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
          <input type="date" {...register('date', { required: true })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        </div>
        <div className="flex gap-2 pt-1">
          <Button roleColor={roleColor} type="submit"><Upload size={14} />Save Record</Button>
          <Button variant="ghost" roleColor={roleColor} onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

export function StudentData() {
  const { currentUser, studentDataRecords } = useAppStore()
  const [uploadOpen, setUploadOpen] = useState(false)

  const myRecords = studentDataRecords
    .filter(r => r.teacherId === currentUser.id)
    .sort((a, b) => a.date.localeCompare(b.date))

  const latestScore = myRecords.length > 0 ? myRecords[myRecords.length - 1].value : null
  const prevScore = myRecords.length > 1 ? myRecords[myRecords.length - 2].value : null
  const trend = latestScore !== null && prevScore !== null ? latestScore - prevScore : null

  const chartData = myRecords.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [r.dataType]: r.value,
  })).reduce<Record<string, string | number>[]>((acc, curr) => {
    const existing = acc.find(d => d.date === curr.date)
    if (existing) { return acc.map(d => d.date === curr.date ? { ...d, ...curr } : d) }
    return [...acc, curr]
  }, [])

  const recent = [...myRecords].reverse().slice(0, 10)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">Student Data</h1>
        <Button roleColor={roleColor} size="sm" onClick={() => setUploadOpen(true)}>
          <Plus size={14} />Upload Data
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Latest Score"
          value={latestScore !== null ? latestScore.toString() : '—'}
          sub={myRecords.length > 0 ? myRecords[myRecords.length - 1].dataType : 'No data yet'}
          icon={<BarChart2 size={18} />} iconColor={roleColor}
        />
        <StatCard
          label="Score Trend"
          value={trend !== null ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)}` : '—'}
          sub="vs previous entry"
          icon={trend !== null && trend >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          iconColor={trend !== null && trend >= 0 ? '#10B981' : '#EF4444'}
        />
        <StatCard
          label="Entries Logged"
          value={myRecords.length}
          sub="Total data points"
          icon={<Upload size={18} />} iconColor={roleColor}
        />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">Score Over Time</h2>
        </div>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BarChart2 size={28} className="mb-2" />
            <p className="text-sm">No data yet. Upload your first record.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              {DATA_TYPES.map(dt => (
                <Line key={dt} type="monotone" dataKey={dt} stroke={DATA_TYPE_COLORS[dt]} strokeWidth={2} dot={false} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card padding="none">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Uploads</h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No records yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(r => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{r.dataType}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={tierBadge[r.tier] ?? 'gray'}>{r.tier}</Badge>
                  <span className="font-bold text-gray-800">{r.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {uploadOpen && <DataUploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  )
}
