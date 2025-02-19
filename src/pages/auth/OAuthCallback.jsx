import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function OAuthCallback() {
  console.log('[Callback] 컴포넌트 마운트')
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('[Callback] useEffect 실행')
    console.log('[Callback] 현재 URL:', window.location.href)
    console.log('[Callback] location 객체:', location)
    console.log('[Callback] 쿠키:', document.cookie)

    const timeoutId = setTimeout(() => {
      console.log('[Callback] 타임아웃 발생')
      setError('로그인 처리 시간이 초과되었습니다')
      navigate('/')
    }, 10000)

    try {
      const searchParams = new URLSearchParams(location.search)
      const isNewUser = searchParams.get('isNewUser')
      console.log('[Callback] isNewUser:', isNewUser)

      if (isNewUser === null) {
        console.error('[Callback] isNewUser 파라미터 없음')
        throw new Error('인증 정보가 올바르지 않습니다')
      }

      const targetPath = isNewUser === 'true' ? '/auth/add' : '/studies'
      console.log('[Callback] 리다이렉트 경로:', targetPath)
      navigate(targetPath)
    } catch (error) {
      console.error('[Callback] 에러:', error)
      setError('로그인 처리 중 오류가 발생했습니다')
      navigate('/')
    }

    return () => {
      console.log('[Callback] cleanup')
      clearTimeout(timeoutId)
    }
  }, [navigate, location])

  console.log('[Callback] 렌더링')
  if (error) {
    console.log('[Callback] 에러 발생:', error)
    return <ErrorMessage message={error} />
  }

  return <div>로그인 처리 중...</div>
}

export default OAuthCallback 