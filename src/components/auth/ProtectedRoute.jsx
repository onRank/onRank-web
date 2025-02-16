import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  // 인증되지 않은 사용자는 로그인 페이지로
  if (!user) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute 