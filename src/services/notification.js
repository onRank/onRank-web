import { api } from './api';

const notificationService = {
  // 알림 목록 조회 - GET /notifications
  getNotifications: async () => {
    try {
      console.log('[notificationService] 알림 목록 조회 시작');
      
      // 요청 옵션 설정 - CORS 방지를 위한 세부 설정
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true,
        timeout: 10000 // 타임아웃 연장
      };
      
      const response = await api.get('/notifications', config);
      console.log('[notificationService] 알림 목록 조회 성공', response.status);
      return response.data;
    } catch (error) {
      console.error('[notificationService] 알림 조회 실패:', error);
      
      // CORS 또는 네트워크 오류 처리
      if (error.message && error.message.includes('Network Error')) {
        console.warn('[notificationService] 네트워크 에러 감지, 빈 알림 목록 반환');
        return []; // 빈 알림 목록 반환하여 UI가 깨지지 않도록 함
      }
      
      // 인증 오류 처리
      if (error.response && error.response.status === 401) {
        console.warn('[notificationService] 인증 오류 (401), 빈 알림 목록 반환');
        return [];
      }
      
      // 그 외 오류는 빈 배열 반환하여 UI 유지
      return [];
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
      
      // API가 제공하는 특별 헤더와 차별화된 요청 생성
      // PATCH 메소드를 통한 구현에서 리다이렉션과 CORS 이슈 방지
      const response = await api.patch(`/notifications/${notificationId}/read`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': window.location.origin,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
          'Access-Control-Allow-Credentials': 'true'
        },
        withCredentials: true, // 인증 정보 포함
        timeout: 10000, // 타임아웃 연장
        // fetch API와 유사한 동작을 위한 설정
        redirect: 'follow'
      });
      
      console.log(`[notificationService] 알림 읽음 처리 성공: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error('[notificationService] 알림 읽음 처리 실패:', error);
      
      // 특정 에러 패턴 식별 및 fetch API로 대체 시도
      if (error.message && (error.message.includes('Network Error') || error.message.includes('CORS'))) {
        console.warn('[notificationService] 네트워크/CORS 에러 감지. 대체 방식으로 재시도');
        
        try {
          // axios 대신 fetch API로 시도
          console.log('[notificationService] fetch API로 알림 읽음 처리 시도');
          
          const apiBaseUrl = import.meta.env.PROD 
            ? "https://onrank.kr" 
            : import.meta.env.VITE_API_URL || "https://localhost:8080";
            
          const fetchUrl = `${apiBaseUrl}/notifications/${notificationId}/read`;
          
          // 토큰 가져오기
          const token = localStorage.getItem("accessToken");
          const tokenWithBearer = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;
          
          const fetchResponse = await fetch(fetchUrl, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': tokenWithBearer,
              'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include',
            mode: 'cors'
          });
          
          if (fetchResponse.ok) {
            console.log(`[notificationService] fetch API로 알림 읽음 처리 성공: ${fetchResponse.status}`);
            // 성공 응답 반환
            return { success: true };
          } else {
            console.warn(`[notificationService] fetch API 오류 응답: ${fetchResponse.status}`);
          }
        } catch (fetchError) {
          console.error('[notificationService] fetch API 실패:', fetchError);
        }
      }
      
      if (error.response && error.response.status === 401) {
        console.warn('[notificationService] 인증 오류 (401). 로그인 세션이 만료되었을 수 있음');
      }
      
      // UI는 정상적으로 동작하도록 성공 응답 반환
      console.log('[notificationService] UI 목적으로는 읽음 처리로 간주');
      return { success: true };
    }
  }
};

export default notificationService; 