import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../services/api';
import logoImage from '../../assets/images/logo.png';
import NotificationPopover from './NotificationPopover';

function Header() {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/studies');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <header style={{
      width: '100%',
      backgroundColor: 'var(--header-bg, #1f2937)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      borderBottom: '1px solid var(--border-color, #374151)'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 max(16px, env(safe-area-inset-left))'
      }}>
        <img
          style={{
            height: '28px',
            cursor: 'pointer',
            objectFit: 'contain'
          }}
          src={logoImage}
          alt="ONRANK"
          onClick={handleLogoClick}
        />
        <div style={{
          display: 'flex',
          gap: '12px',
          position: 'relative'
        }}>
          <button 
            style={{
              padding: '8px 16px',
              backgroundColor: isNotificationOpen ? 'var(--button-active-bg, #4B5563)' : 'var(--button-bg, #374151)',
              color: 'var(--text-primary, #ffffff)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            알림
          </button>
          <NotificationPopover 
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
          <button 
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--button-bg, #374151)',
              color: 'var(--text-primary, #ffffff)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header; 