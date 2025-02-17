import axios from 'axios'

// MSW 활성화 여부 확인
const isMswEnabled = import.meta.env.VITE_MSW_ENABLED === 'true';

// MSW 초기화 (development 환경에서만)
if (isMswEnabled && process.env.NODE_ENV === 'development') {
  // worker가 이미 시작되었는지 확인
  if (!window.msw) {
    (async () => {
      const { worker } = await import('../mocks/browser');
      worker.start();
      window.msw = true;  // worker 시작 표시
    })();
  }
}

// api를 named export로 변경
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // 실제 API URL 사용
  withCredentials: true  // 쿠키 자동 전송 설정 (중요!)
})

// 토큰은 쿠키에 있으므로 인터셉터에서 헤더 추가 불필요
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터에서 토큰 관련 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // 토큰 만료시 재발급 시도
        await authService.reissueToken()
        // 토큰 재발급 성공시 실패했던 요청 재시도
        return api(error.config)
      } catch (refreshError) {
        // 토큰 재발급 실패시 로그인 페이지로
        window.location.href = '/'
      }
    } else if (error.response?.status === 403) {
      // 권한 없음
      alert('접근 권한이 없습니다.')
    } else if (error.response?.status >= 500) {
      // 서버 에러
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