import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useMemberRole } from '../../../contexts/MemberRoleContext';

// 스터디 네비게이션 메뉴 컴포넌트
const StudyNavigation = memo(({ activeTab }) => {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const { colors } = useTheme();
  const { memberRole, isManager } = useMemberRole();

  // 컴포넌트 마운트 시 로그
  useEffect(() => {
    console.log('[StudyNavigation] 컴포넌트 마운트, studyId:', studyId);
    console.log('[StudyNavigation] 현재 memberRole:', memberRole);
  }, [studyId, memberRole]);

  // 관리자 권한 확인
  const hasManagerRole = isManager();
  console.log('[StudyNavigation] 관리자 권한 여부:', hasManagerRole, 'memberRole:', memberRole);

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
  
  // 표시할 메뉴 항목 필터링
  const visibleMenuItems = menuItems.filter(item => 
    !item.requiredRole || (item.requiredRole && hasManagerRole)
  );
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '0 0 4px 4px',
      overflow: 'hidden',
      borderTop: `1px solid ${colors.border}`,
      flex: '0 0 auto' // 크기 유지
    }}>
      {visibleMenuItems.map((item) => (
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
            paddingLeft: '2rem',
            height: '48px' // 모든 버튼에 동일한 높이 적용
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
      ))}
    </div>
  );
});

StudyNavigation.displayName = 'StudyNavigation';

StudyNavigation.propTypes = {
  activeTab: PropTypes.string
};

StudyNavigation.defaultProps = {
  activeTab: ''
};

export default StudyNavigation; 