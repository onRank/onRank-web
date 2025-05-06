import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import useStudyRole from '../../../hooks/useStudyRole';

// 스터디 네비게이션 메뉴 컴포넌트
const StudyNavigation = memo(({ activeTab }) => {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const { colors } = useTheme();
  const { memberRole, isManager } = useStudyRole();

  // 컴포넌트 마운트 시 로그
  useEffect(() => {
    console.log('[StudyNavigation] 컴포넌트 마운트, studyId:', studyId);
    console.log('[StudyNavigation] 현재 memberRole:', memberRole);
  }, [studyId, memberRole]);

  // 관리자 권한 확인
  console.log('[StudyNavigation] 관리자 권한 여부:', isManager, 'memberRole:', memberRole);

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
    !item.requiredRole || (item.requiredRole && isManager)
  );
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
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
            borderBottom: '1px solid #eee',
            background: activeTab === item.id ? '#f5f5f5' : '#fff',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            color: activeTab === item.id ? '#FF0000' : '#333',
            fontWeight: activeTab === item.id ? 'bold' : 'normal',
            height: '48px', // 모든 버튼에 동일한 높이 적용
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'relative'
          }}
        >
          {/* 활성화 표시 - 빨간색 점 대신 배경색과 텍스트 색상으로 표시 */}
          {activeTab === item.id && (
            <span style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '3px',
              backgroundColor: '#FF0000'
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