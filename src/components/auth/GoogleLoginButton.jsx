import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

function GoogleLoginButton() {
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('[Login] 구글 로그인 버튼 클릭')
    try {
      const loginUrl = `${import.meta.env.VITE_API_URL}/auth/login`
      console.log('[Login] 리다이렉트 URL:', loginUrl)
      if (!import.meta.env.VITE_API_URL) {
        throw new Error('API URL이 설정되지 않았습니다')
      }
      window.location.href = loginUrl
    } catch (error) {
      console.error('[Login] 에러 발생:', error)
      alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <button 
      onClick={handleLogin}
      className="google-login-button"
    >
      Google로 로그인하기
    </button>
  )
}

export default GoogleLoginButton  