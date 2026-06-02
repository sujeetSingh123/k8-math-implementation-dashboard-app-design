export type TimePeriod = 'day' | 'week' | 'year'

const LABELS: Record<TimePeriod, string> = { day: 'Days', week: 'Weeks', year: 'Year' }

interface Props {
  value: TimePeriod
  onChange: (p: TimePeriod) => void
}

export function TimePeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {(['day', 'week', 'year'] as TimePeriod[]).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
            value === p
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {LABELS[p]}
        </button>
      ))}
    </div>
  )
}
