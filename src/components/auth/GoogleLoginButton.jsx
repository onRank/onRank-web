import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

function GoogleLoginButton() {
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('[Login] 구글 로그인 버튼 클릭됨')

    if (import.meta.env.VITE_MSW_ENABLED === 'true') {
      // MSW 테스트 모드
      console.log('[Login] MSW 테스트 모드')
      try {
        // 2단계: MSW API 호출
        const response = await api.post('/auth/login')
        console.log('[Login] MSW 응답:', response.data)
        
        // 3단계: MSW handlers.js에서 반환한 redirectUrl 사용
        // response.data = { redirectUrl: '/auth/add?isNewUser=true' }
        if (response.data.redirectUrl) {
          // 4단계: React Router의 navigate로 클라이언트 사이드 라우팅
          navigate(response.data.redirectUrl)
        }
      } catch (error) {
        console.error('[Login] MSW 에러:', error)
      }
    } else {
      // 실제 백엔드 연동 모드
      console.log('[Login] 실제 백엔드 모드')
      const loginUrl = `${import.meta.env.VITE_API_URL}/auth/login`
      console.log('[Login] 백엔드는 /auth/callback으로 리다이렉트할 것입니다.')
      window.location.href = loginUrl
    }
  }

  return (
    <a 
      href="#"
      onClick={handleLogin}
      className="google-login-button"
    >
      Google로 로그인하기
    </a>
  )
}

export default GoogleLoginButton  