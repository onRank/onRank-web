import { createContext, useContext, useState, useEffect } from 'react'
import { api, authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  console.log('[Auth] Provider 렌더링')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[Auth] useEffect 실행')
    let mounted = true

    const fetchUserInfo = async () => {
      console.log('[Auth] JWT 토큰 확인 시작')
      const token = document.cookie.match(/jwt=([^;]+)/)?.[1]
      console.log('[Auth] 토큰 존재 여부:', !!token)

      if (!token) {
        console.log('[Auth] 토큰 없음')
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('[Auth] 토큰 페이로드:', payload)
        if (mounted) {
          setUser({
            id: payload.sub,
            email: payload.email,
          })
        }
      } catch (error) {
        console.error('[Auth] 토큰 파싱 에러:', error)
        setUser(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchUserInfo()
    return () => {
      console.log('[Auth] cleanup')
      mounted = false
    }
  }, [])

  console.log('[Auth] 현재 상태 - user:', user, 'loading:', loading)
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