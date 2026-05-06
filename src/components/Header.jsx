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
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

const titleMap = {
  '/': 'Dashboard',
  '/mentions': 'Mentions',
  '/auto-replies': 'Auto-Replies',
  '/discount-codes': 'Discount Codes',
  '/sentiment-filter': 'Sentiment Filter',
  '/verification': 'Verification',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/help': 'Help',
}

export function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = titleMap[pathname] || 'Tagprof'
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const handleLogout = () => {
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
          <p className="text-xs text-gray-500 hidden sm:block">
            {pathname === '/' ? "Welcome back, here's what's happening today." : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4 text-gray-600" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full hover:bg-gray-50 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium text-gray-900">{user?.name || 'User'}</span>
                <span className="text-[10px] text-gray-500">{user?.email || ''}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2 text-gray-500" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="h-4 w-4 mr-2 text-gray-500" /> Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
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
