import { useNavigate } from 'react-router-dom'

function GoogleLoginButton() {
  const handleLogin = (e) => {
    e.preventDefault()
    
    // MSW가 활성화된 경우 직접 콜백 URL로 이동
    if (import.meta.env.VITE_MSW_ENABLED === 'true') {
      window.location.href = 'http://localhost:3000/auth/callback?code=mock_code'
      return
    }

    // 실제 환경에서는 기존 로직 사용
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    window.location.href = `${backendUrl}/oauth2/authorization/google?redirect_uri=http://localhost:3000/auth/callback`
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