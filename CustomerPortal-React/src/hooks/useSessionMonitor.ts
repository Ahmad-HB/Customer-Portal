import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function useSessionMonitor() {
  const { sessionStatus, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Handle session expiration
    if (sessionStatus === 'expired') {
      console.log('Session expired, redirecting to login...')
      
      // Clear any stored tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('demo_token')
      localStorage.removeItem('remember_me')
      localStorage.removeItem('remembered_user')
      
      // Redirect to login page
      navigate('/login', { replace: true })
    }
  }, [sessionStatus, logout, navigate])

  // Return session status for components that need it
  return { sessionStatus }
}
