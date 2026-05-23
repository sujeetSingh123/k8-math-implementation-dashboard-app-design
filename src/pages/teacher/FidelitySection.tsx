import { LikertScale } from '../../components/ui/LikertScale'
import { roleColors } from '../../constants/roles'

const roleColor = roleColors.teacher

const coreDims = [
  { key: 'adherence' as const, label: 'Adherence', low: 'Not following protocol', high: 'Fully following' },
  { key: 'dosage' as const, label: 'Dosage / Exposure', low: 'Far below target', high: 'Meets/exceeds target' },
  { key: 'quality' as const, label: 'Quality of Delivery', low: 'Poor delivery', high: 'Exemplary delivery' },
  { key: 'responsiveness' as const, label: 'Student Responsiveness', low: 'Low engagement', high: 'High engagement' },
  { key: 'confidence' as const, label: 'Implementation Confidence', low: 'Not confident', high: 'Very confident' },
]

const extraDims = [
  { key: 'feasibility' as const, label: 'Feasibility', low: 'Very difficult to implement', high: 'Very easy to implement' },
  { key: 'acceptability' as const, label: 'Acceptability', low: 'Not acceptable', high: 'Fully acceptable' },
  { key: 'sustainment' as const, label: 'Sustainment Likelihood', low: 'Not sustainable', high: 'Highly sustainable' },
]

export type CoreScores = { adherence: number; dosage: number; quality: number; responsiveness: number; confidence: number }
export type ExtraScores = { feasibility: number; acceptability: number; sustainment: number }

type Props = {
  scores: CoreScores
  onScore: (k: keyof CoreScores, v: number) => void
  extra: ExtraScores
  onExtra: (k: keyof ExtraScores, v: number) => void
  notes: string
  onNotes: (v: string) => void
}

export function FidelitySection({ scores, onScore, extra, onExtra, notes, onNotes }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-400">Rate your implementation today (1 = Low, 5 = High)</p>
      {coreDims.map(d => (
        <LikertScale key={d.key} label={d.label} value={scores[d.key]} onChange={v => onScore(d.key, v)}
          roleColor={roleColor} lowLabel={d.low} highLabel={d.high} />
      ))}
      <div className="pt-4 border-t border-gray-100 space-y-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Implementation Context</p>
        {extraDims.map(d => (
          <LikertScale key={d.key} label={d.label} value={extra[d.key]} onChange={v => onExtra(d.key, v)}
            roleColor={roleColor} lowLabel={d.low} highLabel={d.high} />
        ))}
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">Reflection Notes (optional)</label>
        <textarea value={notes} onChange={e => onNotes(e.target.value)} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          placeholder="What went well? What would you do differently?" />
      </div>
    </div>
  )
}
