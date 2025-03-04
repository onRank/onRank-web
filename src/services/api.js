import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  console.error('API URL이 설정되지 않았습니다')
}

// 토큰 관련 유틸리티 함수
export const tokenUtils = {
  getToken: () => {
    const token = localStorage.getItem('accessToken')
    console.log('[Token Debug] Retrieved token from localStorage:', token ? 'exists' : 'not found')
    return token
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
    
    try {
      // 토큰 저장
      localStorage.setItem('accessToken', tokenWithBearer)
      console.log('[Token Debug] New token saved to localStorage')
      
      // 백업 저장 - 페이지 새로고침 시에도 유지
      sessionStorage.setItem('temp_token', tokenWithBearer)
      sessionStorage.setItem('accessTokenBackup', tokenWithBearer)
      
      // 전역 변수에도 임시 저장 (메모리 내 백업)
      window.tempAuthToken = tokenWithBearer
      
      // 토큰 저장 후 이벤트 발행
      const postStorageEvent = new Event('post-tokensave')
      window.dispatchEvent(postStorageEvent)
      
      return tokenWithBearer
    } catch (error) {
      console.error('[Token Debug] Error saving token:', error)
      
      // localStorage 저장 실패 시 sessionStorage에 시도
      try {
        sessionStorage.setItem('temp_token', tokenWithBearer)
        sessionStorage.setItem('accessTokenBackup', tokenWithBearer)
        window.tempAuthToken = tokenWithBearer
        console.log('[Token Debug] Token saved to backup storage after localStorage failure')
      } catch (sessionError) {
        console.error('[Token Debug] Complete storage failure:', sessionError)
      }
      
      return null
    }
  },
  removeToken: (force = false) => {
    console.log('[Token Debug] Removing token from localStorage')
    localStorage.removeItem('accessToken')
    
    // force가 true인 경우 백업 토큰도 함께 제거
    if (force) {
      console.log('[Token Debug] Force mode: removing backup tokens too')
      sessionStorage.removeItem('temp_token')
      sessionStorage.removeItem('accessTokenBackup')
      if (window.tempAuthToken) {
        window.tempAuthToken = null
      }
    }
  },
  hasToken: () => {
    const hasToken = !!localStorage.getItem('accessToken')
    console.log('[Token Debug] Token exists check:', hasToken)
    return hasToken
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
  // 토큰이 저장될 때까지 기다리는 함수
  waitForToken: async (timeout = 1000) => {
    console.log('[Token Debug] Waiting for token to be available...')
    // 먼저 localStorage에서 확인
    const token = localStorage.getItem('accessToken')
    if (token) {
      console.log('[Token Debug] Token already available in localStorage')
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
        const newToken = localStorage.getItem('accessToken')
        console.log('[Token Debug] Token became available')
        resolve(newToken)
      }
      
      window.addEventListener('post-tokensave', tokenHandler, { once: true })
    })
  }
};

// api 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 5000,
  withCredentials: true,  // CORS 요청에서 쿠키 전송 허용
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // CORS 설정 추가
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
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
      config.headers['Access-Control-Allow-Headers'] = 'Authorization'  // CORS 헤더 추가
      console.log(`[API Debug] Added Authorization header to request: ${config.url}`)
      
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
      headers: config.headers,
      data: config.data
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
            const tokenWithBearer = newToken.startsWith('Bearer ') ? newToken : `Bearer ${newToken}`
            localStorage.setItem('accessToken', tokenWithBearer)
            console.log('[Auth] Direct token save attempt completed')
            
            // 저장 확인
            const finalCheck = localStorage.getItem('accessToken')
            if (finalCheck) {
              console.log('[Auth] Token confirmed after direct save')
            } else {
              console.error('[Auth] Token still not saved after direct attempt')
              
              // 세션 스토리지에 백업
              sessionStorage.setItem('temp_token', tokenWithBearer)
              console.log('[Auth] Token backed up to sessionStorage as last resort')
              
              // 전역 변수에 백업 (극단적인 대비책)
              window.tempAuthToken = tokenWithBearer
              console.log('[Auth] Token backed up to window.tempAuthToken as emergency measure')
            }
          } catch (storageError) {
            console.error('[Auth] Error during direct token save:', storageError)
            
            // 세션 스토리지에 백업
            try {
              const tokenWithBearer = newToken.startsWith('Bearer ') ? newToken : `Bearer ${newToken}`
              sessionStorage.setItem('temp_token', tokenWithBearer)
              console.log('[Auth] Token backed up to sessionStorage after localStorage failure')
              
              // 전역 변수에 백업 (극단적인 대비책)
              window.tempAuthToken = tokenWithBearer
              console.log('[Auth] Token backed up to window.tempAuthToken as emergency measure')
            } catch (backupError) {
              console.error('[Auth] Complete failure to save token anywhere:', backupError)
            }
          }
        }
      }
      
      return response  // 전체 response 객체 반환
    } catch (error) {
      console.error('[Auth] 회원정보 등록 실패:', error)
      
      if (error.response?.status === 401) {
        tokenUtils.removeToken()
        throw new Error('인증이 만료되었습니다')
      }
      
      if (error.message === 'Network Error') {
        throw new Error('서버와 통신할 수 없습니다')
      }

      throw error
    }
  },

  // 로그아웃
  logout: () => {
    console.log('[Auth] 로그아웃 - 토큰 삭제')
    tokenUtils.removeToken(true) // force=true로 모든 백업 토큰도 제거
    
    // 사용자 정보 캐시 제거
    sessionStorage.removeItem('cachedUserInfo')
    
    window.location.href = '/'
  },

  // 사용자 정보 조회
  getUserInfo: () => {
    return api.get('/auth/login/user')
  }
}

export const studyService = {
  getStudies: async (retryCount = 0) => {
    try {
      // 토큰이 있는지 확인하고, 없으면 가능한 경우 토큰이 저장될 때까지 기다림
      let token = null;
      try {
        token = tokenUtils.getToken() || await tokenUtils.waitForToken(800)
        console.log('[Studies API] Token for studies API call:', token ? 'available' : 'not available')
      } catch (tokenError) {
        console.warn('[Studies API] Proceeding without waiting for token:', tokenError.message)
      }
      
      // 토큰이 없으면 백업 소스에서도 확인
      if (!token) {
        const tempToken = sessionStorage.getItem('temp_token') || 
                          sessionStorage.getItem('accessTokenBackup') || 
                          window.tempAuthToken
        if (tempToken) {
          console.log('[Studies API] Found token in backup storage, using it')
          localStorage.setItem('accessToken', tempToken)
          token = tempToken
        } else {
          console.warn('[Studies API] No token available, attempting to proceed anyway')
        }
      }
      
      // 명시적으로 헤더에 토큰 추가
      const headers = {};
      if (token) {
        const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers['Authorization'] = tokenWithBearer;
        console.log('[Studies API] Explicitly including token in request headers')
      } else {
        console.warn('[Studies API] No token available for request to /studies')
      }
      
      try {
        const response = await api.get('/studies', { headers })
        console.log('[Studies API] Studies fetched successfully:', response.data)
        return response.data
      } catch (error) {
        // 401 오류이고 아직 최대 재시도 횟수에 도달하지 않은 경우 재시도
        if (error.response?.status === 401 && retryCount < 3) {
          console.log(`[Studies API] 인증 오류, ${retryCount + 1}번째 재시도 중...`)
          
          // 재시도 간격을 점진적으로 늘림 (300ms, 600ms, 900ms)
          const delay = 300 * (retryCount + 1)
          await new Promise(resolve => setTimeout(resolve, delay))
          
          // 토큰 재확인 및 갱신 시도
          try {
            // 토큰 재발급 시도
            console.log('[Studies API] 토큰 재발급 시도 중...')
            await api.get('/auth/reissue').catch(e => {
              console.log('[Studies API] 토큰 재발급 실패:', e.message)
            })
          } catch (refreshError) {
            console.log('[Studies API] 토큰 재발급 중 오류:', refreshError.message)
          }
          
          // 토큰 재확인
          const refreshedToken = localStorage.getItem('accessToken')
          if (refreshedToken) {
            console.log('[Studies API] 재시도 전 새 토큰 발견:', refreshedToken.substring(0, 15) + '...')
          }
          
          return studyService.getStudies(retryCount + 1)
        } else if (error.message === 'Network Error' && retryCount < 2) {
          // 네트워크 오류의 경우 짧은 지연 후 재시도
          console.log(`[Studies API] 네트워크 오류, ${retryCount + 1}번째 재시도 중...`)
          const delay = 500 * (retryCount + 1)
          await new Promise(resolve => setTimeout(resolve, delay))
          return studyService.getStudies(retryCount + 1)
        }
        
        throw error
      }
    } catch (error) {
      console.error('[Studies API] Error fetching studies:', error)
      throw error
    }
  },
  createStudy: async (studyData) => {
    // 명시적으로 토큰 추가
    const token = tokenUtils.getToken();
    const headers = {};
    
    if (token) {
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers['Authorization'] = tokenWithBearer;
      console.log('[Study] Including token in createStudy request:', tokenWithBearer)
    } else {
      console.warn('[Study] No token found for createStudy request')
    }
    
    const response = await api.post('/studies', studyData, { headers })
    return response.data
  },
  getNotices: async (studyId) => {
    const numericStudyId = parseInt(studyId, 10);
    if (isNaN(numericStudyId)) {
      throw new Error('스터디 ID가 유효하지 않습니다.');
    }
    try {
      const response = await api.get(`/studies/${numericStudyId}/notices`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('스터디를 찾을 수 없습니다.');
      }
      throw error;
    }
  },
  getNoticeDetail: async (studyId, noticeId) => {
    const numericStudyId = parseInt(studyId, 10);
    const numericNoticeId = parseInt(noticeId, 10);
    if (isNaN(numericStudyId) || isNaN(numericNoticeId)) {
      throw new Error('스터디 ID 또는 공지사항 ID가 유효하지 않습니다.');
    }
    try {
      const response = await api.get(`/studies/${numericStudyId}/notices/${numericNoticeId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('공지사항을 찾을 수 없습니다.');
      }
      throw error;
    }
  },
  addNotice: async (studyId, noticeData) => {
    const numericStudyId = parseInt(studyId, 10);
    if (isNaN(numericStudyId)) {
      throw new Error('스터디 ID가 유효하지 않습니다.');
    }
    try {
      // 명시적으로 토큰 추가
      const token = tokenUtils.getToken();
      const headers = {};
      
      if (token) {
        const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers['Authorization'] = tokenWithBearer;
        console.log('[Study] Including token in addNotice request:', tokenWithBearer)
      } else {
        console.warn('[Study] No token found for addNotice request')
      }
      
      const response = await api.post(`/studies/${numericStudyId}/notices/add`, noticeData, { headers });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('스터디를 찾을 수 없습니다.');
      }
      throw error;
    }
  }
}