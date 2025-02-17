import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { authService } from '../../services/auth'

function GoogleLoginButton() {
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    try {
      console.log('[Login] 구글 로그인 시도...')
      const response = await authService.googleLogin()
      console.log('[Login] 백엔드 응답:', response.data)
      window.location.href = response.data.redirectUrl
    } catch (error) {
      console.error('[Login] 구글 로그인 실패:', error.response?.data || error.message)
    }
  }

  return (
    <button onClick={handleGoogleLogin}>
      Google 로그인
    </button>
  )
}

export default GoogleLoginButton  