interface LikertScaleProps {
  label: string
  value: number
  onChange: (v: number) => void
  roleColor: string
  lowLabel?: string
  highLabel?: string
}

export function LikertScale({ label, value, onChange, roleColor, lowLabel = 'Low', highLabel = 'High' }: LikertScaleProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[200px]">
          {lowLabel} → {highLabel}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="flex-1 sm:flex-none w-auto sm:w-10 h-10 rounded-lg text-sm font-semibold border-2 transition-all duration-150 cursor-pointer"
            style={{
              borderColor: value === n ? roleColor : '#D1D5DB',
              backgroundColor: value === n ? roleColor : '#FFFFFF',
              color: value === n ? '#FFFFFF' : '#6B7280',
            }}
          >
            {n}
          </button>
        ))}
        <span className="text-xs text-gray-400 sm:hidden ml-1 truncate">{value}/5</span>
      </div>
    </div>
  )
}
