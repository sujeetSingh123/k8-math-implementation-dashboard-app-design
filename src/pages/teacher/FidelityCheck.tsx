import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CheckCircle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LikertScale } from '../../components/ui/LikertScale'
import { roleColors } from '../../constants/roles'
import type { FidelityCheck as FidelityCheckType } from '../../types'

const roleColor = roleColors.teacher

const dimensions = [
  { key: 'adherence', label: 'Adherence', low: 'Not following protocol', high: 'Fully following' },
  { key: 'dosage', label: 'Dosage / Exposure', low: 'Far below target', high: 'Meets/exceeds target' },
  { key: 'quality', label: 'Quality of Delivery', low: 'Poor delivery', high: 'Exemplary delivery' },
  { key: 'responsiveness', label: 'Participant Responsiveness', low: 'Low engagement', high: 'High engagement' },
  { key: 'confidence', label: 'Implementation Confidence', low: 'Not confident', high: 'Very confident' },
] as const

type DimKey = typeof dimensions[number]['key']

export function FidelityCheck() {
  const { currentUser, fidelityChecks, addFidelityCheck } = useAppStore()
  const [scores, setScores] = useState<Record<DimKey, number>>({
    adherence: 3, dosage: 3, quality: 3, responsiveness: 3, confidence: 3,
  })
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const myChecks = fidelityChecks
    .filter(f => f.teacherId === currentUser.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  const chartData = myChecks.map((c, i) => ({
    week: `Wk ${myChecks.length - i}`,
    Adherence: c.adherence,
    Dosage: c.dosage,
    Quality: c.quality,
    Responsiveness: c.responsiveness,
    Confidence: c.confidence,
  })).reverse()

  const handleSubmit = () => {
    const check: FidelityCheckType = {
      id: `fid-new-${Date.now()}`,
      teacherId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      adherence: scores.adherence,
      dosage: scores.dosage,
      quality: scores.quality,
      responsiveness: scores.responsiveness,
      confidence: scores.confidence,
      reflectionNotes: notes || undefined,
    }
    addFidelityCheck(check)
    setSaved(true)
    setNotes('')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-800">
          <CheckCircle size={16} />
          <p className="text-sm font-medium">Fidelity check saved!</p>
        </div>
      )}
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Rate your implementation today (1 = Low, 5 = High)</h2>
        <div className="space-y-5">
          {dimensions.map(dim => (
            <LikertScale
              key={dim.key}
              label={dim.label}
              value={scores[dim.key]}
              onChange={v => setScores(prev => ({ ...prev, [dim.key]: v }))}
              roleColor={roleColor}
              lowLabel={dim.low}
              highLabel={dim.high}
            />
          ))}
        </div>
        <div className="mt-5">
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Reflection Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="What went well? What would you do differently?"
          />
        </div>
        <div className="mt-4">
          <Button onClick={handleSubmit} roleColor={roleColor}>Submit Check</Button>
        </div>
      </Card>
      <Card>
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Last 4 Weeks — Fidelity Trend</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No fidelity data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={6}>
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} width={20} />
              <Tooltip />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Adherence" fill="#10B981" />
              <Bar dataKey="Dosage" fill="#3B82F6" />
              <Bar dataKey="Quality" fill="#F59E0B" />
              <Bar dataKey="Responsiveness" fill="#8B5CF6" />
              <Bar dataKey="Confidence" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
