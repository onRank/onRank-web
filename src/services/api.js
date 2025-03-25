import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  console.error('API URL이 설정되지 않았습니다')
}

// 토큰 관련 유틸리티 함수
export const tokenUtils = {
  // 쿠키에서 특정 이름의 쿠키 값을 가져오는 유틸리티 함수
  getCookie: (name) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // 쿠키 이름이 접두사로 시작하는지 확인
      if (cookie.indexOf(name + '=') === 0) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  },

  // 리프레시 토큰 쿠키 존재 여부 확인 - 비동기 함수로 변경
  hasRefreshToken: async () => {
    // HttpOnly 쿠키는 JavaScript에서 직접 접근할 수 없음
    // 서버에 요청하여 쿠키 유효성 확인
    try {
      console.log('[Token Debug] Validating refresh token with server');
      const api = axios.create({
        baseURL: import.meta.env.PROD ? 'https://onrank.kr' : (import.meta.env.VITE_API_URL || 'http://localhost:8080'),
        timeout: 5000,
        withCredentials: true
      });
      
      await api.get('/auth/validate', { withCredentials: true });
      console.log('[Token Debug] Server confirmed refresh token is valid');
      return true;
    } catch (error) {
      // 서버 측에서 403, 401 등 인증 오류가 반환되면 리프레시 토큰이 없거나 유효하지 않은 것
      console.log('[Token Debug] Server validation failed:', error.message);
      return false;
    }
  },

  // 리프레시 토큰 쿠키 존재 여부 확인 - 동기 버전 (기존 코드와 호환성 유지)
  // 주의: HttpOnly 쿠키는 감지할 수 없으므로 이 메소드는 추가 검증 없이 사용 금지
  hasRefreshTokenSync: () => {
    // HttpOnly 쿠키는 직접 접근 불가능, 간접적인 확인 방법 필요
    console.log(`[Token Debug] Warning: Synchronous HttpOnly cookie check may be unreliable`);
    
    // 액세스 토큰이 있다면 리프레시 토큰도 있다고 가정 (간접적인 추론)
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        // 토큰 유효성 간단 검사
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        const expirationTime = tokenPayload.exp * 1000;
        
        // 만료되지 않은 토큰이 있으면 리프레시 토큰도 있다고 간주
        if (expirationTime > Date.now()) {
          console.log('[Token Debug] Valid access token exists, assuming refresh token also exists');
          return true;
        }
      } catch (e) {
        console.warn('[Token Debug] Error checking token format:', e);
      }
    }
    
    // 실제 백엔드 API 상태에 따라 간접적으로 판단할 수도 있음
    // 예: 최근 API 요청 성공 여부 등
    
    // 최후의 수단: 불확실한 경우 true 반환 (false positive가 false negative보다 나음)
    return true;
  },

  getToken: () => {
    // 새로고침 감지 - 브라우저 performance API 사용
    const isPageRefresh = window.performance && 
                         window.performance.navigation && 
                         window.performance.navigation.type === 1;

    // 새로고침 시 액세스 토큰 확인
    if (isPageRefresh) {
      console.log('[Token Debug] Page refresh detected, checking token validity')
      
      const token = localStorage.getItem('accessToken')
      
      // 토큰이 있으면 유효성 검사
      if (token) {
        try {
          // JWT 토큰 디코딩
          const tokenPayload = JSON.parse(atob(token.split('.')[1]))
          const expirationTime = tokenPayload.exp * 1000
          
          // 토큰이 만료됐거나 5분 이내 만료 예정이면 null 반환 (재발급 유도)
          if (Date.now() >= expirationTime - 300000) { // 5분 = 300,000ms
            console.log('[Token Debug] Token expired or expiring soon, will request new token')
            return null
          }
          
          // 새로고침 후 첫 호출에서 토큰 재검증 요청 필요 플래그 설정
          window._shouldRevalidateToken = true;
          
          console.log('[Token Debug] Valid token found after refresh:', token.substring(0, 15) + '...')
          return token
        } catch (error) {
          console.error('[Token Debug] Token validation error:', error)
          return null
        }
      }
      
      console.log('[Token Debug] No token found after refresh')
      return null
    }
    
    // 일반 요청 시 localStorage에서 토큰 확인
    const token = localStorage.getItem('accessToken')
    if (token) {
      // 토큰 유효성 간단 검사
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.warn('[Token Debug] Invalid token format (not a JWT):', token.substring(0, 15) + '...');
          localStorage.removeItem('accessToken'); // 잘못된 형식의 토큰 제거
          return null;
        }
      } catch (e) {
        console.warn('[Token Debug] Error checking token format:', e);
        localStorage.removeItem('accessToken'); // 에러가 발생한 토큰 제거
        return null;
      }
      
      console.log('[Token Debug] Retrieved token from localStorage:', token.substring(0, 15) + '...')
      return token
    }
    
    console.log('[Token Debug] No token found in localStorage')
    return null
  },
  
  setToken: (token) => {
    if (!token) {
      console.log('[Token Debug] Attempted to save null/undefined token, ignoring')
      return
    }
    
    // Bearer 접두사가 없는 경우에만 추가
    const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    
    // 토큰을 저장하기 전에 이벤트 발행
    const storageEvent = new Event('pre-tokensave')
    window.dispatchEvent(storageEvent)
    
    // localStorage에 저장
    localStorage.setItem('accessToken', tokenWithBearer)
    
    // 토큰 저장 후 이벤트 발행
    const postStorageEvent = new Event('post-tokensave')
    window.dispatchEvent(postStorageEvent)
    
    console.log('[Token Debug] Token saved successfully to localStorage')
  },
  
  removeToken: () => {
    // localStorage에서 토큰 제거
    localStorage.removeItem('accessToken')
    
    console.log('[Token Debug] Token removed from localStorage')
  },
  
  // localStorage에서 accessToken만 제거하고 쿠키(refresh token)는 유지하는 함수
  removeTokenKeepCookies: () => {
    // localStorage의 accessToken만 제거
    localStorage.removeItem('accessToken')
    
    console.log('[Token Debug] Access token removed from localStorage while keeping cookies (refresh token)')
  },
  
  isTokenValid: (token) => {
    if (!token) return false
    
    try {
      // JWT 토큰 디코딩
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      
      const payload = JSON.parse(jsonPayload)
      const expirationTime = payload.exp * 1000 // 밀리초로 변환
      
      // 현재 시간과 비교 (5분 이내로 만료라면 미리 갱신 유도)
      return Date.now() < (expirationTime - 300000)
    } catch (error) {
      console.error('[Token Debug] Token validation error:', error)
      return false
    }
  },
  
  isTokenExpired: (token) => {
    if (!token) return true
    
    try {
      // JWT 토큰 디코딩
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      
      const payload = JSON.parse(jsonPayload)
      const expirationTime = payload.exp * 1000 // 밀리초로 변환
      
      // 현재 시간과 비교
      return Date.now() >= expirationTime
    } catch (error) {
      console.error('[Token Debug] Token expiration check error:', error)
      return true
    }
  },
  
  // 쿠키 설정 유틸리티 함수
  setCookie: (name, value, options = {}) => {
    const defaultOptions = {
      path: '/',
      sameSite: 'Lax',
      // HTTPS 환경에서는 Secure 속성 추가
      ...(window.location.protocol === 'https:' ? { secure: true } : {})
    };
    
    const cookieOptions = { ...defaultOptions, ...options };
    let cookieString = `${name}=${value}`;
    
    Object.entries(cookieOptions).forEach(([key, value]) => {
      if (value === true) {
        cookieString += `; ${key}`;
      } else if (value !== false && value != null) {
        cookieString += `; ${key}=${value}`;
      }
    });
    
    document.cookie = cookieString;
    console.log(`[Token Debug] Cookie set: ${name} (options: ${JSON.stringify(cookieOptions)})`);
  },
  
  // 쿠키 제거 유틸리티 함수
  removeCookie: (name, options = {}) => {
    const defaultOptions = {
      path: '/',
      sameSite: 'Lax',
      expires: 'Thu, 01 Jan 1970 00:00:01 GMT',
      ...(window.location.protocol === 'https:' ? { secure: true } : {})
    };
    
    const cookieOptions = { ...defaultOptions, ...options };
    tokenUtils.setCookie(name, '', cookieOptions);
    console.log(`[Token Debug] Cookie removed: ${name}`);
  },
  
  // 리프레시 토큰 쿠키 제거 유틸리티 함수
  removeRefreshTokenCookie: () => {
    tokenUtils.removeCookie('refresh_token');
  },
  
  // 로컬 스토리지 토큰 삭제 및 리프레시 토큰 쿠키 삭제
  clearAllTokens: () => {
    // 로컬 스토리지에서 액세스 토큰 제거
    localStorage.removeItem('accessToken');
    // 리프레시 토큰 쿠키 제거
    tokenUtils.removeRefreshTokenCookie();
    console.log('[Token Debug] All tokens cleared (localStorage + cookie)');
  }
}

// api 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.PROD ? 'https://onrank.kr' : (import.meta.env.VITE_API_URL || 'http://localhost:8080'),
  timeout: 10000, // 타임아웃 증가
  withCredentials: true,  // CORS 요청에서 쿠키 전송 허용 (리프레시 토큰 쿠키 사용을 위해 필수)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // CSRF 방지 및 브라우저 호환성 향상
  }
})

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    // /auth/reissue 요청인 경우 특별 처리
    if (config.url?.includes('/auth/reissue')) {
      console.log('[API Debug] /auth/reissue 요청 감지: 액세스 토큰 유효성 확인');
      
      // localStorage에서 현재 토큰 확인
      const currentToken = localStorage.getItem('accessToken');
      
      // 기존 액세스 토큰이 있는 경우 그 유효성 확인
      if (currentToken) {
        try {
          // JWT 토큰 디코딩 및 만료 확인
          const tokenPayload = JSON.parse(atob(currentToken.split('.')[1]));
          const expirationTime = tokenPayload.exp * 1000;
          const timeToExpiration = expirationTime - Date.now();
          
          // 토큰이 아직 유효한 경우 (만료되지 않음)
          if (timeToExpiration > 0) {
            console.log('[API Debug] 유효한 액세스 토큰 존재함 - /auth/reissue 요청 취소');
            
            // 요청 취소 (Axios 요청 취소 기능 사용)
            const cancelTokenSource = axios.CancelToken.source();
            config.cancelToken = cancelTokenSource.token;
            cancelTokenSource.cancel('현재 토큰이 유효하여 reissue 요청이 취소됨');
            
            return config;
          }
          
          console.log('[API Debug] 액세스 토큰 만료됨, reissue 요청 진행');
        } catch (error) {
          console.error('[API Debug] 토큰 검증 중 오류:', error);
        }
      }
      
      // 토큰이 없거나 만료된 경우 일반적으로 진행
      console.log('[API Debug] 액세스 토큰이 없거나 만료됨, reissue 요청 진행');
      return config;
    }
    
    // 페이지 새로고침 후 첫 API 요청에서 토큰 유효성 강제 검증
    if (window._shouldRevalidateToken && 
        !config.url?.includes('/auth/login')) {
      window._shouldRevalidateToken = false; // 플래그 초기화
      console.log('[API Debug] First request after refresh, checking token validity');
      
      // 로컬 저장소에서 현재 토큰 확인
      const currentToken = localStorage.getItem('accessToken');
      if (currentToken) {
        // JWT 토큰 디코딩 및 만료 확인
        try {
          const tokenPayload = JSON.parse(atob(currentToken.split('.')[1]));
          const expirationTime = tokenPayload.exp * 1000;
          const timeToExpiration = expirationTime - Date.now();
          
          // 토큰이 만료되지 않은 경우, 그대로 사용
          if (timeToExpiration > 0) {
            console.log('[API Debug] Valid token exists (expiry: ' + 
              Math.round(timeToExpiration / 60000) + ' mins), continuing with request');
            
            // Bearer 토큰 형식 확인 및 설정
            if (!config.headers['Authorization'] && !config.headers['authorization']) {
              const tokenWithBearer = currentToken.startsWith('Bearer ') ? currentToken : `Bearer ${currentToken}`;
              config.headers['Authorization'] = tokenWithBearer;
            }
            
            return config;
          }
          
          // 토큰이 만료된 경우에만 재발급 요청
          if (timeToExpiration <= 0) {
            console.log('[API Debug] Token expired, attempting reissue');
            
            try {
              // 세션 유효성 검증 및 토큰 갱신 시도
              const refreshResponse = await api.get('/auth/reissue', {
                withCredentials: true // 쿠키 전송 필수
              });
              
              const newToken = refreshResponse.headers['authorization'] || refreshResponse.headers['Authorization'];
              if (newToken) {
                console.log('[API Debug] Session validation successful, using new token');
                tokenUtils.setToken(newToken);
                
                // 현재 요청에 새 토큰 적용
                if (!config.headers['Authorization'] && !config.headers['authorization']) {
                  const tokenWithBearer = newToken.startsWith('Bearer ') ? newToken : `Bearer ${newToken}`;
                  config.headers['Authorization'] = tokenWithBearer;
                }
              }
            } catch (error) {
              console.error('[API Debug] Session validation failed:', error.message);
              // 검증 실패 시 로컬 토큰 제거 (리프레시 토큰이 유효하지 않음)
              tokenUtils.removeToken();
            }
          } else {
            // 토큰이 곧 만료되지만 아직 유효하면 현재 요청은 그대로 진행
            console.log('[API Debug] Token still valid but expires soon (' + 
              Math.round(timeToExpiration / 60000) + ' mins), using current token for this request');
            
            // Bearer 토큰 형식 확인 및 설정
            if (!config.headers['Authorization'] && !config.headers['authorization']) {
              const tokenWithBearer = currentToken.startsWith('Bearer ') ? currentToken : `Bearer ${currentToken}`;
              config.headers['Authorization'] = tokenWithBearer;
            }
            
            return config;
          }
        } catch (err) {
          console.error('[API Debug] Error parsing token:', err);
          tokenUtils.removeToken();
        }
      } else {
        console.log('[API Debug] No token found after refresh');
      }
    }
    
    // 토큰 가져오기
    let token = tokenUtils.getToken();
    
    // 로그 여부 확인
    if (config.url) {
      console.log(`[API Debug] Processing request to ${config.url}, token exists: ${!!token}`)
    }
    
    // 토큰이 없고 리프레시/로그인 요청이 아닌 경우 리프레시 토큰으로 새 토큰 요청
    if (!token && !config.url?.includes('/auth/reissue') && !config.url?.includes('/auth/login')) {
      try {
        console.log(`[API Debug] No token for ${config.url}, attempting to refresh...`)
        
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const refreshResponse = await api.get('/auth/reissue', {
          withCredentials: true // 쿠키의 리프레시 토큰을 서버로 전송
        });
        
        const newToken = refreshResponse.headers['authorization'] || refreshResponse.headers['Authorization']
        if (newToken) {
          console.log('[API Debug] Token refresh successful, using new token')
          tokenUtils.setToken(newToken)
          token = newToken
        }
      } catch (error) {
        console.log(`[API Debug] Failed to refresh token: ${error.message}`)
      }
    }
    
    // 헤더에 이미 Authorization이 있는지 확인
    const hasAuthHeader = config.headers && (config.headers['Authorization'] || config.headers['authorization'])
    
    if (token && !hasAuthHeader) {
      // Bearer 토큰 형식 확인 및 설정
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      config.headers['Authorization'] = tokenWithBearer
      console.log(`[API Debug] Added Authorization header to request: ${config.url}`)
      
      // 토큰 만료 시간 확인
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
        const expirationTime = tokenPayload.exp * 1000
        console.log('[API Debug] Token expiration:', new Date(expirationTime))
        
        // 토큰이 만료되었거나 5분 이내로 만료될 예정인 경우
        if (Date.now() >= expirationTime - 300000) { // 5분으로 조정
          console.log('[API Debug] Token needs refresh')
          // 토큰 갱신은 응답 인터셉터에서 처리
        }
      } catch (error) {
        console.error('[API Debug] Token parsing error:', error)
      }
    } else if (hasAuthHeader) {
      console.log(`[API Debug] Request already has Authorization header: ${config.url}`)
    } else {
      console.warn(`[API Debug] No token available for request to ${config.url}`)
    }

    // 디버그 로깅
    console.log('[API Debug] Request config:', {
      url: config.url,
      method: config.method,
      hasAuthHeader: !!hasAuthHeader,
      withCredentials: config.withCredentials
    })

    // 모든 요청에 credentials 강제 적용
    config.withCredentials = true;
    
    // 디버그 로깅
    console.log('[API Debug] Final request config:', {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers
    });

    return config
  },
  (error) => {
    console.error('[API Debug] Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    })
    
    const authHeader = response.headers['authorization'] || response.headers['Authorization']
    if (authHeader) {
      console.log('[API Debug] New token received:', authHeader)
      tokenUtils.setToken(authHeader)
    }
    return response
  },
  async (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      url: error.config?.url
    })

    const originalRequest = error.config;

    // /auth/add 요청에서 401이 발생한 경우 특별 처리
    if (error.response?.status === 401 && originalRequest.url === '/auth/add') {
      console.log('회원정보 등록 중 인증 오류 발생')
      // 토큰만 제거하고 리다이렉트는 하지 않음
      tokenUtils.removeToken()
      return Promise.reject(error)
    }

    // 토큰 재발급 요청 실패 시
    if (error.response?.status === 401 && originalRequest.url === '/auth/reissue') {
      console.log('토큰 재발급 실패')
      // 특정 에러 메시지인 경우 처리
      if (error.response?.data && typeof error.response.data === 'string' && 
          error.response.data.includes('만료되지 않은 access token과 함께 refresh token이 전달되었습니다')) {
        console.log('유효한 액세스 토큰이 있으므로 재발급 요청이 거부됨 - 정상적인 상황')
        // 이 경우는 정상적인 상황이므로 토큰을 유지하고 원래 요청 진행
        return Promise.reject(error)
      }
      
      // 다른 401 오류는 토큰 제거
      tokenUtils.removeToken()
      // 리다이렉트 하지 않고 에러만 반환
      return Promise.reject(error)
    }

    // 401 에러이고 아직 재시도하지 않은 경우에만 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      console.log('[API Debug] Token expired, attempting to refresh...')
      try {
        // HttpOnly 쿠키에 저장된 리프레시 토큰을 사용하여 새 토큰 요청
        // withCredentials: true로 쿠키를 포함하여 요청
        const response = await api.get('/auth/reissue', {
          withCredentials: true
        })
        
        const newToken = response.headers['authorization'] || response.headers['Authorization']
        if (newToken) {
          console.log('[API Debug] Token refresh successful:', newToken)
          tokenUtils.setToken(newToken)
          originalRequest.headers['Authorization'] = newToken
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('[API Debug] Token refresh failed:', refreshError)
        tokenUtils.removeToken()
        // 리다이렉트하지 않고 에러만 반환
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // 회원 정보 등록
  addUserInfo: async (userData) => {
    try {
      console.log('[Auth] 회원정보 등록 시도:', userData)

      // 회원정보 등록 요청 - 토큰을 명시적으로 헤더에 추가
      const token = tokenUtils.getToken();
      const headers = {};
      
      if (token) {
        const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers['Authorization'] = tokenWithBearer;
        console.log('[Auth] Including token in request:', tokenWithBearer)
      } else {
        console.warn('[Auth] No token found for auth/add request')
      }

      const response = await api.post('/auth/add', {
        studentName: userData.studentName.trim(),
        studentSchool: userData.studentSchool?.trim() || '',
        studentDepartment: userData.studentDepartment?.trim() || '',
        studentPhoneNumber: userData.studentPhoneNumber.trim()
      }, { headers })

      console.log('[Auth] 회원정보 등록 성공:', response.data)
      
      // 토큰 추출 및 저장
      const newToken = response.headers['authorization'] || response.headers['Authorization']
      if (newToken) {
        console.log('[Auth] Token found in registration response, saving it')
        
        // 기존 토큰 제거 후 새 토큰 저장 (충돌 방지)
        localStorage.removeItem('accessToken')
        
        // 약간의 지연 후 새 토큰 저장
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // 새 토큰 저장
        tokenUtils.setToken(newToken)
        
        // 토큰이 localStorage에 완전히 저장되도록 작은 지연 추가
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 토큰이 실제로 저장되었는지 확인
        const savedToken = localStorage.getItem('accessToken')
        if (savedToken) {
          console.log('[Auth] Token successfully saved to localStorage')
        } else {
          console.warn('[Auth] Token was not saved to localStorage')
          // 마지막 시도: 직접 저장
          try {
            const tokenWithBearer = newToken.startsWith('Bearer ') ? newToken : `Bearer ${newToken}`;
            localStorage.setItem('accessToken', tokenWithBearer);
            console.log('[Auth] Direct token save attempt completed');
          } catch (storageError) {
            console.error('[Auth] Error saving token directly:', storageError);
          }
        }
      }
      
      return response // 전체 response 객체 반환
    } catch (error) {
      console.error('[Auth] 회원정보 등록 실패:', error)
      throw error
    }
  },
  
  // 로그아웃
  logout: async () => {
    try {
      console.log('[Auth] 로그아웃 시도');
      
      // 토큰 제거 전 확인
      const tokenBefore = tokenUtils.getToken();
      console.log('[Auth] 로그아웃 전 토큰 존재 여부:', !!tokenBefore);
      const hasRefreshToken = tokenUtils.hasRefreshTokenSync();
      console.log('[Auth] 로그아웃 전 리프레시 토큰 존재 여부:', hasRefreshToken);
      
      // 로그아웃 요청 - 백엔드에서 리프레시 토큰 쿠키를 제거하도록 요청
      try {
        // 백엔드 로그아웃 API가 구현되었다면 호출
        await api.post('/auth/logout', {}, { 
          withCredentials: true // 쿠키를 전송하기 위해 필수
        });
        console.log('[Auth] 백엔드 로그아웃 요청 성공');
      } catch (apiError) {
        console.warn('[Auth] 백엔드 로그아웃 요청 실패:', apiError);
        
        // 백엔드 로그아웃 API가 실패하거나 없는 경우, 프론트엔드에서 리프레시 토큰 쿠키 제거
        tokenUtils.removeRefreshTokenCookie();
      }
      
      // 모든 토큰 제거 (로컬 스토리지 + 쿠키)
      tokenUtils.clearAllTokens();
      
      // 토큰 제거 후 확인
      const tokenAfter = tokenUtils.getToken();
      console.log('[Auth] 로그아웃 후 토큰 존재 여부:', !!tokenAfter);
      const hasRefreshTokenAfter = tokenUtils.hasRefreshTokenSync();
      console.log('[Auth] 로그아웃 후 리프레시 토큰 존재 여부:', hasRefreshTokenAfter);
      
      // 세션 스토리지도 정리
      sessionStorage.removeItem('temp_token');
      sessionStorage.removeItem('accessTokenBackup');
      if (window.tempAuthToken) {
        window.tempAuthToken = null;
      }
      
      console.log('[Auth] 로그아웃 성공');
      return { success: true };
    } catch (error) {
      console.error('[Auth] 로그아웃 실패:', error);
      
      // 오류 발생 시에도 토큰 제거 시도
      tokenUtils.clearAllTokens();
      
      throw error;
    }
  }
}

// 스터디 관련 API 서비스
export const studyService = {
  // 스터디 생성
  createStudy: async (studyData) => {
    try {
      console.log('[StudyService] 스터디 생성 요청:', studyData);
      
      // 백엔드 DTO 구조에 맞게 데이터 변환
      const requestData = {
        studyName: studyData.studyName || '',
        studyContent: studyData.studyContent || '',
        studyImageUrl: studyData.studyImageUrl || null,
        studyGoogleFormUrl: studyData.studyGoogleFormUrl || null
      };
      
      console.log('[StudyService] 변환된 요청 데이터:', requestData);
      
      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error('[StudyService] 토큰 없음, 스터디 생성 불가');
        throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
      }
      
      // 토큰 형식 확인
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // API 요청
      const response = await api.post('/studies/add', requestData, {
        headers: {
          'Authorization': tokenWithBearer,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF 방지 및 브라우저 호환성 향상
          'Accept': 'application/json' // JSON 응답 요청
        },
        withCredentials: true
      });
      
      // 응답이 HTML인 경우 (로그인 페이지 등)
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.warn('[StudyService] HTML 응답 감지, 인증 문제 가능성:', response.data.substring(0, 100) + '...');
        
        // 토큰 재발급 시도 (만료 여부와 관계없이)
        try {
          console.log('[StudyService] 토큰 재발급 시도');
          const refreshResponse = await api.get('/auth/reissue', {
            withCredentials: true,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          // 응답 확인 및 로깅
          console.log('[StudyService] 토큰 재발급 응답 상태:', refreshResponse.status);
          console.log('[StudyService] 토큰 재발급 응답 헤더:', refreshResponse.headers);
          
          // 헤더에서 새 토큰 확인
          const newToken = refreshResponse.headers['authorization'] || refreshResponse.headers['Authorization'];
          
          // 응답 데이터에서도 토큰 확인 (서버 구현에 따라 다름)
          let dataToken = null;
          if (refreshResponse.data) {
            if (typeof refreshResponse.data === 'object') {
              dataToken = refreshResponse.data.token || refreshResponse.data.accessToken;
            } else if (typeof refreshResponse.data === 'string' && 
                       refreshResponse.data.includes('.') && 
                       refreshResponse.data.split('.').length === 3) {
              dataToken = refreshResponse.data;
            }
          }
          
          // 헤더 또는 데이터에서 토큰을 찾은 경우
          if (newToken || dataToken) {
            const tokenToUse = newToken || dataToken;
            console.log('[StudyService] 토큰 재발급 성공, 요청 재시도');
            tokenUtils.setToken(tokenToUse);
            
            // 새 토큰으로 요청 재시도
            const retryResponse = await api.post('/studies/add', requestData, {
              headers: {
                'Authorization': tokenToUse.startsWith('Bearer ') ? tokenToUse : `Bearer ${tokenToUse}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
              },
              withCredentials: true
            });
            
            console.log('[StudyService] 스터디 생성 재시도 결과:', retryResponse.data);
            return retryResponse.data;
          } else if (refreshResponse.status === 200) {
            // 토큰은 없지만 200 응답인 경우 재시도
            console.log('[StudyService] 토큰 재발급은 성공했으나 새 토큰을 찾을 수 없음, 요청 재시도');
            
            // 다시 원래 요청 시도
            const retryResponse = await api.post('/studies/add', requestData, {
              headers: {
                'Authorization': tokenWithBearer,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
              },
              withCredentials: true
            });
            
            console.log('[StudyService] 스터디 생성 재시도 결과:', retryResponse.data);
            return retryResponse.data;
          }
          
        } catch (refreshError) {
          console.error('[StudyService] 토큰 재발급 실패:', refreshError);
          // 토큰 재발급 실패 시 액세스 토큰만 제거 (리프레시 토큰 쿠키는 유지)
          tokenUtils.removeTokenKeepCookies();
          return { 
            success: false, 
            message: '인증이 만료되었습니다. 다시 로그인해주세요.',
            requireRelogin: true
          };
        }
        
        // 토큰 재발급이 실패했거나 유효한 응답을 받지 못한 경우
        console.log('[StudyService] HTML 응답 처리 후 fallback: 권한 문제 가능성');
        return { 
          success: false, 
          message: '권한이 없거나 세션이 만료되었습니다. 다시 로그인해주세요.', 
          requireRelogin: true 
        };
      }
      
      console.log('[StudyService] 스터디 생성 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('[StudyService] 스터디 생성 오류:', error);
      
      // 인증 오류인 경우 (401, 403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('[StudyService] 인증 오류:', error.response.status);
        // 액세스 토큰만 제거하고 리프레시 토큰 쿠키는 유지
        tokenUtils.removeTokenKeepCookies();
        return {
          success: false,
          message: '인증에 실패했습니다. 다시 로그인해주세요.',
          requireRelogin: true
        };
      }
      
      throw error;
    }
  },
  
  // 스터디 목록 조회
  getStudies: async (params = {}) => {
    try {
      console.log('[StudyService] 스터디 목록 조회 요청');
      
      // 토큰 확인 및 갱신
      const token = tokenUtils.getToken();
      if (!token) {
        console.warn('[StudyService] 토큰 없음, 스터디 목록 조회 시 인증 문제 가능성');
      }
      
      const response = await api.get('/studies', { 
        params,
        withCredentials: true,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('[StudyService] 스터디 목록 조회 성공:', response.data);
      
      // 응답이 문자열인 경우 안전하게 처리
      let data = response.data;
      if (typeof data === 'string') {
        try {
          console.log('[StudyService] 문자열 응답 처리 시도');
          
          // HTML 응답인 경우 빈 배열 반환
          if (data.includes('<!DOCTYPE html>')) {
            console.warn('[StudyService] HTML 응답 감지, 빈 배열 반환');
            return [];
          }
          
          // JSON 문자열인 경우 파싱 시도
          try {
            return JSON.parse(data);
          } catch (parseError) {
            console.error('[StudyService] 데이터 파싱 실패:', parseError);
            return [];
          }
        } catch (error) {
          console.error('[StudyService] 응답 처리 오류:', error);
          return [];
        }
      }
      
      // 배열이 아닌 경우 배열로 변환
      if (!Array.isArray(data)) {
        console.warn('[StudyService] 응답이 배열이 아님, 배열로 변환:', data);
        return data ? [data] : [];
      }
      
      // 각 스터디 객체의 필드 확인 및 로깅
      if (data.length > 0) {
        console.log('[StudyService] 첫 번째 스터디 객체 필드:', Object.keys(data[0]));
        
        // 필드명 확인 - 백엔드 DTO 구조에 맞게 확인
        console.log('[StudyService] studyName 존재 여부:', 'studyName' in data[0]);
        console.log('[StudyService] studyContent 존재 여부:', 'studyContent' in data[0]);
        console.log('[StudyService] studyImageUrl 존재 여부:', 'studyImageUrl' in data[0]);
        
        // 데이터 유효성 검사
        data = data.map(study => {
          // 필수 필드가 없는 경우 기본값 설정
          if (!study.studyName) {
            console.warn('[StudyService] studyName 필드 없음, 기본값 설정');
            study.studyName = '제목 없음';
          }
          
          if (!study.studyContent) {
            console.warn('[StudyService] studyContent 필드 없음, 기본값 설정');
            study.studyContent = '설명 없음';
          }
          
          // studyImageUrl 필드가 존재하지만 값이 null이거나 빈 문자열인 경우 처리
          if ('studyImageUrl' in study) {
            if (study.studyImageUrl === null || study.studyImageUrl === '') {
              console.log('[StudyService] studyImageUrl 필드가 비어있어 기본값(빈 문자열)으로 설정합니다');
              study.studyImageUrl = '';
            }
          } else {
            console.log('[StudyService] studyImageUrl 필드가 없어 기본값(빈 문자열)으로 설정합니다');
            study.studyImageUrl = '';
          }
          
          return study;
        });
      }
      
      return data;
    } catch (error) {
      console.error('[StudyService] 스터디 목록 조회 오류:', error);
      // 오류 발생 시 빈 배열 반환
      return [];
    }
  },
  
  // 스터디 상세 조회
  getStudyById: async (studyId) => {
    try {
      console.log(`[StudyService] 스터디 상세 조회 요청: ${studyId}`);
      
      const response = await api.get(`/studies/${studyId}`, {
        withCredentials: true
      });
      
      console.log('[StudyService] 스터디 상세 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('[StudyService] 스터디 상세 조회 오류:', error);
      throw error;
    }
  },
  
  // 스터디 참여 신청
  applyToStudy: async (studyId, applicationData) => {
    try {
      console.log(`[StudyService] 스터디 참여 신청 요청: ${studyId}`);
      
      // 토큰 확인
      const token = tokenUtils.getToken();
      if (!token) {
        console.error('[StudyService] 토큰 없음, 스터디 참여 신청 불가');
        throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
      }
      
      // API 요청
      const response = await api.post(`/studies/${studyId}/apply`, applicationData, {
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('[StudyService] 스터디 참여 신청 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('[StudyService] 스터디 참여 신청 오류:', error);
      throw error;
    }
  }
};