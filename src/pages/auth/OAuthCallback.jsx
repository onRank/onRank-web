import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'

function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 백엔드에서 콜백 처리 및 isNewUser 정보 받기
        const response = await api.get('/auth/login/user')
        const { isNewUser } = response.data

        // isNewUser에 따라 다른 페이지로 리다이렉트
        if (isNewUser) {
          navigate('/auth/add')
        } else {
          navigate('/studies')
        }
      } catch (error) {
        console.error('OAuth callback failed:', error)
        navigate('/')  // 에러 시 홈으로
      }
    }

    handleCallback()
  }, [navigate])

  return <div>로그인 처리 중...</div>
}

export default OAuthCallback 