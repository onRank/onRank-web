import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log('[Callback] 콜백 페이지 진입')
    console.log('[Callback] 현재 URL:', window.location.href)
    console.log('[Callback] URL 파라미터:', location.search)
    
    const searchParams = new URLSearchParams(location.search)
    const isNewUser = searchParams.get('isNewUser') === 'true'
    console.log('[Callback] isNewUser 파라미터:', searchParams.get('isNewUser'))
    console.log('[Callback] isNewUser 변환값:', isNewUser)

    if (isNewUser) {
      console.log('[Callback] 새 사용자 감지 -> /auth/add로 이동')
      navigate('/auth/add')
    } else {
      console.log('[Callback] 기존 사용자 감지 -> /studies로 이동')
      navigate('/studies')
    }
  }, [navigate, location])

  return <div>로그인 처리 중...</div>
}

export default OAuthCallback 