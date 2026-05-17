interface ChipSelectorProps {
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
  roleColor: string
  multiSelect?: boolean
}

export function ChipSelector({ options, value, onChange, roleColor, multiSelect = true }: ChipSelectorProps) {
  const toggle = (opt: string) => {
    if (multiSelect) {
      onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])
    } else {
      onChange(value.includes(opt) ? [] : [opt])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className="px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-150 cursor-pointer"
            style={{
              borderColor: selected ? roleColor : '#D1D5DB',
              backgroundColor: selected ? roleColor : '#FFFFFF',
              color: selected ? '#FFFFFF' : '#6B7280',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
