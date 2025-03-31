// 토큰 관리를 위한 유틸리티 함수들
export const tokenUtils = {
  // 토큰 저장
  setToken: (token) => {
    if (token) {
      localStorage.setItem('accessToken', token);
    }
  },

  // 토큰 가져오기
  getToken: () => {
    return localStorage.getItem('accessToken');
  },

  // 토큰 제거
  removeToken: (redirectToLogin = false) => {
    localStorage.removeItem('accessToken');
    if (redirectToLogin) {
      window.location.href = '/login';
    }
  },

  // 토큰 유효성 검사
  isTokenValid: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      // JWT 토큰 디코딩
      const payload = JSON.parse(atob(token.split('.')[1]));
      // 만료 시간 확인
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      return false;
    }
  }
}; 