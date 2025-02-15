import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)

  useEffect(() => {
    // URL에서 에러 파라미터도 체크
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const isNewUser = params.get('isNewUser')
    const errorMessage = params.get('error')  // 에러 메시지 체크

    if (errorMessage) {
      setError(errorMessage)
      setTimeout(() => navigate('/'), 3000)  // 3초 후 로그인 페이지로
      return
    }

    if (token) {
      try {
        localStorage.setItem('token', token)
        if (isNewUser === 'true') {
          navigate('/oauth/add')  // /register -> /oauth/add
        } else {
          navigate('/studies')
        }
      } catch (error) {
        setError('로그인 처리 중 오류가 발생했습니다.')
        setTimeout(() => navigate('/'), 3000)
      }
    } else {
      setError('인증 토큰이 없습니다.')
      setTimeout(() => navigate('/'), 3000)
    }
  }, [navigate, location])

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return <LoadingSpinner />
}

export default OAuthCallback 