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
      path: '/studies',
      onClick: () => navigate('/studies') 
    },
    { 
      id: 'create-join', 
      label: '생성/참여', 
      icon: IoSearchOutline,
      path: '/create',
      onClick: () => navigate('/create')
    },
    { 
      id: 'calendar', 
      label: '캘린더', 
      icon: IoCalendarOutline,
      path: '/calendar',
      onClick: () => navigate('/calendar')
    },
    { 
      id: 'mypage', 
      label: '마이페이지', 
      icon: IoPersonOutline,
      path: '/mypage',
      onClick: () => navigate('/mypage')
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      gap: '4rem',
      padding: '1.5rem',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E5E5'
    }}>
      {menuItems.map((item) => {
        const active = isActive(item.path);
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              color: active ? '#FF0000' : '#666666',
              fontSize: '14px'
            }}
          >
            <Icon 
              style={{
                fontSize: '24px'
              }}
              color={active ? '#FF0000' : '#666666'}
            />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default MainNavigation; 