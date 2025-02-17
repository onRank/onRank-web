import axios from 'axios'

// api를 named export로 변경
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // 실제 API URL 사용
  withCredentials: true  // 쿠키 자동 전송
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

// 응답 인터셉터 개선
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await authService.reissueToken()  // POST /auth/reissue-token 사용 확인
        return api(error.config)
      } catch (refreshError) {
        window.location.href = '/'
      }
    } else if (error.response?.status === 403) {
      // 권한 없음
      alert('접근 권한이 없습니다.')
    } else if (error.response?.status === 404) {
      // 리소스 없음
      console.error('요청한 리소스를 찾을 수 없습니다.')
    } else if (error.response?.status >= 500) {
      // 서버 에러
      alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // POST /auth/login
  googleLogin: () => api.post('/auth/login'),
  
  // POST /auth/add
  addUserInfo: (userData) => api.post('/auth/add', userData),
  
  // POST /auth/logout
  logout: () => api.post('/auth/logout'),
  
  // POST /auth/reissue-token
  reissueToken: () => api.post('/auth/reissue-token'),
  
  // GET /auth/login/user
  getUserInfo: () => api.get('/auth/login/user'),
  
  // PATCH /auth/update
  updateUserInfo: (userData) => api.patch('/auth/update', userData)
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
  // 필요한 다른 스터디 관련 API 호출 추가
}