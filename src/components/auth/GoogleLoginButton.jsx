import React from 'react'

// 구글 로그인 버튼 컴포넌트 - 2024-04-06 수정
function GoogleLoginButton() {
  const handleLogin = (e) => {
    e.preventDefault()
    
    // localStorage에서 이전 로그인 정보 제거 (새로운 로그인 시도)
    localStorage.removeItem('accessToken')
    
    // 디버그 로그 추가
    console.log('[OAuth DEBUG] 구글 로그인 시작 - 버튼 클릭')
    
    // 개발 환경 체크 (이 부분은 그대로 유지)
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_MSW_ENABLED === 'true') {
      window.location.href = 'http://localhost:3000/auth/callback?code=mock_code'
      return
    }

    // 순수한 OAuth 엔드포인트 호출 (파라미터 없음)
    console.log('[Auth] 구글 로그인 요청 - 최신 코드 확인용')
    window.location.href = 'https://onrank.kr/oauth2/authorization/google'
  }

  return (
    <button 
      onClick={handleLogin}
      className="google-login-button"
      style={{
        padding: '10px 20px',
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}
    >
      {/* 구글 아이콘 직접 SVG로 추가 */}
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
        <path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.35 5.3c1.26 1.26 2.07 2.99 2.18 4.9h-4.56v-2.32h.02c.81 0 1.46-.66 1.46-1.47s-.65-1.47-1.46-1.47c-.8 0-1.46.66-1.46 1.47v.32h-2.33V8.28l.89-.01C14.46 7.86 15.11 7 15.11 6c0-.81-.65-1.47-1.46-1.47c-.8 0-1.46.66-1.46 1.47c0 .18.03.34.09.5l-2.28 2.28l-2.28-2.28c.06-.15.09-.32.09-.5c0-.81-.65-1.47-1.46-1.47c-.8 0-1.45.66-1.45 1.47c0 1 .83 1.86 1.83 1.47l2.96.01v1.45h-.33c-.8 0-1.46.66-1.46 1.47s.65 1.47 1.46 1.47h2.33v-.32c0-.81.65-1.47 1.46-1.47c.8 0 1.45.66 1.45 1.47h4.56c-.12 1.91-.93 3.64-2.18 4.9c-1.26 1.26-3 2.1-4.9 2.18v-4.66h.02c.39 0 .7-.31.7-.7s-.31-.7-.7-.7h-4.66c.08-1.91.93-3.64 2.18-4.9c1.26-1.26 2.99-2.1 4.9-2.18v4.66h-.02c-.39 0-.7.31-.7.7s.31.7.7.7h4.66c-.08 1.91-.93 3.64-2.18 4.9z"/>
      </svg>
      Google로 로그인
    </button>
  )
}

export default GoogleLoginButton