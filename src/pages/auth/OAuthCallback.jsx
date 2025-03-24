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
      // URL 파라미터 로깅
      console.log('[OAuth Debug] 콜백 URL 파라미터:', {
        code: searchParams.get('code'),
        state: searchParams.get('state'),
        error: searchParams.get('error'),
        isNewUser: searchParams.get('isNewUser'),
        raw: window.location.search
      })
      
      // localStorage에서 state 값 확인 (추적용)
      const savedState = localStorage.getItem('oauth_state')
      console.log(`[OAuth Debug] 저장된 state: ${savedState}, URL state: ${searchParams.get('state')}`)
      
      try {
        // isNewUser 파라미터 미리 확인 - 여러 곳에서 사용하므로 상단에 정의
        const isNewUser = searchParams.get('isNewUser') === 'true'
        console.log(`[OAuth] 사용자 상태: ${isNewUser ? '신규 사용자' : '기존 사용자'}`)
        
        // 현재 토큰이 있는지 확인
        const currentToken = tokenUtils.getToken()
        if (currentToken) {
          // JWT 토큰에서 만료 시간 확인
          const tokenPayload = JSON.parse(atob(currentToken.split('.')[1]))
          const expirationTime = tokenPayload.exp * 1000 // convert to milliseconds
          
          if (expirationTime > Date.now()) {
            console.log('Valid token exists, skipping reissue')
            
            if (isNewUser) {
              console.log('New user detected, redirecting to /auth/add')
              navigate('/auth/add')
              return
            }

            console.log('Existing user detected, redirecting to /studies')
            navigate('/studies')
            return
          }
          // 여기까지 코드가 실행된다면 토큰이 만료된 상태
          console.log('Token expired, requesting new token')
        }

        // 토큰이 없거나 만료된 경우에만 reissue 요청
        console.log('Sending request to /auth/reissue')
        console.log('[Auth Debug] Request headers:', {
          'Content-Type': 'application/json',
          'withCredentials': true
        })
        
        try {
          const response = await api.get('/auth/reissue', {
            withCredentials: true
          })
          
          console.log('[Auth Debug] Response headers:', response.headers)
          
          const authHeader = response.headers['authorization'] || response.headers['Authorization']
          if (!authHeader) {
            console.error('Authorization header missing in response')
            
            // 새 사용자이면서 인증 헤더가 없는 경우에도 회원정보 페이지로 이동
            if (isNewUser) {
              console.log('[OAuth] 토큰 없지만 신규 사용자이므로 /auth/add로 이동')
              navigate('/auth/add')
              return
            }
            
            throw new Error('Invalid or missing Authorization header')
          }

          // 토큰 저장
          tokenUtils.setToken(authHeader)
          console.log('Token stored successfully:', authHeader)

          // JWT 토큰에서 사용자 정보 추출
          const tokenPayload = JSON.parse(atob(authHeader.split('.')[1]))
          console.log('Token payload:', tokenPayload)
          
          // 리프레시 토큰 쿠키 확인 - 이 부분의 로직 변경
          // HttpOnly 쿠키는 document.cookie로 접근할 수 없으므로 이 검사는 제거
          console.log('[Auth Debug] Refresh token cookie check - HttpOnly cookies cannot be read directly')
          
          // 백엔드에서 성공적으로 토큰을 받았다면 리프레시 토큰이 제대로 설정되었다고 가정
          console.log('[Auth Debug] Server provided a valid token, assuming refresh token cookie is set')
          
          // 사용자 정보 설정
          setUser({
            email: tokenPayload.email,
            username: tokenPayload.username
          })

          // isNewUser 파라미터 확인
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
          
          // *** 핵심 수정 부분: 신규 사용자는 오류가 발생해도 회원정보 등록 페이지로 이동 ***
          if (isNewUser) {
            console.log('[OAuth] 신규 사용자 감지: 인증 오류가 발생했지만 /auth/add로 이동')
            // 토큰 제거하지 않고 유지 (필요하다면)
            navigate('/auth/add')
            return
          }
          
          // 기존 사용자의 경우 일반 오류 처리
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
          // 토큰 제거는 필요할 때만 수행
          if (!isNewUser) {
            tokenUtils.removeToken()
          }
          navigate('/')
        }
      } catch (error) {
        console.error('OAuth callback general error:', error)
        
        // 여기서도 isNewUser 확인하여 처리
        const isNewUser = searchParams.get('isNewUser') === 'true'
        if (isNewUser) {
          console.log('[OAuth] 일반 오류 발생했지만 신규 사용자이므로 /auth/add로 이동')
          navigate('/auth/add')
          return
        }
        
        // 일반 오류 처리
        tokenUtils.removeToken()
        navigate('/')
      }
    }

    getTokens()
  }, [navigate, searchParams, setUser])
  
  return <LoadingSpinner />
}

export default OAuthCallback 