import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { LogComments } from '../../components/ui/LogComments'
import type { ImplementationLog } from '../../types'

type Props = { log: ImplementationLog; onClose: () => void }

const FIDELITY_FIELDS: { key: keyof ImplementationLog; label: string }[] = [
  { key: 'ebpsDelivered', label: 'EBPs Delivered' },
  { key: 'amountDelivered', label: 'Amount Delivered' },
  { key: 'studentsEngaged', label: 'Students Engaged' },
  { key: 'effectiveDelivery', label: 'Effective Delivery' },
]

function scoreColor(v: number) {
  return v >= 4 ? 'text-emerald-600' : v >= 3 ? 'text-amber-500' : 'text-red-500'
}

export function LogDetailModal({ log, onClose }: Props) {
  const completionColor = log.lessonCompletion === 'fully' ? 'green' : log.lessonCompletion === 'partially' ? 'amber' : 'red'
  const hasFidelity = log.ebpsDelivered != null
  const hasUnexpected = log.unexpectedEvent && log.unexpectedEvent !== 'none'

  return (
    <Modal open onClose={onClose} title={`Log — ${log.date}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge color={completionColor}>{log.lessonCompletion.replace('_', ' ')}</Badge>
          <Badge color="blue">{log.tier}</Badge>
          {log.startTime && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{log.startTime}</span>}
          {log.adaptationOccurred && <Badge color="purple">Adapted</Badge>}
          {hasUnexpected && <Badge color={log.unexpectedEvent === 'good' ? 'green' : 'red'}>Unexpected — {log.unexpectedEvent}</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-gray-50 rounded-xl p-3">
          {log.sectionName && <div className="col-span-2"><p className="text-gray-400">Section</p><p className="text-gray-700 font-medium">{log.sectionName}</p></div>}
          {log.mathSkill && <div><p className="text-gray-400">Math Skill</p><p className="text-gray-700 font-medium">{log.mathSkill}</p></div>}
          {log.groupSize && <div><p className="text-gray-400">Group Size</p><p className="text-gray-700 font-medium">{log.groupSize}</p></div>}
          <div><p className="text-gray-400">Duration</p><p className="text-gray-700 font-medium">{log.durationMinutes} min</p></div>
          {log.ebpComponent.length > 0 && (
            <div className="col-span-2"><p className="text-gray-400">EBP Components</p><p className="text-gray-700 font-medium">{log.ebpComponent.join(', ')}</p></div>
          )}
          {log.anticipatesAdaptation && log.plannedAdaptationTypes && log.plannedAdaptationTypes.length > 0 && (
            <div className="col-span-2"><p className="text-gray-400">Planned Adaptations</p><p className="text-gray-700 font-medium">{log.plannedAdaptationTypes.join(', ')}</p></div>
          )}
        </div>

        {hasFidelity && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">Fidelity <span className="font-normal">(1 = Not at all · 5 = Completely)</span></p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {FIDELITY_FIELDS.map(({ key, label }) => {
                const v = log[key] as number | undefined
                return v != null ? (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-600">{label}</span>
                    <span className={`font-semibold ${scoreColor(v)}`}>{v}/5</span>
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}

        {log.adaptationImpl && (
          <div className="text-xs bg-purple-50 rounded-xl px-3 py-2 space-y-1">
            <p className="text-gray-400">Planned Adaptation — Implementation</p>
            <p className="text-purple-700 font-medium capitalize">{log.adaptationImpl.replace(/_/g, ' ')}</p>
            {log.adaptationPartialNotes && <p className="text-gray-600 italic">"{log.adaptationPartialNotes}"</p>}
            {log.adaptationNotImplReason && <p className="text-gray-600 italic">"{log.adaptationNotImplReason}"</p>}
          </div>
        )}

        {hasUnexpected && (
          <div className={`text-xs rounded-xl px-3 py-2 space-y-1 ${log.unexpectedEvent === 'good' ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <p className="text-gray-400">Unexpected Event</p>
            {log.unexpectedDetail && <p className="text-gray-700">"{log.unexpectedDetail}"</p>}
            {log.unplannedAdaptCauses && log.unplannedAdaptCauses.length > 0 && (
              <p className="text-gray-500">Causes: {log.unplannedAdaptCauses.join(' · ')}</p>
            )}
          </div>
        )}

        {log.studentAvgScore != null && (
          <div className="text-xs bg-blue-50 rounded-xl px-3 py-2 flex items-center justify-between">
            <p className="text-gray-400">Student Avg Score</p>
            <p className="text-blue-700 font-semibold text-sm">{log.studentAvgScore}%</p>
          </div>
        )}

        {log.notes && (
          <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">"{log.notes}"</p>
        )}

        <div className="border-t border-gray-100 pt-4">
          <LogComments logId={log.id} />
        </div>
      </div>
    </Modal>
  )
}
