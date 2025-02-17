import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

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