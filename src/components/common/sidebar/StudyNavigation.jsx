import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

// 스터디 네비게이션 메뉴 컴포넌트
const StudyNavigation = memo(({ activeTab, memberRole }) => {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const { colors } = useTheme();

  // 관리자 권한 확인
  const isManager = memberRole === 'HOST' || memberRole === 'CREATOR';

  // 메뉴 항목 정의
  const menuItems = [
    { id: "공지사항", label: "공지사항", path: "notices" },
    { id: "일정", label: "일정", path: "schedules" },
    { id: "과제", label: "과제", path: "assignment" },
    { id: "게시판", label: "게시판", path: "posts" },
    { id: "출석", label: "출석", path: "attendances" },
    { id: "관리", label: "관리", path: "management", requiredRole: true }, // 관리자만 볼 수 있는 탭
    { id: "랭킹", label: "랭킹", path: "ranking" },
  ];

  // 탭 클릭 핸들러
  const handleTabClick = (path) => {
    navigate(`/studies/${studyId}/${path}`);
  };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '0 0 4px 4px',
      overflow: 'hidden',
      borderTop: `1px solid ${colors.border}`
    }}>
      {menuItems.map((item) => (
        // requiredRole이 true인 메뉴는 관리자만 볼 수 있음
        (!item.requiredRole || (item.requiredRole && isManager)) && (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.path)}
            style={{
              padding: '0.75rem 1rem',
              textAlign: 'left',
              border: 'none',
              borderBottom: `1px solid ${colors.border}`,
              background: activeTab === item.id ? colors.hoverBackground : colors.cardBackground,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              color: activeTab === item.id ? colors.primary : colors.textPrimary,
              fontWeight: activeTab === item.id ? 'bold' : 'normal',
              position: 'relative',
              paddingLeft: '2rem'
            }}
          >
            {/* 활성화 표시 */}
            {activeTab === item.id && (
              <span style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: colors.primary
              }} />
            )}
            {item.label}
          </button>
        )
      ))}
    </div>
  );
});

StudyNavigation.displayName = 'StudyNavigation';

StudyNavigation.propTypes = {
  activeTab: PropTypes.string,
  memberRole: PropTypes.string
};

StudyNavigation.defaultProps = {
  activeTab: '',
  memberRole: ''
};

export default StudyNavigation; 