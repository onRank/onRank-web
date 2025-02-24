import { useNavigate } from 'react-router-dom'

function GoogleLoginButton() {
  const handleLogin = (e) => {
    e.preventDefault()
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