import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function GoogleLoginButton() {
  const [showOptions, setShowOptions] = useState(false)
  
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

    // 기본 로그인 - prompt 파라미터만 사용
    console.log('[Auth Debug] 기본 구글 로그인 (계정 선택 화면 표시 요청)')
    window.location.href = 'https://onrank.kr/oauth2/authorization/google?prompt=select_account'
  }

  const handleDirectLogin = () => {
    // 다이렉트 로그인 - 파라미터 없음
    window.location.href = 'https://onrank.kr/oauth2/authorization/google'
  }

  const handleShowOptions = (e) => {
    e.preventDefault()
    setShowOptions(!showOptions)
  }

  const handleOpenGoogleLogout = () => {
    // 구글 로그아웃 페이지를 새 창에서 열기
    window.open('https://accounts.google.com/logout', '_blank')
  }

  return (
    <div className="login-button-container">
      <button 
        onClick={handleLogin}
        className="google-login-button"
      >
        Google로 로그인하기
      </button>
      
      <div className="login-options">
        <button onClick={handleShowOptions} className="options-button">
          {showOptions ? '옵션 닫기' : '로그인 옵션'}
        </button>
        
        {showOptions && (
          <div className="options-dropdown">
            <p className="option-info">다른 계정으로 로그인하려면 먼저 Google에서 로그아웃하세요.</p>
            <button onClick={handleOpenGoogleLogout} className="option-button">
              Google 로그아웃 페이지 열기
            </button>
            <button onClick={handleDirectLogin} className="option-button">
              기본 로그인 (계정 선택 화면 없음)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoogleLoginButton