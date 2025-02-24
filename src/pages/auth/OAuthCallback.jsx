import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  useEffect(() => {
    const getTokens = async () => {
      try {
        // 토큰 재발급 요청
        const response = await fetch('http://localhost:8080/auth/reissue', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Token reissue failed with status: ${response.status}`)
        }
        
        // Authorization 헤더에서 access token 추출
        const accessToken = response.headers.get('Authorization')
        if (!accessToken) {
          throw new Error('No access token received')
        }

        // access token을 localStorage에 저장
        localStorage.setItem('accessToken', accessToken)

        // 회원 정보 등록 페이지로 이동
        navigate('/auth/add')
      } catch (error) {
        console.error('Failed to process OAuth callback:', error)
        // 에러 발생시 홈으로 리다이렉트
        navigate('/')
      }
    }

    // 컴포넌트가 마운트되면 즉시 토큰 재발급 요청
    getTokens()
  }, [navigate])
  
  return <LoadingSpinner />
}

export default OAuthCallback 