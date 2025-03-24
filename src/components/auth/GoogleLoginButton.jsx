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

    // 백엔드 URL과 프론트엔드 URL을 환경 변수에서 가져옴
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'
    
    // CloudFront 환경에서는 Google에 등록된 정확한 URI 사용
    // 실제 프로덕션 환경에서는 정확한 URI 사용 (Google에 등록된 경로 그대로)
    const callbackPath = '/oauth2/callback/google'
    
    // 전체 리다이렉트 URI 구성
    const redirectUri = `${frontendUrl}${callbackPath}`
    console.log(`[Auth Debug] 구글 로그인 시도중...`)
    console.log(`[Auth Debug] 백엔드 URL: ${backendUrl}`)
    console.log(`[Auth Debug] 프론트엔드 URL: ${frontendUrl}`)
    console.log(`[Auth Debug] 리다이렉트 URI: ${redirectUri}`)
    
    const authorizationUrl = `${backendUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`
    console.log(`[Auth Debug] 최종 인증 URL: ${authorizationUrl}`)
    
    window.location.href = authorizationUrl
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