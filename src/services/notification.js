import { api } from './api';

const notificationService = {
  // 알림 목록 조회 - GET /notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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
      console.log(`[notificationService] 알림 읽음 처리 시작: ID ${notificationId}`);
      
      // 유효성 검사
      if (!notificationId) {
        console.error('[notificationService] 유효하지 않은 notificationId:', notificationId);
        throw new Error('알림 ID가 유효하지 않습니다.');
      }
      
      // 백엔드 API 명세에 따라 PATCH 요청 사용
      const response = await api.patch(`/notifications/${notificationId}/read`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true
      });
      
      console.log(`[notificationService] 알림 읽음 처리 성공:`, response.status);
      return response.data;
    } catch (error) {
      console.error('[notificationService] 알림 읽음 처리 실패:', error);
      
      // 오류가 있어도 UI에서는 읽음 처리된 것처럼 표시하기 위해 성공으로 가정
      console.log('[notificationService] UI 목적으로는 읽음 처리로 간주');
      return { success: true };
    }
  }
};

export default notificationService; 