import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { tokenUtils, api, authService } from '../../services/api'

function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  
  useEffect(() => {
    const getTokens = async () => {
      try {
        // 현재 토큰이 있는지 확인
        const currentToken = tokenUtils.getToken()
        if (currentToken) {
          // JWT 토큰에서 만료 시간 확인
          const tokenPayload = JSON.parse(atob(currentToken.split('.')[1]))
          const expirationTime = tokenPayload.exp * 1000 // convert to milliseconds
          
          if (expirationTime > Date.now()) {
            console.log('Valid token exists, skipping reissue')
            // isNewUser 파라미터 확인
            const isNewUser = searchParams.get('isNewUser') === 'true'
            
            if (isNewUser) {
              console.log('New user detected, redirecting to /auth/add')
              navigate('/auth/add')
              return
            }

            console.log('Existing user detected, redirecting to /studies')
            navigate('/studies')
            return
          }
        }

        console.log('Sending request to /auth/reissue')
        console.log('[Auth Debug] Request headers:', {
          'Content-Type': 'application/json',
          'withCredentials': true
        })
        
        const response = await api.get('/auth/reissue', {
          withCredentials: true
        })
        
        console.log('[Auth Debug] Response headers:', response.headers)
        
        const authHeader = response.headers['authorization'] || response.headers['Authorization']
        if (!authHeader) {
          console.error('Authorization header missing in response')
          throw new Error('Invalid or missing Authorization header')
        }

        // 토큰 저장
        tokenUtils.setToken(authHeader)
        console.log('Token stored successfully:', authHeader)

        // JWT 토큰에서 사용자 정보 추출
        const tokenPayload = JSON.parse(atob(authHeader.split('.')[1]))
        console.log('Token payload:', tokenPayload)
        
        // 사용자 정보 설정
        setUser({
          email: tokenPayload.email,
          username: tokenPayload.username
        })

        // isNewUser 파라미터 확인
        const isNewUser = searchParams.get('isNewUser') === 'true'
        
        if (isNewUser) {
          console.log('New user detected, redirecting to /auth/add')
          navigate('/auth/add')
          return
        }

        // 기존 사용자는 바로 studies 페이지로 리다이렉트
        console.log('Existing user detected, redirecting to /studies')
        navigate('/studies')
      } catch (error) {
        console.error('Failed to process OAuth callback:', error)
        if (error.response?.status === 401) {
          console.log('Authentication failed, redirecting to login')
        } else if (error.response?.status === 405) {
          console.log('Method not allowed error, check API endpoint configuration')
        } else if (error.message === 'Network Error') {
          console.log('Network error occurred')
          console.log('[Auth Debug] Network error details:', {
            config: error.config,
            headers: error.config?.headers
          })
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