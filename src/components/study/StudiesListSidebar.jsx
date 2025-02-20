import { useNavigate } from 'react-router-dom';

function StudiesListSidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'studies', label: '스터디', onClick: () => navigate('/studies') },
    { id: 'life-study', label: '생성/참여', onClick: () => {} },
    { id: 'calendar', label: '캘린더', onClick: () => {} },
    { id: 'mypage', label: '마이페이지', onClick: () => {} },
  ];

  return (
    <aside style={{
      width: '240px',
      height: '100%',
      backgroundColor: 'var(--sidebar-bg, #f3f4f6)',
      borderRight: '1px solid var(--border-color, #e5e7eb)',
      padding: '2rem 1rem',
      position: 'sticky',
      top: '64px', // Header height
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            textAlign: 'left',
            backgroundColor: item.id === 'studies' ? 'var(--button-active-bg, #e5e7eb)' : 'transparent',
            border: 'none',
            borderRadius: '0.375rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: item.id === 'studies' ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            ':hover': {
              backgroundColor: 'var(--button-hover-bg, #e5e7eb)'
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}

export default StudiesListSidebar; 