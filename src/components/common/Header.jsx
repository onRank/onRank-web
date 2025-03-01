import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../services/api';
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
          onClick={handleLogout}
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