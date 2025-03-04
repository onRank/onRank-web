import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  console.error('API URL이 설정되지 않았습니다')
}

// api 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 5000  // 5초 타임아웃 추가
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
  response => response,
  error => {
    if (error.response?.status === 401) {
      // JWT 토큰이 만료된 경우
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      window.location.href = '/'
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
  googleLogin: () => api.post('/auth/login'),
  
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
  getUserInfo: () => api.get('/auth/login/user'),
  
  // 추가 정보 입력
  addUserInfo: (userData) => api.post('/auth/add', userData)
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