import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Home,
  AtSign,
  MessageSquare,
  Tag,
  Package,
  CheckCircle,
  Sparkles,
  Settings as SettingsIcon,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useSubscriptionStore from '@/stores/subscriptionStore'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/mentions', label: 'Mentions', icon: AtSign },
  { to: '/campaigns', label: 'Campaigns', icon: Package },
  { to: '/discount-codes', label: 'Discount Codes', icon: Tag },
  { to: '/dm-templates', label: 'DM Templates', icon: MessageSquare },
  { to: '/verification', label: 'Verification', icon: CheckCircle },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function Sidebar({ onNavigate }) {
  const navigate = useNavigate()
  const { subscription, loading } = useSubscriptionStore()
  const isFree = !subscription || subscription.plan_tier === 'free'
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      // Small delay so the fade-in is visible even on fast loads
      const t = setTimeout(() => setReady(true), 80)
      return () => clearTimeout(t)
    }
  }, [loading])
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

      {isFree ? (
        <div className={`m-3 rounded-lg border border-brand/20 bg-gradient-to-br from-brand/10 to-violet-50 p-3 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand">
            <Zap className="h-3.5 w-3.5" />
            Upgrade to Pro
          </div>
          <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
            Unlock unlimited mentions, campaigns, and automated DMs.
          </p>
          <button
            onClick={() => { navigate('/settings?tab=billing'); onNavigate?.() }}
            className="mt-2.5 w-full rounded-md bg-brand px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-brand/90 transition-colors"
          >
            Upgrade Now →
          </button>
        </div>
      ) : (
        <div className={`m-3 rounded-lg border border-gray-200 bg-gradient-to-br from-brand/5 to-teal-50 p-3 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-900">
            <Tag className="h-3.5 w-3.5 text-brand" />
            Pro Tip
          </div>
          <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
            Set up discount code pools so every customer automatically receives a unique code.
          </p>
        </div>
      )}
    </aside>
  )
}
