import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  // AuthContext에서 예상치 못한 리다이렉트가 발생하는지 확인
  console.log('ProtectedRoute - user:', user)
  console.log('ProtectedRoute - loading:', loading)

  if (loading) {
    return <LoadingSpinner />
  }

  // 인증되지 않은 사용자는 로그인 페이지로
  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute 