import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function OAuthCallback() {
  console.log('[Callback] 컴포넌트 마운트')
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)
  const { setUser } = useAuth()

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

    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(location.search)
        const isNewUser = searchParams.get('isNewUser')
        console.log('[Callback] isNewUser:', isNewUser)

        if (isNewUser === null) {
          console.error('[Callback] isNewUser 파라미터 없음')
          throw new Error('인증 정보가 올바르지 않습니다')
        }

        // MSW 테스트 모드
        if (import.meta.env.VITE_MSW_ENABLED === 'true') {
          if (isNewUser === 'false') {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/user`)
            if (!response.ok) throw new Error('사용자 정보를 가져오는데 실패했습니다')
            const userData = await response.json()
            setUser(userData)
            
            // 사용자 정보 설정 후 리다이렉션
            console.log('[Callback] 사용자 정보 설정 완료, 리다이렉트 시작')
            navigate('/studies')
            return // 여기서 함수 종료
          }
        } 
        // 실제 백엔드 연동 모드
        else {
          // 백엔드에서 이미 쿠키와 사용자 정보를 설정했을 것이므로
          // 추가적인 API 호출 없이 리다이렉션만 처리
        }

        // isNewUser가 true일 때만 여기로 옴
        const targetPath = isNewUser === 'true' ? '/auth/add' : '/studies'
        console.log('[Callback] 리다이렉트 경로:', targetPath)
        navigate(targetPath)
      } catch (error) {
        console.error('[Callback] 에러:', error)
        setError('로그인 처리 중 오류가 발생했습니다')
        navigate('/')
      }
    }

    handleCallback()

    return () => {
      console.log('[Callback] cleanup')
      clearTimeout(timeoutId)
    }
  }, [navigate, location, setUser])

  console.log('[Callback] 렌더링')
  if (error) {
    console.log('[Callback] 에러 발생:', error)
    return <ErrorMessage message={error} />
  }

  return <div>로그인 처리 중...</div>
}

export default OAuthCallback 