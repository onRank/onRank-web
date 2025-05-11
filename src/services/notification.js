import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const notificationService = {
  // 알림 목록 조회
  getNotifications: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`);
      return response.data;
    } catch (error) {
      console.error('[notificationService] 알림 조회 실패:', error);
      throw error;
    }
  },

  // 알림 읽음 처리
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('[notificationService] 알림 읽음 처리 실패:', error);
      throw error;
    }
  }
};

export default notificationService; 