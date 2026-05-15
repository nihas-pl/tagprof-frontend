import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const TICKER = [
  { handle: '@noahbloom', action: 'tagged you in a story', time: '12s' },
  { handle: '@studio.lumen', action: 'redeemed code WELCOME15', time: '38s' },
  { handle: '@kira.daily', action: 'mentioned you in a reel', time: '1m' },
  { handle: '@haus.of.matcha', action: 'sent a DM via template', time: '2m' },
  { handle: '@oren.films', action: 'tagged you in a post', time: '3m' },
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
    <div
      className="min-h-screen w-full flex bg-[#fbf8f3] text-[#0e0e10] overflow-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes orbDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.08); }
        }
        @keyframes orbDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.12); }
        }
        @keyframes tickerScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .grain-overlay::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.18;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>");
        }
        .anim-fade-up { animation: fadeUp 0.7s cubic-bezier(.2,.7,.2,1) both; }
        .anim-orb-1 { animation: orbDrift 14s ease-in-out infinite; }
        .anim-orb-2 { animation: orbDrift2 18s ease-in-out infinite; }
        .anim-ticker { animation: tickerScroll 28s linear infinite; }
        .anim-pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
        .display-serif { font-family: 'Instrument Serif', 'Times New Roman', serif; font-weight: 400; letter-spacing: -0.01em; }
        .display-italic { font-family: 'Instrument Serif', serif; font-style: italic; }
        .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .input-underline {
          background: transparent !important;
          border: 0 !important;
          border-bottom: 1px solid #d8d3c8 !important;
          border-radius: 0 !important;
          padding-left: 28px !important;
          padding-right: 28px !important;
          height: 48px !important;
          font-size: 16px !important;
          transition: border-color .2s ease, box-shadow .2s ease !important;
          box-shadow: none !important;
        }
        .input-underline:focus,
        .input-underline:focus-visible {
          border-bottom-color: #0e0e10 !important;
          outline: none !important;
          box-shadow: 0 1px 0 0 #0e0e10 !important;
        }
        .input-underline::placeholder { color: #a8a297; }
        .field-icon { color: #6b6657; }
        .gradient-text {
          background: linear-gradient(92deg, #fcb045 0%, #fd1d1d 38%, #e1306c 62%, #833ab4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .btn-primary {
          background: #0e0e10;
          color: #fbf8f3;
          height: 54px;
          border-radius: 999px;
          font-weight: 500;
          letter-spacing: 0.01em;
          font-size: 15px;
          transition: transform .2s ease, background .2s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); background: #1a1a1f; }
        .btn-primary::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.18) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: shimmer 3.5s linear infinite;
          pointer-events: none;
        }
        .oauth-btn {
          height: 48px;
          border-radius: 999px;
          border: 1px solid #e6e0d3;
          background: #fbf8f3;
          color: #0e0e10;
          font-weight: 500;
          font-size: 14px;
          transition: border-color .2s ease, background .2s ease;
        }
        .oauth-btn:hover:not(:disabled) { border-color: #0e0e10; background: #f5f1e8; }
      `}</style>

      {/* ============= LEFT — EDITORIAL DARK PANEL ============= */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-[#0b0b0e] text-white grain-overlay flex-col">
        {/* gradient orbs */}
        <div
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-60 blur-3xl anim-orb-1 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #e1306c 0%, transparent 65%)' }}
        />
        <div
          className="absolute -bottom-32 -right-20 w-[560px] h-[560px] rounded-full opacity-50 blur-3xl anim-orb-2 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #833ab4 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fcb045 0%, transparent 70%)' }}
        />

        {/* fine grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* top bar */}
        <div className="relative z-10 flex items-center justify-between px-12 pt-10">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-md flex items-center justify-center relative"
              style={{
                background:
                  'conic-gradient(from 220deg, #fcb045, #fd1d1d, #e1306c, #833ab4, #fcb045)',
              }}
            >
              <div className="absolute inset-[3px] rounded-[4px] bg-[#0b0b0e] flex items-center justify-center">
                <span className="display-italic text-white text-lg leading-none">t</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-semibold text-[15px] tracking-tight">TagProf</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 mono text-[11px] text-white/55 uppercase tracking-[0.16em]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 anim-pulse-dot" />
              <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span>system · online</span>
          </div>
        </div>

        {/* editorial headline */}
        <div className="relative z-10 px-12 mt-20 anim-fade-up">

          <h1 className="display-serif text-[88px] leading-[0.92] tracking-tight">
            Hello,
            <br />
            <span className="display-italic gradient-text">again.</span>
          </h1>
          <p className="text-white/55 text-[15px] leading-relaxed max-w-md mt-8 font-light">
            Pick up where you left off. Your mentions, DM templates, and discount pools
            are quietly working in the background.
          </p>
        </div>

        {/* live ticker card */}
        <div className="relative z-10 mt-auto mx-12 mb-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="mono text-[10px] text-white/40 uppercase tracking-[0.22em] mb-1">
                live activity
              </div>
              <div className="text-white/80 text-sm">
                <span className="display-serif text-3xl text-white">+2,481</span>
                <span className="ml-2 text-white/40">mentions today</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mono text-[11px] text-emerald-400/90">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 anim-pulse-dot" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              live
            </div>
          </div>

          <div className="relative rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md overflow-hidden h-[124px]">
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#0b0b0e] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0b0b0e] to-transparent z-10 pointer-events-none" />
            <div className="anim-ticker">
              {[...TICKER, ...TICKER].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-7 w-7 rounded-full shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg, #fcb045, #e1306c, #833ab4)',
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-white text-[13px] font-medium truncate">
                        {row.handle}
                      </div>
                      <div className="text-white/45 text-[11px] truncate">{row.action}</div>
                    </div>
                  </div>
                  <div className="mono text-[10px] text-white/35 shrink-0">{row.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-7 pt-5 border-t border-white/[0.08]">
            <div>
              <div className="display-serif text-2xl text-white">500+</div>
              <div className="mono text-[10px] text-white/40 uppercase tracking-[0.18em] mt-1">
                brands growing
              </div>
            </div>
            <div>
              <div className="display-serif text-2xl text-white">12M<span className="text-white/50">+</span></div>
              <div className="mono text-[10px] text-white/40 uppercase tracking-[0.18em] mt-1">
                tags processed
              </div>
            </div>
            <div>
              <div className="display-serif text-2xl text-white">99.9<span className="text-white/50">%</span></div>
              <div className="mono text-[10px] text-white/40 uppercase tracking-[0.18em] mt-1">
                uptime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============= RIGHT — CREAM FORM PANEL ============= */}
      <div className="flex-1 relative flex flex-col">
        {/* soft warm accents */}
        <div
          className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fcb045 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-10 w-[360px] h-[360px] rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #e1306c 0%, transparent 70%)' }}
        />

        {/* top utility bar */}
        <div className="relative z-10 flex items-center justify-between px-10 lg:px-14 pt-8">
          {/* mobile brand */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center relative"
              style={{
                background:
                  'conic-gradient(from 220deg, #fcb045, #fd1d1d, #e1306c, #833ab4, #fcb045)',
              }}
            >
              <div className="absolute inset-[3px] rounded-[4px] bg-[#fbf8f3] flex items-center justify-center">
                <span className="display-italic text-[#0e0e10] text-base leading-none">t</span>
              </div>
            </div>
            <span className="text-[#0e0e10] font-semibold tracking-tight">tagprof</span>
          </div>
          <div className="hidden lg:block" />

          <div className="text-[13px] text-[#56504a]">
            New here?{' '}
            <Link
              to="/signup"
              className="text-[#0e0e10] font-medium underline decoration-[#e1306c] decoration-2 underline-offset-4 hover:decoration-[#833ab4] transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* form column */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-10 lg:px-14 py-10">
          <div className="w-full max-w-[440px] anim-fade-up">
            <div className="mono text-[11px] text-[#56504a] uppercase tracking-[0.28em] mb-5 flex items-center gap-3">
              <span className="inline-block w-6 h-px bg-[#56504a]/40" />
              welcome back
            </div>

            <h2 className="display-serif text-[56px] leading-[0.95] tracking-tight text-[#0e0e10] mb-3">
              Sign in to your
              <br />
              <span >workspace.</span>
            </h2>
            <p className="text-[#56504a] text-[15px] leading-relaxed mb-10 max-w-sm">
              Enter your credentials below to access your dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="mono text-[10px] uppercase tracking-[0.22em] text-[#56504a]"
                >
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="field-icon absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@studio.com"
                    className="input-underline"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="mono text-[10px] uppercase tracking-[0.22em] text-[#56504a]"
                  >
                    Password
                  </Label>
                  <Link
                    to="/passwords/new"
                    className="text-[12px] text-[#0e0e10] hover:text-[#e1306c] transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="field-icon absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className="input-underline"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#6b6657] hover:text-[#0e0e10] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="btn-primary w-full group" disabled={loading}>
                <span className="relative z-10 flex items-center justify-center w-full">
                  {loading ? (
                    'Signing you in…'
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            <div className="relative my-9">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e6e0d3]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#fbf8f3] px-4 mono text-[10px] text-[#6b6657] uppercase tracking-[0.28em]">
                  or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="oauth-btn"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleInstagramLogin}
                disabled={loading}
                className="oauth-btn"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  style={{
                    fill: 'url(#igGradBtn)',
                  }}
                >
                  <defs>
                    <linearGradient id="igGradBtn" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fcb045" />
                      <stop offset="50%" stopColor="#e1306c" />
                      <stop offset="100%" stopColor="#833ab4" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </Button>
            </div>

            <p className="mt-10 text-[12px] text-[#6b6657] leading-relaxed">
              By signing in, you agree to our{' '}
              <span className="underline decoration-[#d8d3c8] underline-offset-2 text-[#0e0e10]">
                Terms
              </span>{' '}
              and{' '}
              <span className="underline decoration-[#d8d3c8] underline-offset-2 text-[#0e0e10]">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>

        {/* bottom marker */}
        <div className="relative z-10 px-10 lg:px-14 pb-7 flex items-center justify-between mono text-[10px] text-[#6b6657] uppercase tracking-[0.22em]">
          <span>© tagprof · 2026</span>
          <span className="flex items-center gap-2">
            secured by tls 1.3
            <span className="h-1 w-1 rounded-full bg-[#6b6657]/40" />
            soc 2
          </span>
        </div>
      </div>
    </div>
  )
}
