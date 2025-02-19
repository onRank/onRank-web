import { createContext, useContext, useState, useEffect } from 'react'
import { api, authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    console.log('[Auth] 컴포넌트 마운트')
    
    const fetchUserInfo = async () => {
      const currentPath = window.location.pathname
      console.log('[Auth] 현재 경로:', currentPath)

      if (currentPath.includes('/auth/callback') || currentPath === '/') {
        console.log('[Auth] 사용자 정보 조회 스킵 - 로그인 진행 중')
        setLoading(false)
        return
      }

      try {
        console.log('[Auth] 사용자 정보 조회 시도')
        const { data } = await api.get('/auth/login/user')
        console.log('[Auth] 사용자 정보 조회 성공:', data)
        if (mounted) {
          setUser(data)
        }
      } catch (error) {
        console.log('[Auth] 사용자 정보 조회 실패:', error)
        if (mounted) {
          if (error.response?.status === 401) {
            console.log('[Auth] 인증되지 않은 사용자')
            setUser(null)
          } else {
            console.error('[Auth] 예상치 못한 에러:', error)
          }
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchUserInfo()

    return () => {
      console.log('[Auth] 컴포넌트 언마운트')
      mounted = false
    }
  }, [])

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      window.location.href = '/'  // 로그아웃 후 홈으로 리다이렉트
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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