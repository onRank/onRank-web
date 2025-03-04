import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { tokenUtils } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

function ProtectedRoute({ children }) {
  console.log('[Protected] 렌더링')
  const { loading } = useAuth()
  
  // 토큰 확인 (사용자 정보 API 호출 없이)
  const token = tokenUtils.getToken()
  console.log('[Protected] 토큰 존재 여부:', !!token)

  if (loading) {
    console.log('[Protected] 로딩 중...')
    return <LoadingSpinner />
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
      return <Navigate to="/" replace />
    } catch (error) {
      console.error('[Protected] 토큰 검증 오류:', error)
      tokenUtils.removeToken(true) // force=true로 모든 백업 토큰도 제거
      sessionStorage.removeItem('cachedUserInfo') // 사용자 정보 캐시도 제거
      return <Navigate to="/" replace />
    }
  }

  console.log('[Protected] 인증되지 않은 사용자, 로그인 페이지로 리다이렉트')
  return <Navigate to="/" replace />
}

export default ProtectedRoute 