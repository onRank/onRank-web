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
    
    // 랜덤 state 값 생성 (세션 식별용)
    const stateValue = Math.random().toString(36).substring(2, 15)
    // localStorage에 state 값 저장 (추적용)
    localStorage.setItem('oauth_state', stateValue)
    
    // 리다이렉트 URI 생성
    const redirectUri = `${frontendUrl}/oauth2/callback/google`
    
    console.log(`[Auth Debug] 구글 로그인 시도 (state 파라미터 추가)`)
    console.log(`[Auth Debug] state 값: ${stateValue}`)
    console.log(`[Auth Debug] 리다이렉트 URI: ${redirectUri}`)
    
    // state 파라미터를 추가한 인증 URL
    const authorizationUrl = `${backendUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}&state=${stateValue}`
    
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