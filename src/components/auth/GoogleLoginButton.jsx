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

    // 혼합 콘텐츠(Mixed Content) 문제 해결을 위해 
    // 사용자를 완전히 백엔드 서버로 리다이렉트
    console.log('[Auth Debug] 백엔드 서버로 직접 리다이렉트 (혼합 콘텐츠 문제 해결)')
    
    // 도메인 사용 - SSL이 적용된 도메인의 OAuth 페이지로 이동
    window.location.href = 'https://onrank.kr/oauth2/authorization/google'
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