import { useLocation, useNavigate } from 'react-router-dom';

function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 현재 studyId와 섹션 추출
  const pathParts = location.pathname.split('/');
  const studyId = pathParts[2];
  const currentSection = pathParts[3] || 'study-detail';

  const menuItems = [
    { id: 'study-detail', label: '스터디 정보' },
    { id: 'notice', label: '공지사항' },
    { id: 'schedule', label: '일정' },
    { id: 'assignment', label: '과제' },
    { id: 'board', label: '게시판' },
    { id: 'attendance', label: '출석' },
    { id: 'manage', label: '관리' },
    { id: 'ranking', label: '랭킹&보증금' },
  ];

  const handleSectionChange = (sectionId) => {
    const targetPath = sectionId === 'study-detail' 
      ? `/studies/${studyId}`
      : `/studies/${studyId}/${sectionId}`;
    navigate(targetPath);
  };

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
      <div style={{
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          스터디 정보
        </h2>
      </div>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleSectionChange(item.id)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            textAlign: 'left',
            backgroundColor: currentSection === item.id ? 'var(--button-active-bg, #e5e7eb)' : 'transparent',
            border: 'none',
            borderRadius: '0.375rem',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: currentSection === item.id ? '600' : '400',
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

export default SideBar;