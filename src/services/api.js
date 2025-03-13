import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  console.error('API URL이 설정되지 않았습니다')
}

// 토큰 관련 유틸리티 함수
export const tokenUtils = {
  getToken: () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      // 토큰 유효성 간단 검사 추가
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.warn('[Token Debug] Invalid token format (not a JWT):', token.substring(0, 15) + '...');
          return null;
        }
      } catch (e) {
        console.warn('[Token Debug] Error checking token format:', e);
      }
      
      console.log('[Token Debug] Retrieved token from localStorage:', token.substring(0, 15) + '...')
      return token
    }
    
    // 백업 소스에서 확인
    const backupToken = sessionStorage.getItem('temp_token') || 
                        sessionStorage.getItem('accessTokenBackup') || 
                        window.tempAuthToken
    
    if (backupToken) {
      console.log('[Token Debug] Token found in backup storage, restoring to localStorage')
      localStorage.setItem('accessToken', backupToken)
      return backupToken
    }
    
    console.log('[Token Debug] No token found in any storage')
    return null
  },
  
  setToken: (token) => {
    if (!token) {
      console.log('[Token Debug] Attempted to save null/undefined token, ignoring')
      return
    }
    // 이미 저장된 토큰과 같다면 저장하지 않음
    const currentToken = localStorage.getItem('accessToken')
    if (currentToken === token) {
      console.log('[Token Debug] Token unchanged, not saving again')
      return
    }
    
    // Bearer 접두사가 없는 경우에만 추가
    const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    
    // 토큰을 저장하기 전에 이벤트 발행
    const storageEvent = new Event('pre-tokensave')
    window.dispatchEvent(storageEvent)
    
    // localStorage에 저장
    localStorage.setItem('accessToken', tokenWithBearer)
    
    // 백업 저장
    sessionStorage.setItem('accessTokenBackup', tokenWithBearer)
    
    // 토큰 저장 후 이벤트 발행
    const postStorageEvent = new Event('post-tokensave')
    window.dispatchEvent(postStorageEvent)
    
    console.log('[Token Debug] Token saved successfully')
  },
  
  removeToken: (force = false) => {
    localStorage.removeItem('accessToken')
    
    if (force) {
      // 모든 백업 토큰도 제거
      sessionStorage.removeItem('temp_token')
      sessionStorage.removeItem('accessTokenBackup')
      if (window.tempAuthToken) {
        window.tempAuthToken = null
      }
    }
    
    console.log('[Token Debug] Token removed' + (force ? ' (including backups)' : ''))
  },
  
  // 세션 스토리지의 백업 토큰을 복원하는 함수
  restoreTokenFromBackup: () => {
    console.log('[Token Debug] Attempting to restore token from backup')
    // 백업 소스에서 토큰 복원 시도 (우선순위: sessionStorage > 전역변수)
    const backupToken = sessionStorage.getItem('accessTokenBackup') || 
                        sessionStorage.getItem('temp_token') || 
                        window.tempAuthToken
    
    if (backupToken) {
      console.log('[Token Debug] Token found in backup storage, restoring to localStorage')
      localStorage.setItem('accessToken', backupToken)
      return backupToken
    }
    
    console.log('[Token Debug] No backup token found')
    return null
  },
  
  waitForToken: (timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        window.removeEventListener('post-tokensave', tokenHandler)
        console.log('[Token Debug] Timeout waiting for token')
        
        // 타임아웃 시 마지막으로 한 번 더 확인
        const lastToken = localStorage.getItem('accessToken') || 
                          sessionStorage.getItem('temp_token') || 
                          sessionStorage.getItem('accessTokenBackup') || 
                          window.tempAuthToken
        
        if (lastToken) {
          console.log('[Token Debug] Token found on final check')
          // localStorage에 없다면 저장
          if (!localStorage.getItem('accessToken')) {
            localStorage.setItem('accessToken', lastToken)
          }
          resolve(lastToken)
          return
        }
        
        reject(new Error('Token not available after timeout'))
      }, timeout)
      
      const tokenHandler = () => {
        clearTimeout(timeoutId)
        const token = localStorage.getItem('accessToken')
        console.log('[Token Debug] Token saved event detected, token:', token ? 'exists' : 'not found')
        if (token) {
          resolve(token)
        } else {
          reject(new Error('Token save event fired but token not found'))
        }
      }
      
      window.addEventListener('post-tokensave', tokenHandler)
      
      // 이미 토큰이 있는지 확인
      const existingToken = localStorage.getItem('accessToken')
      if (existingToken) {
        clearTimeout(timeoutId)
        window.removeEventListener('post-tokensave', tokenHandler)
        console.log('[Token Debug] Token already exists, no need to wait')
        resolve(existingToken)
      }
    })
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
      
      // 현재 시간과 비교
      return Date.now() < expirationTime
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
  }
}

// api 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10000, // 타임아웃 증가
  withCredentials: true,  // CORS 요청에서 쿠키 전송 허용
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // CSRF 방지 및 브라우저 호환성 향상
  }
})

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    // 항상 localStorage에서 직접 토큰을 가져옴 (최신 토큰을 보장)
    let token = localStorage.getItem('accessToken')
    
    // Log whether token exists for all requests
    if (config.url) {
      console.log(`[API Debug] Processing request to ${config.url}, token exists: ${!!token}`)
    }
    
    // 토큰이 없고 특정 API 요청인 경우 토큰이 저장될 때까지 짧게 대기
    if (!token && !config.url?.includes('/auth/reissue') && !config.url?.includes('/auth/login')) {
      try {
        console.log(`[API Debug] No token for ${config.url}, waiting briefly...`)
        // 최대 500ms 동안 토큰이 저장되기를 기다림
        token = await tokenUtils.waitForToken(500).catch(err => {
          console.log(`[API Debug] Timeout waiting for token: ${err.message}`)
          return null
        })
      } catch (error) {
        console.log(`[API Debug] Error waiting for token: ${error.message}`)
      }
      
      // 토큰이 여전히 없으면 sessionStorage에서 확인
      if (!token) {
        const tempToken = sessionStorage.getItem('temp_token')
        if (tempToken) {
          console.log('[API Debug] Found token in sessionStorage, using it')
          localStorage.setItem('accessToken', tempToken)
          sessionStorage.removeItem('temp_token')
          token = tempToken
        } else if (window.tempAuthToken) {
          // 전역 변수 백업에서 확인 (극단적인 대비책)
          console.log('[API Debug] Found token in window.tempAuthToken, using it')
          localStorage.setItem('accessToken', window.tempAuthToken)
          token = window.tempAuthToken
          // 사용 후 제거
          window.tempAuthToken = null
        }
      }
    }
    
    // 헤더에 이미 Authorization이 있는지 확인
    const hasAuthHeader = config.headers && (config.headers['Authorization'] || config.headers['authorization'])
    
    if (token && !hasAuthHeader) {
      // Bearer 토큰 형식 확인 및 설정
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      config.headers['Authorization'] = tokenWithBearer
      console.log(`[API Debug] Added Authorization header to request: ${config.url}`)
      
      // 쿠키에도 토큰 설정 (백엔드가 쿠키에서 토큰을 읽는 경우를 대비)
      document.cookie = `Authorization=${tokenWithBearer}; path=/; SameSite=Lax;`
      
      // 토큰 만료 시간 확인
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
        const expirationTime = tokenPayload.exp * 1000
        console.log('[API Debug] Token expiration:', new Date(expirationTime))
        
        // 토큰이 만료되었거나 1분 이내로 만료될 예정인 경우
        if (Date.now() >= expirationTime - 60000) {
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
      tokenUtils.removeToken()
      // 리다이렉트 하지 않고 에러만 반환
      return Promise.reject(error)
    }

    // 401 에러이고 아직 재시도하지 않은 경우에만 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      console.log('[API Debug] Token expired, attempting to refresh...')
      try {
        const response = await api.get('/auth/reissue')
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
      
      return response.data
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
      
      // 백엔드 API 구현 전까지는 주석 처리
      /*
      // 토큰 가져오기
      const token = tokenUtils.getToken();
      const headers = {};
      
      if (token) {
        const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers['Authorization'] = tokenWithBearer;
      }
      
      // 로그아웃 요청
      const response = await api.post('/auth/logout', {}, { 
        headers,
        withCredentials: true 
      });
      */
      
      // 로컬 스토리지에서 토큰 제거 (모든 백업 토큰도 함께 제거)
      tokenUtils.removeToken(true);
      
      // 토큰 제거 후 확인
      const tokenAfter = tokenUtils.getToken();
      console.log('[Auth] 로그아웃 후 토큰 존재 여부:', !!tokenAfter);
      
      // 세션 스토리지도 정리
      sessionStorage.removeItem('temp_token');
      sessionStorage.removeItem('accessTokenBackup');
      if (window.tempAuthToken) {
        window.tempAuthToken = null;
      }
      
      console.log('[Auth] 로그아웃 성공 (토큰만 삭제)');
      return { success: true }; // 임시 응답 객체
    } catch (error) {
      console.error('[Auth] 로그아웃 실패:', error);
      // 오류가 발생해도 로컬 토큰은 제거
      tokenUtils.removeToken(true);
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
        
        // 토큰 만료 여부 확인
        const isTokenExpired = tokenUtils.isTokenExpired(token);
        
        // 토큰이 만료된 경우에만 재발급 시도
        if (isTokenExpired) {
          try {
            console.log('[StudyService] 토큰 만료됨, 재발급 시도');
            const refreshResponse = await api.get('/auth/reissue');
            const newToken = refreshResponse.headers['authorization'] || refreshResponse.headers['Authorization'];
            
            if (newToken) {
              console.log('[StudyService] 토큰 재발급 성공, 요청 재시도');
              tokenUtils.setToken(newToken);
              
              // 새 토큰으로 요청 재시도
              const retryResponse = await api.post('/studies/add', requestData, {
                headers: {
                  'Authorization': newToken,
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
            // 토큰 재발급 실패 시 로그인 페이지로 리다이렉트
            //window.location.href = '/';
            return { success: false, message: '인증이 만료되었습니다. 다시 로그인해주세요.' };
          }
        } else {
          console.log('[StudyService] 토큰이 유효하지만 권한 문제 발생, 로그아웃 후 재로그인 필요');
          // 토큰이 유효하지만 권한 문제가 있는 경우 로그아웃 처리
          tokenUtils.removeToken(true);
          // 로그인 페이지로 리다이렉트하지 않고 오류 메시지 반환
          return { 
            success: false, 
            message: '권한이 없습니다. 로그아웃 후 다시 로그인해주세요.',
            requireRelogin: true
          };
        }
      }
      
      console.log('[StudyService] 스터디 생성 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('[StudyService] 스터디 생성 오류:', error);
      
      // 인증 오류인 경우 (401, 403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('[StudyService] 인증 오류:', error.response.status);
        // 토큰만 제거하고 리다이렉트는 하지 않음
        tokenUtils.removeToken(true);
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