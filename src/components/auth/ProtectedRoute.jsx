import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import { useState, useEffect } from 'react'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  useEffect(() => {
    console.log('[Protected] 로딩 상태:', loading)
    console.log('[Protected] 사용자 정보:', user)

    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('[Protected] 로딩 타임아웃 발생')
        setLoadingTimeout(true)
      }
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [loading, user])

  if (loading) {
    return loadingTimeout ? (
      <ErrorMessage message="로딩이 지연되고 있습니다. 새로고침을 해주세요." />
    ) : (
      <LoadingSpinner />
    )
  }

  if (!user) {
    console.log('[Protected] 인증되지 않은 접근 감지 - 로그인 페이지로 리다이렉트')
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute 