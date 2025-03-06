import { useNavigate, useLocation } from 'react-router-dom';
import { IoBookOutline, IoSearchOutline, IoCalendarOutline, IoPersonOutline } from 'react-icons/io5';

function MainNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      id: 'studies', 
      label: '스터디', 
      icon: IoBookOutline,
      path: '/studies'
    },
    { 
      id: 'create-join', 
      label: '스터디 생성', 
      icon: IoSearchOutline,
      path: '/studies/create'
    },
    { 
      id: 'calendar', 
      label: '캘린더', 
      icon: IoCalendarOutline,
      path: '/calendar'
    },
    { 
      id: 'mypage', 
      label: '마이페이지', 
      icon: IoPersonOutline,
      path: '/mypage'
    },
  ];

  const isActive = (path) => {
    if (path === '/studies') {
      return location.pathname === '/studies';
    }
    return location.pathname === path;
  };

  return (
    <nav style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      gap: '4rem',
      padding: '1rem',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E5E5'
    }}>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              color: isActive(item.path) ? '#FF0000' : '#666666',
              fontSize: '12px',
              transition: 'all 0.2s ease',
              padding: '0.5rem'
            }}
          >
            <Icon size={24} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default MainNavigation; 