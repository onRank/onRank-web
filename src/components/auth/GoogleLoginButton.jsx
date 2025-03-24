import { useNavigate } from 'react-router-dom'

function GoogleLoginButton() {
  const handleLogin = (e) => {
    e.preventDefault()
    
    // 디버깅을 위한 환경 변수 출력
    console.log('[Auth Debug] 환경 변수:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
      VITE_MSW_ENABLED: import.meta.env.VITE_MSW_ENABLED,
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD
    })
    
    // MSW가 활성화된 경우 직접 콜백 URL로 이동
    if (import.meta.env.VITE_MSW_ENABLED === 'true') {
      window.location.href = 'http://localhost:3000/auth/callback?code=mock_code'
      return
    }

    // 백엔드 URL을 환경 변수에서 가져옴
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    
    // 직접 EC2 서버의 Google OAuth 인증 URL로 리다이렉트
    console.log(`[Auth Debug] EC2 서버로 직접 로그인 시도: ${backendUrl}/oauth2/authorization/google`)
    
    // 백엔드 서버의 OAuth 엔드포인트로 직접 이동
    window.location.href = `${backendUrl}/oauth2/authorization/google`
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