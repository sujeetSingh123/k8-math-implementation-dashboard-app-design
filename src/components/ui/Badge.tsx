import { type ReactNode } from 'react'

type Color = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gray'

interface BadgeProps {
  color?: Color
  children: ReactNode
  size?: 'sm' | 'md'
}

const colorClasses: Record<Color, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-gray-100 text-gray-600',
}

export function Badge({ color = 'gray', children, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colorClasses[color]} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
    >
      {children}
    </span>
  )
}
