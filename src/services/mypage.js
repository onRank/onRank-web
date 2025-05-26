import { api, tokenUtils } from "./api";

export const mypageService = {
  getMyPage: async () => {
    const token = tokenUtils.getToken();
    const response = await api.get("/auth/mypage", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  editMyPage: async (mypageData) => {
    const token = tokenUtils.getToken();
    const response = await api.put("/auth/mypage", mypageData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
