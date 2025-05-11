import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notification';
import './NotificationStyles.css';

/**
 * 알림 목록 컴포넌트
 * - 초기 로딩 시 + 5분 간격으로 알림 목록 조회
 * - 읽지 않은 알림은 강조 표시
 * - 알림 클릭 시 읽음 처리 후 관련 URL로 이동
 */
const NotificationList = ({ onClose }) => {
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
      
      // 서버에 읽음 상태 업데이트 요청
      try {
        await notificationService.markAsRead(notification.notificationId);
      } catch (err) {
        console.error('알림 읽음 처리 실패:', err);
        // 실패 시 원상복구 (선택적)
        // setNotifications(notifications);
      }
    }
    
    // 알림 관련 URL로 이동
    if (notification.relatedUrl) {
      onClose(); // 알림 목록 닫기
      navigate(notification.relatedUrl);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notification-list-container">
      <div className="notification-header">
        <h3>알림</h3>
        {notifications.length > 0 && (
          <div className="notification-count">
            읽지 않은 알림: <span>{notifications.filter(n => !n.read).length}</span>
          </div>
        )}
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
            <div className="notification-content">
              <div className="notification-title">
                [{notification.notificationCategory}] {notification.notificationTitle}
              </div>
              <div className="notification-message">
                {notification.notificationMessage}
              </div>
              <div className="notification-meta">
                <span className="notification-study">{notification.studyName}</span>
                <span className="notification-date">
                  {formatDate(notification.notificationCreatedAt)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList; 