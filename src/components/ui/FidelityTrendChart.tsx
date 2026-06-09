import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

export type TLPoint = { label: string; adherence: number; dosage: number; quality: number; responsiveness: number; composite: number }

const DIMS: [keyof Omit<TLPoint, 'label' | 'composite'>, string][] = [
  ['adherence', '#8B5CF6'], ['dosage', '#3B82F6'], ['quality', '#10B981'], ['responsiveness', '#F59E0B'],
]

export function FidelityTrendChart({ data, roleColor }: { data: TLPoint[]; roleColor: string }) {
  if (!data.length) return <p className="text-sm text-gray-400 text-center py-12">No fidelity data in this period.</p>
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => typeof v === 'number' ? v.toFixed(2) : ''} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {DIMS.map(([key, color]) => <Line key={key} type="monotone" dataKey={key} name={key.charAt(0).toUpperCase() + key.slice(1)} stroke={color} strokeWidth={1.5} dot={{ r: 2, fill: color }} />)}
        <Line type="monotone" dataKey="composite" name="Composite" stroke={roleColor} strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 3, fill: roleColor }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
