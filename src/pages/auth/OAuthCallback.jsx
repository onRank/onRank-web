import { useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { tokenUtils, api, authService } from '../../services/api'

function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  const location = useLocation()
  
  useEffect(() => {
    // 페이지 로드 시 디버그 로그 명확하게 출력
    console.log('[OAuth DEBUG] OAuthCallback 컴포넌트 마운트됨');
    console.log('[OAuth DEBUG] 현재 URL:', window.location.href);
    console.log('[OAuth DEBUG] 쿼리 파라미터:', window.location.search);
    
    // 쿠키에서 isNewUser 확인 (백엔드에서 쿠키로 전달하는 경우를 위해)
    const checkCookieForNewUser = () => {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'isNewUser' && value === 'true') {
          console.log('[OAuth DEBUG] 쿠키에서 isNewUser=true 확인됨');
          return true;
        }
      }
      return false;
    };
    
    const isNewUserInCookie = checkCookieForNewUser();

    // 현재 URL이 /auth/callback인지 확인
    const isAuthCallback = location.pathname === '/auth/callback'
    
    const getTokens = async () => {
      // URL 파라미터 로깅 - isNewUser 중점적으로 확인
      const isNewUserParam = searchParams.get('isNewUser');
      console.log('[OAuth DEBUG] isNewUser 파라미터 원본값:', isNewUserParam);
      
      // 서비스에서 쿼리파라미터로 isNewUser를 전달해주는지 확인 (문자열 비교 명확하게)
      const isNewUser = isNewUserParam === 'true';
      console.log(`[OAuth DEBUG] 사용자 상태 판단: ${isNewUser ? '신규 사용자' : '기존 사용자'}`);

      // 강화된 디버깅: 모든 쿼리 파라미터 출력
      console.log('[OAuth DEBUG] 전체 콜백 URL 파라미터:', Object.fromEntries([...searchParams.entries()]));
      
      // 최우선: isNewUser가 true인 경우 즉시 회원가입 페이지로 이동
      if (isNewUser) {
        console.log('[OAuth DEBUG] 신규 사용자 확인됨! /auth/add로 즉시 리다이렉트');
        navigate('/auth/add', { replace: true });
        return; // 중요: 여기서 함수 종료
      }
      
      // isNewUser 체크 후 auth/callback URL로 직접 접근한 경우 바로 studies 페이지로 리다이렉트
      if (isAuthCallback) {
        console.log('[OAuth] /auth/callback URL 감지됨, studies로 즉시 리다이렉트')
        navigate('/studies', { replace: true })
        return
      }
      
      // localStorage에서 state 값 확인 (추적용)
      const savedState = localStorage.getItem('oauth_state')
      console.log(`[OAuth Debug] 저장된 state: ${savedState}, URL state: ${searchParams.get('state')}`)
      
      try {
        // 현재 토큰이 있는지 확인
        const currentToken = tokenUtils.getToken()
        if (currentToken) {
          // JWT 토큰에서 만료 시간 확인
          const tokenPayload = JSON.parse(atob(currentToken.split('.')[1]))
          const expirationTime = tokenPayload.exp * 1000 // convert to milliseconds
          
          if (expirationTime > Date.now()) {
            console.log('Valid token exists, skipping reissue')
            
            if (isNewUser) {
              console.log('New user detected, redirecting to /auth/add')
              navigate('/auth/add')
              return
            }

            console.log('Existing user detected, redirecting to /studies')
            navigate('/studies')
            return
          }
          // 여기까지 코드가 실행된다면 토큰이 만료된 상태
          console.log('Token expired, requesting new token')
        }

        // 토큰이 없거나 만료된 경우에만 reissue 요청
        console.log('Sending request to /auth/reissue')
        console.log('[Auth Debug] Request headers:', {
          'Content-Type': 'application/json',
          'withCredentials': true
        })
        
        // 쿠키 디버그 정보 출력
        console.log('[Cookie Debug] Document cookies before request:', document.cookie);
        console.log('[Cookie Debug] 현재 도메인:', window.location.hostname);
        console.log('[Cookie Debug] 현재 프로토콜:', window.location.protocol);
        
        try {
          const response = await api.get('/auth/reissue', {
            withCredentials: true
          })
          
          // 응답 후 쿠키 상태 확인
          console.log('[Cookie Debug] Document cookies after response:', document.cookie);
          console.log('[Cookie Debug] 응답 후 쿠키 변경 여부:', document.cookie.includes('refresh_token'));
          
          console.log('[Auth Debug] Response headers:', response.headers)
          
          const authHeader = response.headers['authorization'] || response.headers['Authorization']
          if (!authHeader) {
            console.error('Authorization header missing in response')
            
            // 새 사용자이면서 인증 헤더가 없는 경우에도 회원정보 페이지로 이동
            if (isNewUser) {
              console.log('[OAuth] 토큰 없지만 신규 사용자이므로 /auth/add로 이동')
              navigate('/auth/add')
              return
            }
            
            throw new Error('Invalid or missing Authorization header')
          }

          // 토큰 저장
          tokenUtils.setToken(authHeader)
          console.log('Token stored successfully:', authHeader)

          // JWT 토큰에서 사용자 정보 추출
          const tokenPayload = JSON.parse(atob(authHeader.split('.')[1]))
          console.log('Token payload:', tokenPayload)
          
          // 사용자 정보 설정
          setUser({
            email: tokenPayload.email,
            username: tokenPayload.username
          })

          // *** 중요: 백엔드 응답 헤더나 토큰 내에 신규 사용자 정보 확인 ***
          const isNewUserFromToken = tokenPayload.isNewUser === true || tokenPayload.new_user === true;
          const isNewUserFromHeader = response.headers['x-new-user'] === 'true';
          const isNewUserFromData = response.data?.isNewUser === true;
          
          // 모든 소스에서 신규 사용자 여부 확인
          const isNewUserDetected = isNewUser || isNewUserFromToken || isNewUserFromHeader || 
                                    isNewUserFromData || isNewUserInCookie;
          
          console.log('[OAuth DEBUG] 신규 사용자 판단 종합:', {
            fromQueryParam: isNewUser,
            fromToken: isNewUserFromToken,
            fromHeader: isNewUserFromHeader,
            fromData: isNewUserFromData,
            fromCookie: isNewUserInCookie,
            finalDecision: isNewUserDetected
          });

          // 어떤 소스에서든 신규 사용자로 판단되면 회원가입 페이지로 이동
          if (isNewUserDetected) {
            console.log('[OAuth DEBUG] 최종 판단: 신규 사용자! /auth/add로 이동');
            navigate('/auth/add', { replace: true });
            return;
          }

          // 신규 사용자가 아니라고 판단되면 스터디 페이지로 이동
          console.log('[OAuth DEBUG] 최종 판단: 기존 사용자. /studies로 이동');
          navigate('/studies', { replace: true });
          return;
        } catch (error) {
          console.error('Failed to process OAuth callback:', error)
          
          // 에러 응답의 헤더와 쿠키 정보 출력
          console.log('[Cookie Debug] Error response headers:', error.response?.headers);
          console.log('[Cookie Debug] Cookies after error:', document.cookie);
          
          // *** 핵심 수정 부분: 신규 사용자 판단 강화 ***
          // 어떤 소스에서든 신규 사용자 정보가 있으면 회원가입 페이지로 이동
          const isErrorNewUser = isNewUser || 
                               isNewUserInCookie || 
                               (error.response?.headers && error.response.headers['x-new-user'] === 'true') ||
                               (error.response?.data && error.response.data.isNewUser === true);
                              
          if (isErrorNewUser) {
            console.log('[OAuth DEBUG] 오류 발생했지만 신규 사용자로 판단됨, /auth/add로 이동');
            navigate('/auth/add', { replace: true });
            return;
          }
          
          // 기존 사용자의 경우 일반 오류 처리
          if (error.response?.status === 401) {
            console.log('Authentication failed, redirecting to login')
          } else if (error.response?.status === 405) {
            console.log('Method not allowed error, check API endpoint configuration')
          } else if (error.message === 'Network Error') {
            console.log('Network error occurred')
            console.log('[Auth Debug] Network error details:', {
              config: error.config,
              headers: error.config?.headers
            })
          }
          // 토큰 제거는 필요할 때만 수행
          if (!isNewUser) {
            tokenUtils.removeToken()
          }
          navigate('/')
        }
      } catch (error) {
        console.error('OAuth callback general error:', error)
        
        // 여기서도 isNewUser 확인하여 처리
        const isNewUser = searchParams.get('isNewUser') === 'true'
        if (isNewUser) {
          console.log('[OAuth] 일반 오류 발생했지만 신규 사용자이므로 /auth/add로 이동')
          navigate('/auth/add')
          return
        }
        
        // 일반 오류 처리
        tokenUtils.removeToken()
        navigate('/')
      }
    }

    getTokens()
  }, [navigate, searchParams, setUser, location])
  
  return <LoadingSpinner />
}

export default OAuthCallback 