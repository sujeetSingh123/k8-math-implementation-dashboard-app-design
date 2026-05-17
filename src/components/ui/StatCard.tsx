import { type ReactNode } from 'react'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  iconColor?: string
}

export function StatCard({ label, value, sub, icon, iconColor }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconColor ? `${iconColor}18` : '#F3F4F6', color: iconColor ?? '#6B7280' }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
