import { type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Props {
  title: string
  total: number
  expanded: boolean
  onToggle: () => void
  color: string
  children: ReactNode
}

export function EarningsGroup({ title, total, expanded, onToggle, color, children }: Props) {
  return (
    <div>
      <button className="w-full flex items-center justify-between py-3 cursor-pointer text-left" onClick={onToggle}>
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {title}
        </span>
        <span className="text-sm font-bold" style={{ color }}>${total.toLocaleString()}</span>
      </button>
      {expanded && <div className="pb-3 overflow-x-auto">{children}</div>}
    </div>
  )
}
