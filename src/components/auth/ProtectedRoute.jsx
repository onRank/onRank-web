import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { tokenUtils } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

function ProtectedRoute({ children }) {
  console.log('[Protected] 렌더링')
  const { loading } = useAuth()
  const location = useLocation()
  
  // 인증 처리 중인 라우트인지 확인 (auth/callback, auth/add)
  const isAuthRoute = location.pathname.includes('/auth/')
  const isAuthCallback = location.pathname === '/auth/callback'
  const isNewUserSignup = location.pathname === '/auth/add'
  
  // URL 파라미터에서 isNewUser 확인
  const isNewUser = new URLSearchParams(location.search).get('isNewUser') === 'true'
  
  console.log('[Protected] 라우트 정보:', {
    path: location.pathname, 
    isAuthRoute, 
    isAuthCallback, 
    isNewUserSignup,
    hasNewUserParam: isNewUser
  })
  
  // 토큰 확인 (사용자 정보 API 호출 없이)
  const token = tokenUtils.getToken()
  console.log('[Protected] 토큰 존재 여부:', !!token)
  
  // 세션 스토리지 백업 토큰 확인 (보조 확인)
  const backupToken = sessionStorage.getItem('accessToken_backup')
  console.log('[Protected] 백업 토큰 존재 여부:', !!backupToken)
  
  // 현재 경로가 OAuth 콜백인 경우 즉시 통과 (OAuth 콜백은 항상 통과)
  if (isAuthCallback) {
    console.log('[Protected] OAuth 콜백 경로는 바로 통과')
    return children
  }

  if (loading) {
    console.log('[Protected] 로딩 중...')
    return <LoadingSpinner />
  }
  
  // 중요: 신규 회원가입 경로(/auth/add)는 토큰 검사 로직 건너뛰기
  // 회원가입 과정에서는 토큰이 아직 완전히 설정되지 않았을 수 있음
  if (isNewUserSignup) {
    console.log('[Protected] 회원가입 페이지 접근, 토큰 검사 건너뛰기')
    return children
  }

  if (token) {
    try {
      // 토큰 유효성 검사 (만료 여부 확인)
      const tokenPayload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = tokenPayload.exp * 1000
      
      if (expirationTime > Date.now()) {
        console.log('[Protected] 유효한 토큰, 접근 허용')
        return children
      }
      
      console.log('[Protected] 만료된 토큰, 로그인 페이지로 리다이렉트')
      tokenUtils.removeToken(true) // force=true로 모든 백업 토큰도 제거
      sessionStorage.removeItem('cachedUserInfo') // 사용자 정보 캐시도 제거
      sessionStorage.removeItem('accessToken_backup') // 백업 토큰도 제거
      return <Navigate to="/" replace />
    } catch (error) {
      console.error('[Protected] 토큰 검증 오류:', error)
      
      // 백업 토큰 시도
      if (backupToken) {
        console.log('[Protected] 기본 토큰 검증 실패, 백업 토큰 시도')
        try {
          const backupPayload = JSON.parse(atob(backupToken.split('.')[1]))
          const backupExpTime = backupPayload.exp * 1000
          
          if (backupExpTime > Date.now()) {
            console.log('[Protected] 유효한 백업 토큰, 접근 허용 및 기본 토큰 복원')
            
            // 백업 토큰을 localStorage에 복원 시도
            try {
              localStorage.setItem('accessToken', backupToken)
            } catch (e) {
              console.error('[Protected] 백업 토큰 복원 실패:', e)
            }
            
            return children
          }
        } catch (backupError) {
          console.error('[Protected] 백업 토큰 검증 오류:', backupError)
        }
      }
      
      tokenUtils.removeToken(true)
      sessionStorage.removeItem('cachedUserInfo')
      sessionStorage.removeItem('accessToken_backup')
      return <Navigate to="/" replace />
    }
  } else if (backupToken) {
    // 기본 토큰이 없지만 백업 토큰이 있는 경우
    console.log('[Protected] 기본 토큰 없음, 백업 토큰 시도')
    try {
      const backupPayload = JSON.parse(atob(backupToken.split('.')[1]))
      const backupExpTime = backupPayload.exp * 1000
      
      if (backupExpTime > Date.now()) {
        console.log('[Protected] 유효한 백업 토큰, 접근 허용 및 기본 토큰 복원')
        
        // 백업 토큰을 localStorage에 복원 시도
        try {
          localStorage.setItem('accessToken', backupToken)
        } catch (e) {
          console.error('[Protected] 백업 토큰 복원 실패:', e)
        }
        
        return children
      }
      
      console.log('[Protected] 만료된 백업 토큰, 로그인 페이지로 리다이렉트')
    } catch (backupError) {
      console.error('[Protected] 백업 토큰 검증 오류:', backupError)
    }
    
    // 백업 토큰도 유효하지 않으면 모두 제거
    sessionStorage.removeItem('accessToken_backup')
    sessionStorage.removeItem('cachedUserInfo')
  }

  // 인증 콜백 처리 중일 때는 리다이렉트하지 않음 (이미 위에서 체크했으므로 이 부분은 제거)

  console.log('[Protected] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트')
  return <Navigate to="/" replace />
}

export default ProtectedRoute 