import { api, tokenUtils } from "./api";

export const mypageService = {
  getMyPage: async () => {
    try {
      const token = tokenUtils.getToken();
      const response = await api.get("/auth/mypage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { data: response.data, isTokenBasedInfo: false };
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          // 토큰 재발급 시도
          const response = await api.get("/auth/reissue", {
            withCredentials: true,
          });
          const newToken =
            response.headers["authorization"] ||
            response.headers["Authorization"];
          if (newToken) {
            tokenUtils.setToken(newToken);
            // 재발급 후 다시 요청
            const token = tokenUtils.getToken();
            const userResponse = await api.get("/auth/mypage", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            return { data: userResponse.data, isTokenBasedInfo: false };
          }
        } catch (refreshError) {
          tokenUtils.removeToken();
        }
      }
      throw error;
    }
  },

  editMyPage: async (studentId) => {
    const token = tokenUtils.getToken();
    const response = await api.put(`/auth/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
