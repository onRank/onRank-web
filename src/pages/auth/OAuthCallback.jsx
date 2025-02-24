import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { tokenUtils, api } from '../../services/api'

function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  
  useEffect(() => {
    const getTokens = async () => {
      try {
        console.log('Sending request to /auth/reissue')
        const response = await api.get('/auth/reissue', {
          withCredentials: true
        })
        
        const authHeader = response.headers['authorization'] || response.headers['Authorization']
        if (!authHeader) {
          console.error('Authorization header missing in response')
          throw new Error('Invalid or missing Authorization header')
        }

        // 토큰 저장
        tokenUtils.setToken(authHeader)
        console.log('Token stored successfully:', authHeader)

        // isNewUser 파라미터 확인
        const isNewUser = searchParams.get('isNewUser') === 'true'
        
        if (isNewUser) {
          console.log('New user detected, redirecting to /auth/add')
          navigate('/auth/add')
          return
        }

        console.log('Existing user detected, fetching user info')
        const userResponse = await api.get('/auth/login/user', {
          headers: {
            'Authorization': authHeader
          }
        })
        
        if (!userResponse.data) {
          throw new Error('User data not received')
        }
        
        const userData = userResponse.data
        console.log('User info received:', userData)
        setUser(userData)
        navigate('/studies')
      } catch (error) {
        console.error('Failed to process OAuth callback:', error)
        if (error.response?.status === 401) {
          console.log('Authentication failed, redirecting to login')
        } else if (error.response?.status === 405) {
          console.log('Method not allowed error, check API endpoint configuration')
        } else if (error.message === 'Network Error') {
          console.log('Network error occurred')
        }
        tokenUtils.removeToken()
        navigate('/')
      }
    }

    getTokens()
  }, [navigate, searchParams, setUser])
  
  return <LoadingSpinner />
}

export default OAuthCallback 