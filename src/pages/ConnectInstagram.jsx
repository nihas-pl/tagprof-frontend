import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Instagram, Shield, CheckCircle, Sparkles, Smartphone, LogOut } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

export default function ConnectInstagram() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleConnect = () => {
    window.location.href = api.oauth.getInstagramAuthUrl()
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Instagram className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              Connect Instagram Account
            </CardTitle>
            
            <CardDescription className="text-base mt-2">
              Only a few steps away to go Viral!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Trust Signals */}
            <div className="space-y-3">
              <div className=" p-3 rounded-lg bg-blue-50 border border-blue-100">
                
                  <div className="font-semibold flex gap-2 items-center text-sm text-[#1877f2]">
                    <img 
                  src="https://img.icons8.com/?size=100&id=PvvcWRWxRKSR&format=png&color=000000" 
                  alt="Meta" 
                  className="h-5 w-5 mt-0.5 flex-shrink-0"
                /> We're a Meta-verified business
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We only use official Instagram APIs and processes. Your Instagram account is secure, and you stay in full control.
                  </p>
              </div>
              
              
            </div>

            {/* Mobile Warning */}
            {isMobile && (
              <Alert className="border-amber-200 bg-amber-50">
                <Smartphone className="h-4 w-4" color='#b45309' />
                <AlertDescription className="text-amber-800 text-sm">
                  Instagram may not connect on mobile, please use a desktop if possible.
                </AlertDescription>
              </Alert>
            )}

            {/* Connect Button */}
            <Button
              onClick={handleConnect}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Instagram className="h-5 w-5 mr-2" />
              Login with Instagram
            </Button>

            {/* Terms */}
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to Tagprof's{' '}
              <a href="/terms" className="text-purple-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-purple-600 hover:underline">
                Privacy Policy
              </a>
            </p>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Back to Settings Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/settings')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Back to Settings
          </button>
        </div>
      </div>
    </div>
  )
}
