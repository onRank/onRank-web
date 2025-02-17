import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // URL 파라미터에서 isNewUser 값을 가져옴
    const searchParams = new URLSearchParams(location.search)
    const isNewUser = searchParams.get('isNewUser') === 'true'

    if (isNewUser) {
      // 새로운 사용자면 추가 정보 입력 페이지로
      navigate('/auth/add')
    } else {
      // 기존 사용자면 스터디 목록 페이지로
      navigate('/studies')
    }
  }, [navigate, location])

  return <LoadingSpinner />
}

export default OAuthCallback 