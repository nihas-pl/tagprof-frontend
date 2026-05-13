import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand/10 text-brand-700',
        secondary: 'bg-gray-100 text-gray-700',
        outline: 'border border-gray-200 text-gray-700',
        positive: 'bg-emerald-50 text-emerald-700',
        neutral: 'bg-gray-100 text-gray-700',
        negative: 'bg-red-50 text-red-700',
        destructive: 'bg-red-50 text-red-700', // Alias for negative
        teal: 'bg-teal-50 text-teal-600',
        warning: 'bg-amber-50 text-amber-700',
        success: 'bg-emerald-50 text-emerald-700',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
