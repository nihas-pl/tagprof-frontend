import { Bell, Menu, ChevronDown, LogOut, User, CreditCard, Settings as SettingsIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import useSubscriptionStore from '@/stores/subscriptionStore'
import { toast } from 'sonner'

const titleMap = {
  '/': 'Dashboard',
  '/mentions': 'Mentions',
  '/auto-replies': 'Auto-Replies',
  '/dm-templates': 'DM Templates',
  '/campaigns': 'Campaigns',
  '/discount-codes': 'Discount Codes',
  '/verification': 'Verification',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/help': 'Help',
}

const subtitleMap = {
  '/': "Welcome back, here's what's happening today.",
  '/mentions': 'View and manage all Instagram mentions.',
  '/auto-replies': 'Configure automated replies for incoming mentions.',
  '/dm-templates': 'Create and manage your direct message templates.',
  '/campaigns': 'Run discount campaigns and track their performance.',
  '/discount-codes': 'Manage your discount code pools.',
  '/verification': 'Review and verify pending mention responses.',
  '/analytics': 'Insights and performance metrics for your account.',
  '/settings': 'Manage your account, integrations, and billing.',
  '/help': 'Find answers and get support.',
}

export function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = titleMap[pathname] || 'Tagprof'
  const subtitle = subtitleMap[pathname] || ''
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const clearSubscription = useSubscriptionStore((state) => state.reset)

  const handleLogout = async () => {
    try {
      await api.auth.logout()
    } catch {
      // Proceed with local logout even if server call fails
    }
    // Clear all persisted store data so the next user starts fresh
    localStorage.removeItem('subscription-storage')
    localStorage.removeItem('settings-storage')
    clearSubscription()
    clearAuth()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-500 hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4 text-gray-600" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand"></span>
        </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center border outline-none gap-2 pl-2 pr-3 py-1 rounded-full hover:bg-gray-50 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-gray-900">{user?.name || 'User'}</span>
                <span className="text-xs text-gray-500">{user?.email || ''}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings?tab=account')}>
              <User className="h-4 w-4 mr-2 text-gray-500" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings?tab=billing')}>
              <CreditCard className="h-4 w-4 mr-2 text-gray-500" /> Billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <SettingsIcon className="h-4 w-4 mr-2 text-gray-500" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
