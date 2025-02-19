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
      // JWT 토큰 확인
      const token = document.cookie.match(/jwt=([^;]+)/)?.[1]
      if (!token) {
        console.log('[Auth] JWT 토큰 없음')
        setUser(null)
        setLoading(false)
        return
      }

      // 토큰이 있으면 해당 토큰으로 사용자 인증 완료
      try {
        // JWT 토큰에서 필요한 정보 추출
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (mounted) {
          setUser({
            id: payload.sub,
            email: payload.email,
            // 토큰에 포함된 다른 정보들...
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
    return () => { mounted = false }
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