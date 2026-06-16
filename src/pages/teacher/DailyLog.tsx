import { useState, useRef } from 'react'
import { Save, PlusCircle, MessageCircle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PrePlanCard } from './PrePlanCard'
import { PostReflectionCard } from './PostReflectionCard'
import { toast } from '../../store/useToastStore'
import type { ImplementationLog } from '../../types'
import type { PrePlanRef } from './PrePlanCard'
import type { PostReflectionRef } from './PostReflectionCard'

const roleColor = '#10B981'

export function DailyLog() {
  const { currentUser, implementationLogs, coachingCycles, addLog, addFidelityCheck, sendMessage } = useAppStore()
  const today = new Date().toISOString().split('T')[0]
  const todaySections = implementationLogs.filter(l => l.teacherId === currentUser.id && l.date === today)

  const [addingNew, setAddingNew] = useState(todaySections.length === 0)
  const [anticipatesAdaptation, setAnticipatesAdaptation] = useState(false)
  const [coachMessage, setCoachMessage] = useState('')

  const prePlanRef = useRef<PrePlanRef>(null)
  const postRef = useRef<PostReflectionRef>(null)

  const teacherCycle = coachingCycles.find(c => c.teacherId === currentUser.id && c.status === 'active')

  const handleSave = () => {
    const preValid = prePlanRef.current?.validate() ?? false
    const postValid = postRef.current?.validate() ?? false
    if (!preValid || !postValid) return

    const preData = prePlanRef.current!.getData()
    const postData = postRef.current!.getData()

    const logId = `log-new-${Date.now()}`
    const newLog: ImplementationLog = {
      id: logId,
      teacherId: currentUser.id,
      schoolId: currentUser.schoolId,
      sectionName: preData.sectionName || undefined,
      date: postData.date,
      startTime: postData.startTime || undefined,
      tier: preData.tiers[0],
      mathSkill: preData.mathSkill,
      groupSize: preData.groupSize,
      ebpComponent: preData.ebpComponents,
      anticipatesAdaptation: preData.anticipatesAdaptation,
      plannedAdaptationTypes: preData.plannedAdaptationTypes.length > 0 ? preData.plannedAdaptationTypes : undefined,
      durationMinutes: postData.durationMinutes,
      lessonCompletion: postData.lessonCompletion,
      ebpsDelivered: postData.fidelity.ebpsDelivered,
      amountDelivered: postData.fidelity.amountDelivered,
      studentsEngaged: postData.fidelity.studentsEngaged,
      effectiveDelivery: postData.fidelity.effectiveDelivery,
      adaptationImpl: postData.adaptationImpl,
      adaptationPartialNotes: postData.adaptationPartialNotes,
      adaptationNotImplReason: postData.adaptationNotImplReason,
      unexpectedEvent: postData.unexpectedEvent,
      unexpectedDetail: postData.unexpectedDetail,
      unplannedAdaptCauses: postData.unplannedAdaptCauses.length > 0 ? postData.unplannedAdaptCauses : undefined,
      studentAvgScore: postData.studentAvgScore,
      notes: preData.tiers.length > 1 ? `Tiers: ${preData.tiers.join(', ')}` : undefined,
      adaptationOccurred: postData.unexpectedEvent !== 'none' || (preData.anticipatesAdaptation && !!postData.adaptationImpl && postData.adaptationImpl !== 'not_implemented'),
    }
    addLog(newLog)

    const avg4 = (postData.fidelity.ebpsDelivered + postData.fidelity.amountDelivered + postData.fidelity.studentsEngaged + postData.fidelity.effectiveDelivery) / 4
    addFidelityCheck({
      id: `fid-new-${Date.now()}`,
      teacherId: currentUser.id,
      logId,
      date: postData.date,
      adherence: postData.fidelity.ebpsDelivered,
      dosage: postData.fidelity.amountDelivered,
      quality: postData.fidelity.effectiveDelivery,
      responsiveness: postData.fidelity.studentsEngaged,
      confidence: Math.round(avg4 * 10) / 10,
    })

    if (coachMessage.trim() && teacherCycle) {
      sendMessage(teacherCycle.id, {
        id: `msg-log-${Date.now()}`,
        cycleId: teacherCycle.id,
        senderId: currentUser.id,
        body: coachMessage.trim(),
        createdAt: new Date().toISOString(),
      })
    }

    toast.success(`Log entry saved${preData.sectionName ? ` (${preData.sectionName})` : ''}!`)
    setCoachMessage('')
    setAnticipatesAdaptation(false)
    setAddingNew(false)
  }

  const startNewSection = () => {
    setAnticipatesAdaptation(false)
    setCoachMessage('')
    setAddingNew(true)
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {todaySections.length > 0 && (
        <Card>
          <p className="text-sm font-semibold text-gray-800 mb-3">
            Today's Logged Sections <span className="text-gray-400 font-normal">({todaySections.length})</span>
          </p>
          <div className="space-y-2">
            {todaySections.map(log => (
              <div key={log.id} className="flex items-center gap-2 py-1.5 text-sm text-gray-700 border-b border-gray-50 last:border-0">
                <Badge color={log.lessonCompletion === 'fully' ? 'green' : log.lessonCompletion === 'partially' ? 'amber' : 'red'}>
                  {log.lessonCompletion.replace('_', ' ')}
                </Badge>
                {log.sectionName && <span className="font-medium">{log.sectionName}</span>}
                <span className="text-gray-500">{log.tier} · {log.mathSkill ?? log.instructionalRoutine ?? '—'}</span>
                <span className="text-xs text-gray-400 ml-auto">{log.durationMinutes} min</span>
              </div>
            ))}
          </div>
          {!addingNew && (
            <button type="button" onClick={startNewSection}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: roleColor }}>
              <PlusCircle size={15} />Log another section
            </button>
          )}
        </Card>
      )}

      {addingNew && (
        <>
          <PrePlanCard ref={prePlanRef} onAnticipatesChange={v => setAnticipatesAdaptation(v ?? false)} />
          <PostReflectionCard ref={postRef} anticipatesAdaptation={anticipatesAdaptation} />

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={15} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-800">Message to Coach</p>
              <span className="text-xs text-gray-400">(optional)</span>
            </div>
            <textarea
              value={coachMessage}
              onChange={e => setCoachMessage(e.target.value)}
              rows={3}
              placeholder="Share a quick note with your coach about today's lesson, any questions, or what you'd like feedback on..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            />
            {!teacherCycle && coachMessage.trim() && (
              <p className="text-xs text-amber-600 mt-1.5">No active coaching cycle found — message will not be sent.</p>
            )}
          </Card>

          <div className="flex gap-2">
            <Button roleColor={roleColor} onClick={handleSave}>
              <Save size={15} />Save Log Entry
            </Button>
            {todaySections.length > 0 && (
              <Button variant="ghost" roleColor={roleColor} onClick={() => setAddingNew(false)}>Cancel</Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
