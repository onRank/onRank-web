import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

function GoogleLoginButton() {
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('[Login] 로그인 시도 시작')

    if (import.meta.env.VITE_MSW_ENABLED === 'true') {
      // MSW 테스트 모드
      try {
        console.log('[Login] MSW 모드로 로그인 시도')
        const response = await api.post('/auth/login')
        console.log('[Login] MSW 응답:', response.data)
        if (response.data.redirectUrl) {
          console.log('[Login] 리다이렉트:', response.data.redirectUrl)
          navigate(response.data.redirectUrl)
        }
      } catch (error) {
        console.error('[Login] MSW 로그인 실패:', error)
      }
    } else {
      // 실제 백엔드 연동 모드
      console.log('[Login] 실제 백엔드로 리다이렉트')
      const loginUrl = `${import.meta.env.VITE_API_URL}/auth/login`
      console.log('[Login] 로그인 URL:', loginUrl)
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