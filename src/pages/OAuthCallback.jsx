import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userJson = params.get('user')
    const error = params.get('error')

    if (error) {
      toast.error(`Authentication failed: ${error}`)
      navigate('/login')
      return
    }

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson))
        setAuth(user, token)
        toast.success('Successfully signed in!')
        navigate('/')
      } catch (err) {
        console.error('Failed to parse user data:', err)
        toast.error('Authentication failed')
        navigate('/login')
      }
    } else {
      toast.error('Authentication failed')
      navigate('/login')
    }
  }, [navigate, setAuth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
