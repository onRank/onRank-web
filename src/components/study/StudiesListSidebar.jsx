import { useNavigate } from 'react-router-dom';

function MainNavigation() {
  const navigate = useNavigate();

  const menuItems = [
    { 
      id: 'studies', 
      label: '스터디', 
      icon: '📚',
      onClick: () => navigate('/studies') 
    },
    { 
      id: 'create-join', 
      label: '생성/참여', 
      icon: '🔍',
      onClick: () => {} 
    },
    { 
      id: 'calendar', 
      label: '캘린더', 
      icon: '📅',
      onClick: () => {} 
    },
    { 
      id: 'mypage', 
      label: '마이페이지', 
      icon: '👤',
      onClick: () => {} 
    },
  ];

  return (
    <nav style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      gap: '4rem',
      padding: '1.5rem',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #ABB1B3'
    }}>
      {menuItems.map((item) => (
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
            cursor: 'pointer',
            color: item.id === 'studies' ? '#337BB8' : '#000000',
            fontSize: '14px'
          }}
        >
          <span style={{ fontSize: '24px' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default MainNavigation; 