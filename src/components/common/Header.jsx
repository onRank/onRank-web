import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import NotificationPopover from './NotificationPopover';

function Header() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/studies');
  };

  const handleLogout = async (e) => {
    // 이벤트 전파 중단 및 기본 동작 방지
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[Header] 로그아웃 버튼 클릭됨');
    
    try {
      console.log('[Header] authService.logout 호출 전');
      await authService.logout();
      console.log('[Header] authService.logout 호출 후');
      
      console.log('[Header] setUser(null) 호출 전');
      setUser(null);
      console.log('[Header] setUser(null) 호출 후');
      
      console.log('[Header] 페이지 이동 전');
      // navigate 대신 window.location 사용
      window.location.href = '/';
      console.log('[Header] 페이지 이동 후 (이 로그는 표시되지 않을 수 있음)');
    } catch (error) {
      console.error('[Header] 로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleProfileClick = () => {
    navigate('/mypage');
  };

  return (
    <header style={{
      width: '100%',
      backgroundColor: '#FFFFFF',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div 
        onClick={handleLogoClick} 
        style={{ 
          cursor: 'pointer',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#337BB8'
        }}
      >
        OnRank
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{
              fontSize: '20px'
            }}>
              🔔
            </span>
          </button>
          {isNotificationOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px'
            }}>
              <NotificationPopover 
                isOpen={isNotificationOpen} 
                onClose={() => setIsNotificationOpen(false)} 
              />
            </div>
          )}
        </div>
        <button
          onClick={handleProfileClick}
          style={{
            padding: '8px 16px',
            borderRadius: '50px',
            border: '1px solid #337BB8',
            color: '#337BB8',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
            marginRight: '8px'
          }}
        >
          내 프로필
        </button>
        <button
          onClick={handleLogout}
          type="button"
          style={{
            padding: '8px 16px',
            borderRadius: '50px',
            border: '1px solid #337BB8',
            color: '#337BB8',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header; 