import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  console.error('API URL이 설정되지 않았습니다')
}

// api 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 쿠키 포함
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      // 이미 Bearer 형식으로 저장되어 있으므로 그대로 사용
      config.headers.Authorization = accessToken
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // 토큰 재발급 요청
        const response = await fetch('http://localhost:8080/auth/reissue', {
          method: 'POST',
          credentials: 'include', // 쿠키 포함
        })
        
        if (!response.ok) throw new Error('Token reissue failed')
        
        const newAccessToken = response.headers.get('Authorization')
        if (newAccessToken) {
          // Bearer 형식 그대로 저장
          localStorage.setItem('accessToken', newAccessToken)
          // 원래 요청 재시도
          error.config.headers.Authorization = newAccessToken
          return api(error.config)
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
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
      const response = await api.post('/auth/add', {
        studentName: userData.studentName,
        studentSchool: userData.studentSchool || null,
        studentDepartment: userData.studentDepartment || null,
        studentPhoneNumber: userData.studentPhoneNumber
      })
      return response.data
    } catch (error) {
      console.error('회원정보 등록 실패:', error)
      throw error
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('accessToken')
      window.location.href = '/'
    } catch (error) {
      console.error('로그아웃 실패:', error)
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