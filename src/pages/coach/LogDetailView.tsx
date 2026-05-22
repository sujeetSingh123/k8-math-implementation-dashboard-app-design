import { ArrowLeft } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { roleColors } from '../../constants/roles'
import type { Adaptation, FidelityCheck, ImplementationLog } from '../../types'

const roleColor = roleColors.coach

type Props = {
  log: ImplementationLog
  adaptation: Adaptation | undefined
  fidelityCheck: FidelityCheck | undefined
  onBack: () => void
}

export function LogDetailView({ log, adaptation, fidelityCheck, onBack }: Props) {
  const completionColor = log.lessonCompletion === 'fully' ? 'green' : log.lessonCompletion === 'partially' ? 'amber' : 'red'

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
        <ArrowLeft size={12} /> Back to logs
      </button>

      <div className="bg-gray-50 rounded-xl p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{log.date}</span>
          <Badge color={completionColor}>{log.lessonCompletion.replace('_', ' ')}</Badge>
          <Badge color="blue">{log.tier}</Badge>
          {log.adaptationOccurred && <Badge color="purple">Adaptation</Badge>}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <p className="text-gray-400">Routine</p>
            <p className="text-gray-700 font-medium">{log.instructionalRoutine}</p>
          </div>
          <div>
            <p className="text-gray-400">EBP Component</p>
            <p className="text-gray-700 font-medium">{log.ebpComponent}</p>
          </div>
          <div>
            <p className="text-gray-400">Strategy</p>
            <p className="text-gray-700 font-medium">{log.implementationStrategy}</p>
          </div>
          <div>
            <p className="text-gray-400">Duration</p>
            <p className="text-gray-700 font-medium">{log.durationMinutes} min</p>
          </div>
        </div>
        {log.notes && (
          <div className="text-xs">
            <p className="text-gray-400 mb-0.5">Notes</p>
            <p className="text-gray-700">{log.notes}</p>
          </div>
        )}
      </div>

      {fidelityCheck && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fidelity Check</p>
          <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-5 gap-2 text-center">
            {(
              [
                { label: 'Adherence', value: fidelityCheck.adherence },
                { label: 'Dosage', value: fidelityCheck.dosage },
                { label: 'Quality', value: fidelityCheck.quality },
                { label: 'Resp.', value: fidelityCheck.responsiveness },
                { label: 'Confidence', value: fidelityCheck.confidence },
              ] as const
            ).map(d => (
              <div key={d.label}>
                <p className="text-sm font-bold" style={{ color: roleColor }}>{d.value.toFixed(1)}</p>
                <p className="text-xs text-gray-400">{d.label}</p>
              </div>
            ))}
          </div>
          {fidelityCheck.reflectionNotes && (
            <p className="text-xs text-gray-500 italic px-1">"{fidelityCheck.reflectionNotes}"</p>
          )}
        </div>
      )}

      {adaptation && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adaptation</p>
          <div className="bg-purple-50 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex gap-2 flex-wrap">
              <Badge color={adaptation.fidelityType === 'consistent' ? 'green' : 'amber'}>{adaptation.fidelityType}</Badge>
              <Badge color={adaptation.plannedVsReactive === 'planned' ? 'blue' : 'red'}>{adaptation.plannedVsReactive}</Badge>
            </div>
            <div>
              <p className="text-gray-400">What was modified</p>
              <p className="text-gray-700 font-medium">{adaptation.whatModified.join(', ')}</p>
            </div>
            <div>
              <p className="text-gray-400">Reasons</p>
              <p className="text-gray-700 font-medium">{adaptation.reasons.join(', ')}</p>
            </div>
            <div>
              <p className="text-gray-400">Description</p>
              <p className="text-gray-700">{adaptation.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
