import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notification';
import { DEFAULT_IMAGE_SVG, handleImageError } from '../../utils/imageUtils';
import './NotificationStyles.css';
import PropTypes from 'prop-types';

/**
 * 알림 목록 컴포넌트
 * API 스키마:
 * - notificationId: 알림 ID (int64)
 * - notificationCategory: 알림 카테고리 (string, ex: "NOTICE")
 * - studyName: 스터디 이름 (string)
 * - studyImageUrl: 스터디 이미지 URL (string)
 * - notificationTitle: 알림 제목 (string)
 * - notificationContent: 알림 내용 (string)
 * - relatedUrl: 관련 URL (string)
 * - read: 읽음 여부 (boolean)
 * - notificationCreatedAt: 생성 시각 (date-time)
 */
const NotificationList = ({ onClose, onNotificationRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 알림 조회 함수
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
      setError(null);
    } catch (err) {
      console.error('알림 조회 실패:', err);
      setError('알림을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 + 5분마다 알림 조회
  useEffect(() => {
    fetchNotifications(); // 초기 로딩
    
    // 5분(300,000ms) 간격으로 폴링
    const pollingInterval = setInterval(() => {
      fetchNotifications();
    }, 300000);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(pollingInterval);
  }, []);

  // 알림 클릭 처리 (Optimistic Update + 라우팅)
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      // Optimistic Update - UI 즉시 업데이트
      const updatedNotifications = notifications.map(item => 
        item.notificationId === notification.notificationId 
          ? { ...item, read: true } 
          : item
      );
      setNotifications(updatedNotifications);
      
      // 알림 카운터 업데이트를 위한 콜백 호출
      if (onNotificationRead) {
        onNotificationRead();
      }
      
      // 서버에 읽음 상태 업데이트 요청
      try {
        console.log(`알림 읽음 처리 요청: ${notification.notificationId}`);
        await notificationService.markAsRead(notification.notificationId);
        console.log(`알림 읽음 처리 성공: ${notification.notificationId}`);
      } catch (err) {
        console.error('알림 읽음 처리 실패:', err);
        
        // CORS나 네트워크 오류 시 native fetch로 직접 다시 시도
        if (err.message && (err.message.includes('Network Error') || err.message.includes('CORS'))) {
          try {
            console.log('fetch API로 직접 시도');
            const apiBaseUrl = import.meta.env.VITE_API_URL;

            const fetchUrl = `${apiBaseUrl}/notifications/${notification.notificationId}/read`;
            
            // 쿠키 포함 및 CORS 모드 설정
            await fetch(fetchUrl, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              credentials: 'include',
              mode: 'cors'
            });
            console.log('fetch API로 읽음 처리 성공');
          } catch (fetchErr) {
            console.error('fetch API 시도도 실패:', fetchErr);
            // 에러가 있어도 UI는 이미 업데이트되었으므로 사용자 경험에 영향 없음
          }
        }
        
        // 에러가 있어도 UI는 이미 업데이트되었으므로 사용자 경험에 영향 없음
        // 로컬 UI 상태만 유지하고 계속 진행
      }
    }
    
    // 알림 관련 URL로 이동
    if (notification.relatedUrl) {
      console.log(`알림 관련 URL로 이동: ${notification.relatedUrl}`);
      onClose(); // 알림 목록 닫기
      navigate(notification.relatedUrl);
    } else {
      console.log('이동할 relatedUrl이 없는 알림입니다.');
    }
  };

  // 카테고리 이름 변환 및 색상 정보
  const getCategoryInfo = (category) => {
    const categoryMap = {
      'NOTICE': { name: '공지', color: '#3498db', bgColor: '#e3f2fd' },
      'SCHEDULE': { name: '일정', color: '#9c27b0', bgColor: '#f3e5f5' },
      'ASSIGNMENT': { name: '과제', color: '#ff9800', bgColor: '#fff3e0' },
      'ATTENDANCE': { name: '출석', color: '#4caf50', bgColor: '#e8f5e9' },
      'MEMBER': { name: '멤버', color: '#607d8b', bgColor: '#eceff1' },
      'STUDY': { name: '스터디', color: '#e91e63', bgColor: '#fce4ec' },
      'POST': { name: '게시글', color: '#795548', bgColor: '#efebe9' },
    };
    
    return categoryMap[category] || { name: category, color: '#757575', bgColor: '#f5f5f5' };
  };

  // 날짜 표시 함수 - 24시간 이내 생성된 알림은 'XX시간 XX분 전' 형식으로 표시
  const formatDate = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffTime = Math.abs(now - notificationDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays < 1) {
      if (diffHours < 1) {
        return `${diffMinutes}분 전`;
      } else {
        const remainingMinutes = diffMinutes % 60;
        return remainingMinutes > 0 
          ? `${diffHours}시간 ${remainingMinutes}분 전` 
          : `${diffHours}시간 전`;
      }
    } else {
      return notificationDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="notification-list-container">
      <div className="notification-header">
        <h3>알림</h3>
      </div>

      {loading && <div className="notification-loading">알림을 불러오는 중...</div>}
      
      {error && <div className="notification-error">{error}</div>}
      
      {!loading && notifications.length === 0 && (
        <div className="notification-empty">새로운 알림이 없습니다.</div>
      )}
      
      <ul className="notification-items">
        {notifications.map((notification) => (
          <li 
            key={notification.notificationId}
            className={`notification-item ${!notification.read ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            {!notification.read && (
              <div className="notification-unread-dot"></div>
            )}
            {notification.studyImageUrl && (
              <div className="notification-image">
                <img 
                  src={notification.studyImageUrl || DEFAULT_IMAGE_SVG}
                  alt={notification.studyName || '스터디 이미지'} 
                  onError={(e) => handleImageError(e, notification.studyImageUrl)}
                />
              </div>
            )}
            <div className="notification-content">
              <div className="notification-study-name">
                {notification.studyName}
              </div>
              <div className="notification-title">
                {notification.notificationCategory && (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      marginRight: '6px',
                      color: getCategoryInfo(notification.notificationCategory).color,
                      backgroundColor: getCategoryInfo(notification.notificationCategory).bgColor,
                      border: `1px solid ${getCategoryInfo(notification.notificationCategory).color}`,
                    }}
                  >
                    {getCategoryInfo(notification.notificationCategory).name}
                  </span>
                )}
                {notification.notificationTitle}
              </div>
              <div className="notification-body">
                {notification.notificationContent}
              </div>
              <div className="notification-time">
                {formatDate(notification.notificationCreatedAt)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

NotificationList.propTypes = {
  onClose: PropTypes.func.isRequired,
  onNotificationRead: PropTypes.func
};

export default NotificationList;