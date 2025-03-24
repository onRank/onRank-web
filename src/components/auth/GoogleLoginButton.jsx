import { useNavigate } from 'react-router-dom'

function GoogleLoginButton() {
  const handleLogin = (e) => {
    e.preventDefault()
    
    // MSW가 활성화된 경우 직접 콜백 URL로 이동
    if (import.meta.env.VITE_MSW_ENABLED === 'true') {
      window.location.href = 'http://localhost:3000/auth/callback?code=mock_code'
      return
    }

    // 백엔드 URL과 프론트엔드 URL을 환경 변수에서 가져옴
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'
    
    // 프로덕션 환경에서는 다른 콜백 경로 사용
    const callbackPath = frontendUrl.includes('cloudfront.net') 
      ? '/oauth2/callback/google'  // CloudFront 환경
      : '/auth/callback'           // 개발 환경
    
    console.log(`[Auth] 구글 로그인 리다이렉트: ${backendUrl}/oauth2/authorization/google?redirect_uri=${frontendUrl}${callbackPath}`)
    
    window.location.href = `${backendUrl}/oauth2/authorization/google?redirect_uri=${frontendUrl}${callbackPath}`
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