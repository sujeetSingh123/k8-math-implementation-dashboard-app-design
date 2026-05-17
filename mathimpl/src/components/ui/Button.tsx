import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  roleColor?: string
  children: ReactNode
  fullWidth?: boolean
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  roleColor,
  children,
  fullWidth,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  let variantClass = ''
  let variantStyle: React.CSSProperties = {}

  if (variant === 'primary') {
    variantClass = 'text-white shadow-sm hover:opacity-90'
    variantStyle = { backgroundColor: roleColor ?? '#6B7280' }
  } else if (variant === 'secondary') {
    variantClass = 'bg-white border hover:bg-gray-50'
    variantStyle = {
      borderColor: roleColor ?? '#6B7280',
      color: roleColor ?? '#6B7280',
    }
  } else if (variant === 'ghost') {
    variantClass = 'bg-transparent hover:bg-gray-100'
    variantStyle = { color: roleColor ?? '#6B7280' }
  } else if (variant === 'danger') {
    variantClass = 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
  }

  return (
    <button
      className={`${base} ${variantClass} ${sizeClasses[size]} ${fullWidth ? 'w-full justify-center' : ''} ${className}`}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
