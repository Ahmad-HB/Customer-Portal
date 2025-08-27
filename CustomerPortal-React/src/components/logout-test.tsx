import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function LogoutTest() {
  const { logout, isAuthenticated, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    console.log('=== LOGOUT TEST STARTED ===')
    console.log('Current user:', user)
    console.log('Authentication status:', isAuthenticated)
    
    setIsLoggingOut(true)
    
    try {
      console.log('Calling logout function...')
      await logout()
      console.log('Logout function completed')
    } catch (error) {
      console.error('Logout test failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const testLogoutEndpoint = async () => {
    console.log('=== TESTING LOGOUT ENDPOINT DIRECTLY ===')
    
    try {
      const response = await fetch('https://localhost:44338/api/account/logout', {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        credentials: 'include'
      })
      
      console.log('Direct logout endpoint test - Status:', response.status)
      console.log('Direct logout endpoint test - Headers:', response.headers)
      
      if (response.ok) {
        console.log('Direct logout endpoint test - SUCCESS')
      } else {
        const errorText = await response.text()
        console.log('Direct logout endpoint test - ERROR:', errorText)
      }
    } catch (error) {
      console.error('Direct logout endpoint test - EXCEPTION:', error)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Logout Test</h3>
      <div className="space-y-2 mb-4">
        <p><strong>Authentication Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        <p><strong>User:</strong> {user ? user.name : 'No user'}</p>
        <p><strong>Role:</strong> {user ? user.role : 'No role'}</p>
        <p><strong>Logging Out:</strong> {isLoggingOut ? 'Yes' : 'No'}</p>
      </div>
      <div className="space-y-2">
        <Button 
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging Out...' : 'Test Logout'}
        </Button>
        
        <Button 
          onClick={testLogoutEndpoint}
          variant="outline"
          className="w-full"
          disabled={isLoggingOut}
        >
          Test Logout Endpoint Directly
        </Button>
      </div>
    </div>
  )
}
