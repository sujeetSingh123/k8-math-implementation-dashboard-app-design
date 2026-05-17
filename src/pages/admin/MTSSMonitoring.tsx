import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Card } from '../../components/ui/Card'
import { monthlyFidelityTrend } from '../../data/mockData'

const roleColor = '#F59E0B'

interface ProgressBarProps {
  label: string
  value: number
  color?: string
}

function ProgressBar({ label, value, color = roleColor }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{value}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

const capacityIndicators = [
  { label: 'Leadership Support', value: 72 },
  { label: 'Coaching Access', value: 85 },
  { label: 'Staffing Stability', value: 64 },
  { label: 'MTSS Maturity', value: 58 },
  { label: 'Resource Availability', value: 79 },
]

const tierCoverage = [
  { label: 'Tier 1 (Universal)', value: 88, color: '#10B981' },
  { label: 'Tier 2 (Targeted)', value: 71, color: '#3B82F6' },
  { label: 'Tier 3 (Intensive)', value: 45, color: '#F59E0B' },
  { label: 'SPED Services', value: 38, color: '#8B5CF6' },
]

export function MTSSMonitoring() {
  const trendData = monthlyFidelityTrend.map(m => ({
    month: m.month,
    'Avg Fidelity': ((m.adherence + m.dosage + m.quality + m.responsiveness + m.confidence) / 5).toFixed(2),
  }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Capacity Indicators</h2>
          <div className="space-y-4">
            {capacityIndicators.map(ci => (
              <ProgressBar key={ci.label} label={ci.label} value={ci.value} />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Tier Coverage</h2>
          <div className="space-y-4">
            {tierCoverage.map(tc => (
              <ProgressBar key={tc.label} label={tc.label} value={tc.value} color={tc.color} />
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">District-Wide Implementation Health (Sep–May)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[2, 5]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="Avg Fidelity" stroke={roleColor} strokeWidth={2.5} dot={{ r: 4, fill: roleColor }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
