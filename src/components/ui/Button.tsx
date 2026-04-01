import React from 'react'

type Variant = 'ghost' | 'solid' | 'danger' | 'outline'
type Size = 'xs' | 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  active?: boolean
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  ghost:
    'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-gray-100',
  solid:
    'bg-amber-400 hover:bg-amber-500 text-amber-900 font-medium shadow-sm',
  danger:
    'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
  outline:
    'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
}

const sizeClasses: Record<Size, string> = {
  xs: 'h-6 w-6 rounded-md text-xs',
  sm: 'h-7 w-7 rounded-lg text-sm',
  md: 'h-8 px-3 rounded-lg text-sm gap-1.5',
}

export function IconButton({
  variant = 'ghost',
  size = 'sm',
  active = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
        variantClasses[variant],
        sizeClasses[size],
        active ? 'bg-black/8 dark:bg-white/12 text-gray-900 dark:text-gray-100' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

export function Button({
  variant = 'ghost',
  size = 'md',
  active = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
        variantClasses[variant],
        sizeClasses[size],
        active ? 'bg-black/8 dark:bg-white/12' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
