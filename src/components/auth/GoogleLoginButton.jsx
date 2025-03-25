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
    // 사용자를 완전히 EC2 서버로 리다이렉트
    console.log('[Auth Debug] EC2 서버로 직접 리다이렉트 (혼합 콘텐츠 문제 해결)')
    
    // EC2 서버의 전체 URL 사용 - 직접 EC2 서버의 OAuth 페이지로 이동
    window.location.href = 'http://ec2-3-34-56-12.ap-northeast-2.compute.amazonaws.com/oauth2/authorization/google'
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