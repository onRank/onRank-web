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
    
    // 토큰이 저장되었는지 확인하는 헬퍼 함수 추가
    const waitForTokenSaved = async () => {
      // 최대 10번까지 50ms 간격으로 확인 (총 500ms)
      for (let i = 0; i < 10; i++) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          console.log('[OAuth DEBUG] 토큰이 성공적으로 저장됨:', token.substring(0, 15) + '...');
          return true;
        }
        console.log(`[OAuth DEBUG] 토큰 저장 확인 중... (시도 ${i+1}/10)`);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      console.warn('[OAuth DEBUG] 토큰 저장 확인 실패');
      return false;
    };
    
    const getTokens = async () => {
      // URL 파라미터 로깅 - isNewUser 중점적으로 확인
      const isNewUserParam = searchParams.get('isNewUser');
      console.log('[OAuth DEBUG] isNewUser 파라미터 원본값:', isNewUserParam);
      
      // 서비스에서 쿼리파라미터로 isNewUser를 전달해주는지 확인 (문자열 비교 명확하게)
      const isNewUser = isNewUserParam === 'true';
      console.log(`[OAuth DEBUG] 사용자 상태 판단: ${isNewUser ? '신규 사용자' : '기존 사용자'}`);

      // 강화된 디버깅: 모든 쿼리 파라미터 출력
      console.log('[OAuth DEBUG] 전체 콜백 URL 파라미터:', Object.fromEntries([...searchParams.entries()]));
      
      // isNewUser 체크 후 auth/callback URL로 직접 접근한 경우 바로 studies 페이지로 리다이렉트
      if (isAuthCallback && !isNewUser) {
        console.log('[OAuth DEBUG] /auth/callback URL 감지됨 (기존 사용자), studies로 즉시 리다이렉트')
        
        // 기존 사용자인 경우에도 토큰 유무에 따라 처리
        const currentToken = localStorage.getItem('accessToken');
        if (currentToken) {
          console.log('[OAuth DEBUG] 기존 토큰 발견, 추가 처리 없이 studies로 이동');
          
          // 페이지 이동 전 잠시 지연
          await new Promise(resolve => setTimeout(resolve, 300));
          navigate('/studies', { replace: true });
          return;
        }
        
        // 토큰이 없는 경우 tokenUtils.setToken 호출 없이는 저장 안 되므로
        // reissue 요청을 계속 진행하는 것이 좋음
        console.log('[OAuth DEBUG] 토큰 없음, reissue 요청 진행');
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
            console.log('[OAuth DEBUG] 유효한 토큰 있음, reissue 건너뛰기')
            
            // 최우선: isNewUser가 true인 경우 - 토큰이 있는지 다시 확인하고 이동
            if (isNewUser) {
              console.log('[OAuth DEBUG] 신규 사용자 확인됨, /auth/add로 리다이렉트');
              navigate('/auth/add', { replace: true });
              return;
            }

            console.log('[OAuth DEBUG] 기존 사용자, /studies로 리다이렉트')
            navigate('/studies', { replace: true })
            return
          }
          // 여기까지 코드가 실행된다면 토큰이 만료된 상태
          console.log('[OAuth DEBUG] 토큰 만료됨, 새 토큰 요청')
        }

        // 토큰이 없거나 만료된 경우에만 reissue 요청
        console.log('[OAuth DEBUG] /auth/reissue 요청 시작')
        console.log('[Auth DEBUG] 요청 헤더:', {
          'Content-Type': 'application/json',
          'withCredentials': true
        })
        
        // 쿠키 디버그 정보 출력
        console.log('[Cookie DEBUG] 요청 전 쿠키:', document.cookie);
        console.log('[Cookie DEBUG] 현재 도메인:', window.location.hostname);
        console.log('[Cookie DEBUG] 현재 프로토콜:', window.location.protocol);
        
        try {
          const response = await api.get('/auth/reissue', {
            withCredentials: true
          })
          
          // 응답 후 쿠키 상태 확인
          console.log('[Cookie DEBUG] 응답 후 쿠키:', document.cookie);
          console.log('[Cookie DEBUG] 응답 후 쿠키 변경 여부:', document.cookie.includes('refresh_token'));
          
          console.log('[Auth DEBUG] 응답 헤더:', response.headers)
          
          const authHeader = response.headers['authorization'] || response.headers['Authorization']
          if (!authHeader) {
            console.error('[OAuth DEBUG] 응답에 인증 헤더 없음')
            
            // 새 사용자이면서 인증 헤더가 없는 경우에도 회원정보 페이지로 이동
            if (isNewUser) {
              console.log('[OAuth DEBUG] 토큰 없지만 신규 사용자이므로 /auth/add로 이동')
              navigate('/auth/add')
              return
            }
            
            throw new Error('Invalid or missing Authorization header')
          }

          // 토큰 저장
          tokenUtils.setToken(authHeader)
          console.log('[OAuth DEBUG] 토큰 저장 시도:', authHeader.substring(0, 15) + '...')
          
          // 토큰 저장 확인 대기
          const tokenSaved = await waitForTokenSaved();
          
          // 토큰 저장 실패 시 강제로 다시 저장 시도
          if (!tokenSaved) {
            console.warn('[OAuth DEBUG] 토큰 저장 실패, 다시 시도합니다.');
            
            // Bearer 접두사 확인 및 추가
            const tokenWithBearer = authHeader.startsWith('Bearer ') 
              ? authHeader 
              : `Bearer ${authHeader}`;
              
            // 직접 localStorage에 저장
            localStorage.setItem('accessToken', tokenWithBearer);
            
            // 세션 스토리지에도 백업 (중요!)
            sessionStorage.setItem('accessToken_backup', tokenWithBearer);
            
            console.log('[OAuth DEBUG] 토큰 직접 저장 완료, 확인 중...');
            
            // 직접 저장 후 다시 확인
            const directSavedToken = localStorage.getItem('accessToken');
            if (directSavedToken) {
              console.log('[OAuth DEBUG] 토큰 직접 저장 성공:', directSavedToken.substring(0, 15) + '...');
            } else {
              console.error('[OAuth DEBUG] 토큰 직접 저장 실패, 세션 스토리지 백업 사용 예정');
            }
          }

          // JWT 토큰에서 사용자 정보 추출
          const tokenPayload = JSON.parse(atob(authHeader.split('.')[1]))
          console.log('[OAuth DEBUG] 토큰 페이로드:', tokenPayload)
          
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
            // 토큰 확인 후 리다이렉트
            console.log('[OAuth DEBUG] 최종 판단: 신규 사용자! 토큰 확인 후 /auth/add로 이동');
            
            // 최종 토큰 확인
            const finalToken = localStorage.getItem('accessToken');
            console.log('[OAuth DEBUG] 최종 토큰 상태:', !!finalToken);
            
            // 토큰 저장이 완전히 마무리되도록 약간의 지연 추가 (300ms)
            console.log('[OAuth DEBUG] 페이지 이동 전 잠시 대기 (토큰 저장 보장)');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 토큰이 실제로 저장되었는지 최종 확인
            const verifiedToken = localStorage.getItem('accessToken');
            console.log('[OAuth DEBUG] 이동 직전 토큰 존재 여부:', !!verifiedToken);
            
            navigate('/auth/add', { replace: true });
            return;
          }

          // 신규 사용자가 아니라고 판단되면 스터디 페이지로 이동
          console.log('[OAuth DEBUG] 최종 판단: 기존 사용자. /studies로 이동');
          
          // 토큰 저장이 완전히 마무리되도록 약간의 지연 추가 (300ms)
          console.log('[OAuth DEBUG] 페이지 이동 전 잠시 대기 (토큰 저장 보장)');
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // 토큰이 실제로 저장되었는지 최종 확인
          const verifiedToken = localStorage.getItem('accessToken');
          console.log('[OAuth DEBUG] 이동 직전 토큰 존재 여부:', !!verifiedToken);
          
          navigate('/studies', { replace: true });
          return;
        } catch (error) {
          console.error('[OAuth DEBUG] OAuth 콜백 처리 실패:', error)
          
          // 에러 응답의 헤더와 쿠키 정보 출력
          console.log('[Cookie DEBUG] 에러 응답 헤더:', error.response?.headers);
          console.log('[Cookie DEBUG] 에러 후 쿠키:', document.cookie);
          
          // *** 핵심 수정 부분: 신규 사용자 판단 강화 ***
          // 어떤 소스에서든 신규 사용자 정보가 있으면 회원가입 페이지로 이동
          const isErrorNewUser = isNewUser || 
                               isNewUserInCookie || 
                               (error.response?.headers && error.response.headers['x-new-user'] === 'true') ||
                               (error.response?.data && error.response.data.isNewUser === true);
                              
          if (isErrorNewUser) {
            console.log('[OAuth DEBUG] 오류 발생했지만 신규 사용자로 판단됨, /auth/add로 이동');
            // 지연 추가
            await new Promise(resolve => setTimeout(resolve, 300));
            navigate('/auth/add', { replace: true });
            return;
          }
          
          // 기존 사용자의 경우 일반 오류 처리
          if (error.response?.status === 401) {
            console.log('[OAuth DEBUG] 인증 실패, 로그인으로 리다이렉트')
          } else if (error.response?.status === 405) {
            console.log('[OAuth DEBUG] 메소드 허용 안 됨 오류, API 엔드포인트 구성 확인')
          } else if (error.message === 'Network Error') {
            console.log('[OAuth DEBUG] 네트워크 오류 발생')
            console.log('[Auth Debug] 네트워크 오류 세부정보:', {
              config: error.config,
              headers: error.config?.headers
            })
          }
          // 토큰 제거는 필요할 때만 수행
          if (!isNewUser) {
            tokenUtils.removeToken(true);
          }
          // 지연 추가
          await new Promise(resolve => setTimeout(resolve, 300));
          navigate('/')
        }
      } catch (error) {
        console.error('[OAuth DEBUG] OAuth 콜백 일반 오류:', error)
        
        // 여기서도 isNewUser 확인하여 처리
        if (isNewUser) {
          console.log('[OAuth DEBUG] 일반 오류 발생했지만 신규 사용자이므로 /auth/add로 이동')
          // 지연 추가
          await new Promise(resolve => setTimeout(resolve, 300));
          navigate('/auth/add')
          return
        }
        
        // 일반 오류 처리
        tokenUtils.removeToken(true);
        // 지연 추가
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate('/')
      }
    }

    getTokens()
  }, [navigate, searchParams, setUser, location])
  
  return <LoadingSpinner />
}

export default OAuthCallback 