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
    
    // 개발 환경에서만 MSW 사용
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_MSW_ENABLED === 'true') {
      window.location.href = 'http://localhost:3000/auth/callback?code=mock_code'
      return
    }

    // 로컬 스토리지에 로그인 시도 중임을 표시
    localStorage.setItem('googleLoginInProgress', 'true')

    // 먼저 구글 로그아웃 수행 후 리다이렉트
    console.log('[Auth Debug] 구글 로그아웃 후 계정 선택 화면으로 이동')
    
    // 현재 도메인을 인코딩하여 리다이렉트 URL로 사용
    const redirectUrl = encodeURIComponent(window.location.origin + '/login-redirect')
    
    // Google 로그아웃 URL + 리다이렉트
    window.location.href = `https://accounts.google.com/logout?continue=https://onrank.kr/oauth2/authorization/google?prompt=select_account`
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