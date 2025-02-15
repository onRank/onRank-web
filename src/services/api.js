import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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
        // PATCH /reissue-token 호출
        const response = await authService.reissueToken()
        const newToken = response.data.token
        localStorage.setItem('token', newToken)
        
        // 실패했던 요청 재시도
        const originalRequest = error.config
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // 리프레시 실패시 로그아웃
        localStorage.removeItem('token')
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
  // POST /oauth - 구글 소셜 로그인
  googleLogin: () => api.post('/oauth'),
  
  // POST /oauth/add - 회원 정보 입력
  addUserInfo: (userData) => api.post('/oauth/add', userData),
  
  // POST /logout - 로그아웃
  logout: () => api.post('/logout'),
  
  // PATCH /reissue-token - 토큰 리프레시
  reissueToken: () => api.patch('/reissue-token')
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

export default api 