import { GraduationCap, Clock, Calendar } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import type { TrainingSession } from '../../types'

const roleColor = '#10B981'

const typeBadgeColors: Record<string, 'blue' | 'purple' | 'green'> = {
  training: 'blue',
  coaching: 'purple',
  lab: 'green',
}

export function TrainingHistory() {
  const { currentUser, trainingSessions } = useAppStore()
  const sessions = trainingSessions[currentUser.id] ?? []

  const attended = sessions.filter(s => s.attended)
  const hoursLogged = attended.reduce((sum, s) => sum + s.durationHours, 0)
  const nextSession = sessions
    .filter(s => new Date(s.date) > new Date())
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const columns = [
    { key: 'date', header: 'Date' },
    { key: 'title', header: 'Session Name' },
    {
      key: 'type',
      header: 'Type',
      render: (row: TrainingSession) => (
        <Badge color={typeBadgeColors[row.type] ?? 'gray'}>{row.type}</Badge>
      ),
    },
    {
      key: 'durationHours',
      header: 'Duration',
      render: (row: TrainingSession) => `${row.durationHours}h`,
    },
    {
      key: 'attended',
      header: 'Status',
      render: (row: TrainingSession) => (
        <Badge color={row.attended ? 'green' : 'red'}>{row.attended ? 'Attended' : 'Missed'}</Badge>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Sessions Attended"
          value={`${attended.length}/${sessions.length}`}
          sub={`${Math.round((attended.length / Math.max(sessions.length, 1)) * 100)}% attendance rate`}
          icon={<GraduationCap size={18} />}
          iconColor={roleColor}
        />
        <StatCard
          label="Hours Logged"
          value={hoursLogged.toFixed(1)}
          sub="Professional development hours"
          icon={<Clock size={18} />}
          iconColor={roleColor}
        />
        <StatCard
          label="Next Session"
          value={nextSession ? new Date(nextSession.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : 'None'}
          sub={nextSession?.title ?? 'No upcoming sessions'}
          icon={<Calendar size={18} />}
          iconColor={roleColor}
        />
      </div>
      <Card padding="none">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Training Sessions</h2>
        </div>
        <Table
          columns={columns as Parameters<typeof Table>[0]['columns']}
          data={sessions as unknown as Record<string, unknown>[]}
          emptyMessage="No training sessions found."
          emptyIcon={<GraduationCap size={24} />}
        />
      </Card>
    </div>
  )
}
