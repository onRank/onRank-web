import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../../components/auth/GoogleLoginButton'

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLoginSuccess = async (credentialResponse) => {
    setIsLoading(true)
    try {
      const decoded = jwtDecode(credentialResponse.credential)
      console.log('Decoded:', decoded)
      
      const response = await fetch('/login/oauth/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to authenticate with backend')
      }
      
      const data = await response.json()

      if (data.isNewUser) {
        navigate('/register', { 
          state: {
            email: decoded.email,
            name: decoded.name 
          }
        })
      } else {
        navigate('/studies')
      }
      
    } catch (error) {
      console.error('Login Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h2>Welcome to ONRANK</h2>
      <GoogleLoginButton 
        onSuccess={handleLoginSuccess}
        isLoading={isLoading}
      />
    </div>
  )
}

export default LoginPage 