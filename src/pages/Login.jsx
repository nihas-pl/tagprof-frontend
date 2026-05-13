import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const AVATARS = [
  'https://i.pravatar.cc/40?img=5',
  'https://i.pravatar.cc/40?img=6',
  'https://i.pravatar.cc/40?img=7',
  'https://i.pravatar.cc/40?img=8',
]

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.auth.login(formData.email, formData.password)
      const { user, token } = response.data
      setAuth(user, token)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error) {
      const message = error.response?.data?.error || 'Invalid email or password'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = api.oauth.getGoogleAuthUrl()
  }

  const handleInstagramLogin = () => {
    window.location.href = api.oauth.getInstagramAuthUrl()
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#0a0a0a] flex-col relative overflow-hidden m-10 rounded-2xl">
        {/* Brand logo top-left */}
        <div className="relative z-10 flex items-center gap-2.5 px-8 pt-7">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#fcb045] via-[#e1306c] to-[#833ab4] flex items-center justify-center shadow-lg">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-base tracking-tight">tagprof</span>
        </div>

        <div className="absolute top-0 right-0 w-72 h-72 opacity-20 pointer-events-none">
          <svg viewBox="0 0 300 300" fill="none" className="w-full h-full">
            <line x1="300" y1="0" x2="0" y2="300" stroke="white" strokeWidth="0.5" />
            <line x1="300" y1="0" x2="60" y2="300" stroke="white" strokeWidth="0.5" />
            <line x1="300" y1="0" x2="120" y2="300" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-72 h-72 opacity-10 pointer-events-none rotate-180">
          <svg viewBox="0 0 300 300" fill="none" className="w-full h-full">
            <line x1="300" y1="0" x2="0" y2="300" stroke="white" strokeWidth="0.5" />
            <line x1="300" y1="0" x2="60" y2="300" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="flex-1 flex items-center justify-center px-12 pt-4">
          <svg viewBox="0 0 320 320" fill="none" className="w-72 h-72">
            <defs>
              <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fcb045" />
                <stop offset="35%" stopColor="#fd1d1d" />
                <stop offset="65%" stopColor="#e1306c" />
                <stop offset="100%" stopColor="#833ab4" />
              </linearGradient>
              <linearGradient id="igGradFaint" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fcb045" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#833ab4" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <circle cx="160" cy="160" r="130" stroke="url(#igGradFaint)" strokeWidth="1" />
            <circle cx="160" cy="160" r="100" stroke="url(#igGradFaint)" strokeWidth="0.6" />
            <rect x="80" y="80" width="160" height="160" rx="42" stroke="url(#igGrad)" strokeWidth="2.5" />
            <circle cx="160" cy="160" r="42" stroke="url(#igGrad)" strokeWidth="2.5" />
            <circle cx="160" cy="160" r="28" stroke="url(#igGrad)" strokeWidth="1.5" strokeOpacity="0.5" />
            <circle cx="160" cy="160" r="8" fill="url(#igGrad)" fillOpacity="0.8" />
            <circle cx="213" cy="107" r="8" fill="url(#igGrad)" fillOpacity="0.6" />
            <circle cx="213" cy="107" r="4" fill="#fcb045" fillOpacity="0.95" />
            <circle cx="94" cy="94" r="3" fill="#833ab4" fillOpacity="0.5" />
            <circle cx="226" cy="226" r="3" fill="#fd1d1d" fillOpacity="0.5" />
            <line x1="160" y1="30" x2="160" y2="58" stroke="url(#igGrad)" strokeWidth="1" strokeOpacity="0.3" />
            <line x1="160" y1="262" x2="160" y2="290" stroke="url(#igGrad)" strokeWidth="1" strokeOpacity="0.3" />
            <line x1="30" y1="160" x2="58" y2="160" stroke="url(#igGrad)" strokeWidth="1" strokeOpacity="0.3" />
            <line x1="262" y1="160" x2="290" y2="160" stroke="url(#igGrad)" strokeWidth="1" strokeOpacity="0.3" />
          </svg>
        </div>

        <div className="px-12 pb-4 space-y-">
          <h2 className="text-4xl font-bold text-white leading-tight">Welcome back</h2>
          <p className="text-white/55 text-sm leading-relaxed max-w-xs">
            Sign in to manage your Instagram campaigns, DM templates, and discount code pools.
          </p>
          <p className="text-white/35 text-sm">More than 500 brands are already growing with us</p>
        </div>

        <div className="mx-8 mb-10 mt-6 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm p-5">
          <h3 className="text-white font-semibold text-base leading-snug mb-1">Your audience is waiting</h3>
          <p className="text-white/45 text-xs leading-relaxed mb-4">
            Every mention is an opportunity. Log in and start rewarding your followers automatically.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] object-cover" />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-white/15 flex items-center justify-center">
                <span className="text-white text-[10px] font-semibold">+2</span>
              </div>
            </div>
            <p className="text-white/40 text-xs">active this week</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8  overflow-y-auto">
        <div className="w-full max-w-md space-y-8 px-8">
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-gray-900">tagprof</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
            <p className="text-sm text-gray-500">Welcome back — let's pick up where you left off</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/passwords/new" className="text-xs text-brand hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleGoogleLogin} disabled={loading} className="h-10">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
            <Button variant="outline" onClick={handleInstagramLogin} disabled={loading} className="h-10">
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
