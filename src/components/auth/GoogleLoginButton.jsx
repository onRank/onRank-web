import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

function GoogleLoginButton() {
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    if (import.meta.env.VITE_MSW_ENABLED === 'true') {
      // MSW 테스트 모드
      try {
        const response = await api.get('/auth')
        navigate('/auth/add?isNewUser=true')
      } catch (error) {
        console.error('Login failed:', error)
      }
    } else {
      // 실제 백엔드 연동 모드
      window.location.href = `${import.meta.env.VITE_API_URL}/oauth`
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