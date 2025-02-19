import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('[Callback] 콜백 페이지 진입')
    console.log('[Callback] 현재 URL:', window.location.href)
    console.log('[Callback] pathname:', location.pathname)
    console.log('[Callback] URL 파라미터:', location.search)

    const timeoutId = setTimeout(() => {
      console.log('[Callback] 타임아웃 발생 - 10초 초과')
      setError('로그인 처리 시간이 초과되었습니다')
      navigate('/')
    }, 10000)

    try {
      const searchParams = new URLSearchParams(location.search)
      const isNewUser = searchParams.get('isNewUser')
      console.log('[Callback] isNewUser 파라미터:', isNewUser)

      if (isNewUser === null) {
        throw new Error('인증 정보가 올바르지 않습니다')
      }

      const targetPath = isNewUser === 'true' ? '/auth/add' : '/studies'
      console.log('[Callback] 리다이렉트 경로:', targetPath)
      navigate(targetPath)
    } catch (error) {
      console.error('[Callback] 처리 오류:', error)
      setError('로그인 처리 중 오류가 발생했습니다')
      navigate('/')
    }

    return () => {
      console.log('[Callback] cleanup - 타임아웃 제거')
      clearTimeout(timeoutId)
    }
  }, [navigate, location])

  if (error) {
    console.log('[Callback] 에러 발생:', error)
    return <ErrorMessage message={error} />
  }

  return <div>로그인 처리 중...</div>
}

export default OAuthCallback 