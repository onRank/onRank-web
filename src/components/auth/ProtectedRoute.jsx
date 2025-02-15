import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

function ProtectedRoute({ children }) {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/auth/check')  // 인증 확인 API
        setIsAuthenticated(true)
      } catch (error) {
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return isAuthenticated ? children : null
}

export default ProtectedRoute 