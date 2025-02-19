import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

function GoogleLoginButton() {
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const loginUrl = `${import.meta.env.VITE_API_URL}/auth/login`
      if (!import.meta.env.VITE_API_URL) {
        throw new Error('API URL이 설정되지 않았습니다')
      }
      window.location.href = loginUrl
    } catch (error) {
      console.error('로그인 시도 중 오류:', error)
      alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
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