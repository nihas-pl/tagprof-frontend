import { ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'

export function StatCard({ label, value, sub, trend, trendDirection = 'up', children, className }) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              trendDirection === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700',
            )}
          >
            {trendDirection === 'up' ? (
              <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
            ) : (
              <ArrowDown className="h-3 w-3" strokeWidth={2.5} />
            )}
            {trend}
          </span>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </Card>
  )
}
