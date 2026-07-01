import { useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/useAppStore'
import { getSemester } from '../../utils/incentiveCalc'

interface Props {
  semester: string
}

export function AwardHistoryTab({ semester }: Props) {
  const { incentives } = useAppStore()

  const semesterIncentives = useMemo(
    () => [...incentives.filter(i => getSemester(i.awardedAt) === semester)].sort((a, b) => b.awardedAt.localeCompare(a.awardedAt)),
    [incentives, semester],
  )

  return (
    <Card title={`Award History — ${semester}`}>
      {semesterIncentives.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No incentives awarded or pending for {semester}.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {semesterIncentives.map(inc => (
            <div key={inc.id} className="py-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{inc.recipientName}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium capitalize">{inc.recipientRole}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-purple-200 text-purple-700 bg-purple-50 capitalize">
                    {inc.category}
                  </span>
                  <Badge color={inc.status === 'approved' ? 'green' : 'amber'}>
                    {inc.status === 'approved' ? 'Approved' : 'Pending'}
                  </Badge>
                  <span className="text-xs text-gray-400">{inc.awardedAt}</span>
                </div>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-600">${inc.amount} for:</span> {inc.reason}
                </p>
              </div>
              <span className="text-lg font-bold text-gray-800 flex-shrink-0">${inc.amount}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
