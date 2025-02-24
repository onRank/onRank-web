import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'  // api 인스턴스 import

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[Auth] useEffect 실행')
      console.log('[Auth] JWT 토큰 확인 시작')
      
      const token = localStorage.getItem('accessToken')
      console.log('[Auth] 토큰 존재 여부:', !!token)

      if (!token) {
        console.log('[Auth] 토큰 없음')
        setLoading(false)
        return
      }

      try {
        // api 인스턴스 사용
        const response = await api.get('/auth/login/user')
        const userData = response.data
        console.log('[Auth] 사용자 정보 조회 성공:', userData)
        setUser(userData)
      } catch (error) {
        console.error('[Auth] 사용자 정보 조회 실패:', error)
        localStorage.removeItem('accessToken')
      }

      setLoading(false)
    }

    initializeAuth()
  }, [])

  const value = {
    user,
    setUser,
    loading
  }

  console.log('[Auth] Provider 렌더링')
  console.log('[Auth] 현재 상태 - user:', user, 'loading:', loading)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext 