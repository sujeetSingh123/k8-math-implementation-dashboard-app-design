import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { LogComments } from '../../components/ui/LogComments'
import type { ImplementationLog } from '../../types'

type Props = { log: ImplementationLog; onClose: () => void }

export function LogDetailModal({ log, onClose }: Props) {
  const completionColor =
    log.lessonCompletion === 'fully' ? 'green' : log.lessonCompletion === 'partially' ? 'amber' : 'red'

  return (
    <Modal open onClose={onClose} title={`Log — ${log.date}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge color={completionColor}>{log.lessonCompletion.replace('_', ' ')}</Badge>
          <Badge color="blue">{log.tier}</Badge>
          {log.startTime && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{log.startTime}</span>
          )}
          {log.adaptationOccurred && <Badge color="purple">Adapted</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-gray-50 rounded-xl p-3">
          {log.mathSkill && <div><p className="text-gray-400">Math Skill</p><p className="text-gray-700 font-medium">{log.mathSkill}</p></div>}
          {log.groupSize && <div><p className="text-gray-400">Group Size</p><p className="text-gray-700 font-medium">{log.groupSize}</p></div>}
          {log.instructionalRoutine && <div><p className="text-gray-400">Routine</p><p className="text-gray-700 font-medium">{log.instructionalRoutine}</p></div>}
          <div><p className="text-gray-400">Duration</p><p className="text-gray-700 font-medium">{log.durationMinutes} min</p></div>
          {log.implementationStrategy && <div><p className="text-gray-400">Strategy</p><p className="text-gray-700 font-medium">{log.implementationStrategy}</p></div>}
          <div><p className="text-gray-400">EBP Components</p><p className="text-gray-700 font-medium">{log.ebpComponent.join(', ')}</p></div>
        </div>

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
