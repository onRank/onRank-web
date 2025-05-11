import { api } from './api';

const notificationService = {
  // 알림 목록 조회 - GET /notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications', {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('[notificationService] 알림 조회 실패:', error);
      throw error;
    }
  },

  // 알림 읽음 처리 - PATCH /notifications/{notificationId}/read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('[notificationService] 알림 읽음 처리 실패:', error);
      throw error;
    }
  }
};

export default notificationService; 