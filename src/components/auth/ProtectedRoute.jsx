import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import { useState, useEffect } from 'react'

function ProtectedRoute({ children }) {
  console.log('[Protected] 렌더링')
  const { user, loading } = useAuth()
  console.log('[Protected] user:', user, 'loading:', loading)

  if (loading) {
    console.log('[Protected] 로딩 중')
    return <LoadingSpinner />
  }

  if (!user) {
    console.log('[Protected] 인증되지 않은 사용자')
    return <Navigate to="/" replace />
  }

  console.log('[Protected] 인증된 사용자')
  return children
}

export default ProtectedRoute 