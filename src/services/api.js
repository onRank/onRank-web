import axios from 'axios'

// api 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await authService.reissueToken()
        return api(error.config)
      } catch (refreshError) {
        window.location.href = '/'
      }
    } else if (error.response?.status === 403) {
      alert('접근 권한이 없습니다.')
    } else if (error.response?.status >= 500) {
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // 구글 로그인
  googleLogin: async () => {
    console.log('[API] 구글 로그인 요청')
    try {
      const response = await api.post('/auth/login')
      console.log('[API] 구글 로그인 응답:', response.data)
      return response
    } catch (error) {
      console.error('[API] 구글 로그인 에러:', error.response?.data || error.message)
      throw error
    }
  },
  
  // 토큰 재발급
  reissueToken: () => api.post('/auth/reissue-token'),
  
  // 로그아웃 (서버에서 쿠키 제거)
  logout: async () => {
    const response = await api.post('/auth/logout')
    // 로그아웃 성공시 홈으로 리다이렉트
    if (response.status === 200) {
      window.location.href = '/'
    }
    return response
  },

  // 사용자 정보 조회
  getUserInfo: async () => {
    console.log('[API] 사용자 정보 조회 요청')
    try {
      const response = await api.get('/auth/login/user')
      console.log('[API] 사용자 정보:', response.data)
      return response.data
    } catch (error) {
      console.error('[API] 사용자 정보 조회 실패:', error.response?.data || error.message)
      throw error
    }
  },
  
  // 추가 정보 입력
  addUserInfo: async (userData) => {
    console.log('[API] 사용자 추가 정보 입력:', userData)
    try {
      const response = await api.post('/auth/add', userData)
      console.log('[API] 추가 정보 입력 성공:', response.data)
      return response.data
    } catch (error) {
      console.error('[API] 추가 정보 입력 실패:', error.response?.data || error.message)
      throw error
    }
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
      // MSW가 활성화되어 있으면 mock 응답을, 아니면 실제 API 응답을 사용
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
      // MSW가 활성화되어 있으면 mock 응답을, 아니면 실제 API 응답을 사용
      const response = await api.get(`/studies/${numericStudyId}/notices/${numericNoticeId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('공지사항을 찾을 수 없습니다.');
      }
      throw error;
    }
  }
}