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
    localStorage.setItem('accessToken', tokenWithBearer)
    console.log('[Token Debug] New token saved to localStorage')
  },
  removeToken: () => {
    console.log('[Token Debug] Removing token from localStorage')
    localStorage.removeItem('accessToken')
  },
  hasToken: () => {
    const hasToken = !!localStorage.getItem('accessToken')
    console.log('[Token Debug] Token exists check:', hasToken)
    return hasToken
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
  (config) => {
    const token = tokenUtils.getToken()
    
    // Log whether token exists for all requests
    if (config.url) {
      console.log(`[API Debug] Processing request to ${config.url}, token exists: ${!!token}`)
    }
    
    if (token) {
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
        window.location.href = '/'
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
    tokenUtils.removeToken()
    window.location.href = '/'
  },

  // 사용자 정보 조회
  getUserInfo: () => {
    return api.get('/auth/login/user')
  }
}

export const studyService = {
  getStudies: async () => {
    const response = await api.get('/studies')
    
    // Log the raw response to understand the data structure
    console.log('[API Debug] Raw studies response:', response.data)
    
    // Transform the data to include creator and participant names if they're missing
    // This assumes the API returns studies without proper name information
    const studiesWithNames = response.data.map(study => {
      // Deep copy to avoid modifying the original response
      const enhancedStudy = { ...study }
      
      // If creator name is missing, add it
      if (!enhancedStudy.creatorName && enhancedStudy.creatorId) {
        // Either fetch from user API or use placeholder
        enhancedStudy.creatorName = '스터디 리더'
      }
      
      // If participant names are missing, add them
      if (enhancedStudy.participants && Array.isArray(enhancedStudy.participants)) {
        enhancedStudy.participants = enhancedStudy.participants.map(participant => {
          if (participant && !participant.name) {
            return { ...participant, name: participant.nickname || '참여자' }
          }
          return participant
        })
      }
      
      // Log the enhanced study for debugging
      console.log('[API Debug] Enhanced study:', enhancedStudy)
      
      return enhancedStudy
    })
    
    return studiesWithNames
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