import { createContext, useContext, useState, useEffect } from 'react'
import { api, tokenUtils } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[Auth] useEffect 실행')
      console.log('[Auth] JWT 토큰 확인 시작')
      
      const token = tokenUtils.getToken()
      console.log('[Auth] 토큰 존재 여부:', !!token)

      if (!token) {
        console.log('[Auth] 토큰 없음')
        setLoading(false)
        return
      }

      try {
        // JWT 토큰에서 사용자 정보 추출
        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
        console.log('[Auth] 토큰에서 추출한 사용자 정보:', tokenPayload)
        
        // 토큰 만료 확인
        const expirationTime = tokenPayload.exp * 1000 // convert to milliseconds
        if (expirationTime <= Date.now()) {
          console.log('[Auth] 토큰이 만료됨')
          tokenUtils.removeToken()
          setLoading(false)
          return
        }

        // 사용자 정보 조회
        try {
          console.log('[Auth] 사용자 정보 조회 시도')
          const response = await api.get('/auth/login/user')
          const userData = response.data
          
          // 필수 회원 정보가 있는지 확인
          if (!userData.studentName || !userData.studentPhoneNumber) {
            console.log('[Auth] 회원정보 미입력 상태')
            tokenUtils.removeToken() // 토큰 제거
            setUser(null)
          } else {
            console.log('[Auth] 회원정보 확인됨:', userData)
            setUser(userData)
          }
        } catch (error) {
          console.error('[Auth] 사용자 정보 조회 실패:', error)
          if (error.response?.status === 404) {
            console.log('[Auth] 회원정보 없음')
            tokenUtils.removeToken()
            setUser(null)
          }
          // 다른 에러의 경우도 토큰 제거
          tokenUtils.removeToken()
          setUser(null)
        }
      } catch (error) {
        console.error('[Auth] 토큰 처리 중 오류:', error)
        tokenUtils.removeToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
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