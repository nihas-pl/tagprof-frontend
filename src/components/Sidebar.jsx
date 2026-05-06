import { NavLink } from 'react-router-dom'
import {
  Home,
  AtSign,
  MessageSquare,
  Tag,
  Package,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/mentions', label: 'Mentions', icon: AtSign },
  { to: '/campaigns', label: 'Campaigns', icon: Package },
  { to: '/discount-codes', label: 'Discount Codes', icon: Tag },
  { to: '/dm-templates', label: 'DM Templates', icon: MessageSquare },
  { to: '/sentiment-filter', label: 'Sentiment Filter', icon: ShieldCheck },
  { to: '/verification', label: 'Verification', icon: CheckCircle },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function Sidebar({ onNavigate }) {
  return (
    <aside className="w-60 shrink-0 h-full border-r border-gray-200 bg-white flex flex-col">
      <div className="h-16 px-5 flex items-center gap-2 border-b border-gray-200">
        <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center shadow-sm">
          <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-gray-900">Tagprof</span>
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                    isActive
                      ? 'bg-brand/5 text-brand font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full transition-all',
                        isActive ? 'bg-brand' : 'bg-transparent',
                      )}
                    />
                    <item.icon className={cn('h-4 w-4', isActive ? 'text-brand' : 'text-gray-400 group-hover:text-gray-600')} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="m-3 rounded-lg border border-gray-200 bg-gradient-to-br from-brand/5 to-teal-50 p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-900">
          <Tag className="h-3.5 w-3.5 text-brand" />
          Pro Tip
        </div>
        <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
          Monitor sentiment scores to optimize your discount code assignments.
        </p>
      </div>
    </aside>
  )
}
