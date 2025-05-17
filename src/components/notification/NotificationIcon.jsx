import React, { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import NotificationList from './NotificationList';
import notificationService from '../../services/notification';
import './NotificationStyles.css';
import { createPortal } from 'react-dom';

/**
 * 알림 드롭다운 컴포넌트 - Portal 사용
 */
const NotificationDropdown = ({ show, onClose, onNotificationRead, anchorRect }) => {
  if (!show) return null;
  
  // 드롭다운 위치 계산
  const dropdownStyle = {
    position: 'fixed',
    top: anchorRect ? `${anchorRect.bottom}px` : '60px',
    right: anchorRect ? `${window.innerWidth - anchorRect.right}px` : '20px',
    zIndex: 2147483647, // 최대 z-index
  };

  return createPortal(
    <div className="notification-dropdown" style={dropdownStyle}>
      <NotificationList onClose={onClose} onNotificationRead={onNotificationRead} />
    </div>,
    document.body
  );
};

/**
 * 알림 아이콘 컴포넌트
 * - 읽지 않은 알림 개수를 뱃지로 표시
 * - 클릭 시 알림 목록 표시/숨김
 */
const NotificationIcon = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorRect, setAnchorRect] = useState(null);
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
    if (notificationRef.current) {
      // 아이콘의 위치 정보 저장 (드롭다운 포지셔닝용)
      setAnchorRect(notificationRef.current.getBoundingClientRect());
    }
    setShowNotifications(!showNotifications);
  };

  // 외부 클릭 시 알림 목록 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Portal을 사용하므로 단순 ref 검사로는 동작하지 않음
      // 대신 클래스로 확인하거나 데이터 속성 사용
      const isNotificationDropdown = event.target.closest('.notification-dropdown');
      const isNotificationIcon = notificationRef.current && notificationRef.current.contains(event.target);
      
      if (showNotifications && !isNotificationDropdown && !isNotificationIcon) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // 알림 읽음 처리 콜백
  const handleNotificationRead = () => {
    setUnreadCount(prevCount => Math.max(0, prevCount - 1));
  };

  // 알림 목록 닫기 함수
  const handleClose = () => {
    setShowNotifications(false);
  };

  return (
    <>
      <div className="notification-icon-container" ref={notificationRef}>
        <div className="notification-icon" onClick={handleIconClick}>
          <FiBell size={20} />
          {unreadCount > 0 && (
            <div className="notification-badge">{unreadCount}</div>
          )}
        </div>
      </div>
      
      <NotificationDropdown 
        show={showNotifications}
        onClose={handleClose}
        onNotificationRead={handleNotificationRead}
        anchorRect={anchorRect}
      />
    </>
  );
};

export default NotificationIcon; 