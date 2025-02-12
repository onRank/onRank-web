import api from './api'

export const authService = {
  // 로그인 상태 확인
  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) return null
    
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      localStorage.removeItem('token')
      return null
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }
} 