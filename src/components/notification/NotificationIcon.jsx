import React, { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import NotificationList from './NotificationList';
import notificationService from '../../services/notification';
import './NotificationStyles.css';

/**
 * 알림 아이콘 컴포넌트
 * - 읽지 않은 알림 개수를 뱃지로 표시
 * - 클릭 시 알림 목록 표시/숨김
 */
const NotificationIcon = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // 읽지 않은 알림 개수 조회
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getNotifications();
      const count = (data || []).filter(notification => !notification.read).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('알림 개수 조회 실패:', err);
    }
  };

  // 컴포넌트 마운트 시 + 5분마다 알림 개수 조회
  useEffect(() => {
    fetchUnreadCount(); // 초기 로딩
    
    // 5분(300,000ms) 간격으로 폴링
    const pollingInterval = setInterval(() => {
      fetchUnreadCount();
    }, 300000);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(pollingInterval);
  }, []);

  // 알림 아이콘 클릭 이벤트
  const handleIconClick = () => {
    setShowNotifications(!showNotifications);
  };

  // 외부 클릭 시 알림 목록 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 알림 읽음 처리 콜백
  const handleNotificationRead = () => {
    setUnreadCount(prevCount => Math.max(0, prevCount - 1));
  };

  // 알림 목록 닫기 함수
  const handleClose = () => {
    setShowNotifications(false);
  };

  return (
    <div className="notification-icon-container" ref={notificationRef}>
      <div className="notification-icon" onClick={handleIconClick}>
        <FiBell size={20} />
        {unreadCount > 0 && (
          <div className="notification-badge">{unreadCount}</div>
        )}
      </div>
      
      {showNotifications && (
        <div className="notification-dropdown">
          <NotificationList onClose={handleClose} onNotificationRead={handleNotificationRead} />
        </div>
      )}
    </div>
  );
};

export default NotificationIcon; 