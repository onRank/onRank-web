import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  console.error('API URL이 설정되지 않았습니다')
}

// 토큰 관련 유틸리티 함수
export const tokenUtils = {
  getToken: () => localStorage.getItem('accessToken'),
  setToken: (token) => {
    if (!token) return;
    // 이미 저장된 토큰과 같다면 저장하지 않음
    const currentToken = localStorage.getItem('accessToken');
    if (currentToken === token) return;
    
    // Bearer 접두사가 없는 경우에만 추가
    const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    localStorage.setItem('accessToken', tokenWithBearer);
    console.log('New token saved');
  },
  removeToken: () => localStorage.removeItem('accessToken'),
  hasToken: () => !!localStorage.getItem('accessToken')
};

// api 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 5000,
  withCredentials: true,  // CORS 요청에서 쿠키 전송 허용
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken()
    if (token) {
      config.headers['Authorization'] = token
    }

    // CORS 관련 헤더 추가
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    config.headers['Access-Control-Allow-Credentials'] = 'true'

    console.log('Request details:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    })

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
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
      try {
        console.log('토큰 갱신 시도')
        const response = await api.get('/auth/reissue')
        const newToken = response.headers['authorization'] || response.headers['Authorization']
        if (newToken) {
          console.log('새 토큰 발급됨:', newToken)
          tokenUtils.setToken(newToken)
          originalRequest.headers['Authorization'] = newToken
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError)
        tokenUtils.removeToken()
        // 리다이렉트 하지 않고 에러만 반환
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
      console.log('회원정보 등록 시도:', userData)
      const token = tokenUtils.getToken()
      console.log('현재 토큰:', token)
      
      if (!token) {
        console.error('토큰이 없음')
        throw new Error('인증 토큰이 없습니다')
      }

      // 토큰 형식 검증
      if (!token.startsWith('Bearer ')) {
        console.error('토큰 형식이 잘못됨')
        throw new Error('토큰 형식이 올바르지 않습니다')
      }

      console.log('API 요청 전송 중...', {
        url: '/auth/add',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      })

      const response = await api.post('/auth/add', {
        studentName: userData.studentName.trim(),
        studentSchool: userData.studentSchool?.trim() || null,
        studentDepartment: userData.studentDepartment?.trim() || null,
        studentPhoneNumber: userData.studentPhoneNumber.trim()
      })

      console.log('회원정보 등록 응답:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      })

      if (response.status === 200 || response.status === 201) {
        console.log('회원정보 등록 성공')
        return response.data
      }

      return response.data
    } catch (error) {
      console.error('회원정보 등록 실패:', error)
      // 에러를 그대로 전파하여 컴포넌트에서 처리하도록 함
      throw error
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await api.post('/auth/logout')
      tokenUtils.removeToken()
      // 로그아웃 성공 시에만 리다이렉트
      window.location.href = '/'
    } catch (error) {
      console.error('로그아웃 실패:', error)
      // 로그아웃 실패 시에는 리다이렉트하지 않고 에러만 전파
      throw error
    }
  },

  // 사용자 정보 조회
  getUserInfo: () => {
    return api.get('/auth/login/user')
  }
}

export const studyService = {
  getStudies: async () => {
    const response = await api.get('/studies')
    return response.data
  },
  createStudy: async (studyData) => {
    const response = await api.post('/studies', studyData)
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
      const response = await api.post(`/studies/${numericStudyId}/notices/add`, noticeData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('스터디를 찾을 수 없습니다.');
      }
      throw error;
    }
  }
}