import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import StudyInfoHeader from './StudyInfoHeader';
import StudyNavigation from './StudyNavigation';
import studyContextService from '../../../services/studyContext';
import { IoHomeOutline, IoChevronForward } from 'react-icons/io5';

// 스터디 사이드바 컨테이너 컴포넌트
const StudySidebarContainer = memo(({ activeTab, subPage }) => {
  const { studyId } = useParams();
  const { colors } = useTheme();
  const [studyInfo, setStudyInfo] = useState({
    studyName: '',
    studyImageUrl: null
  });
  const [memberRole, setMemberRole] = useState('');

  // 컴포넌트 마운트 시 스터디 정보 로드
  useEffect(() => {
    // 캐시된 스터디 컨텍스트 정보 가져오기
    const cachedContext = studyContextService.getStudyContext(studyId);
    
    if (cachedContext) {
      setStudyInfo({
        studyName: cachedContext.studyName || '',
        studyImageUrl: cachedContext.studyImageUrl || null
      });
      
      // 멤버 역할 정보 설정 - 두 가지 위치 모두 확인
      if (cachedContext.memberContext && cachedContext.memberContext.memberRole) {
        // memberContext 내부에 있는 경우 (API 응답 구조)
        console.log('[디버깅] memberContext에서 역할 정보 가져옴:', cachedContext.memberContext.memberRole);
        setMemberRole(cachedContext.memberContext.memberRole);
      } else if (cachedContext.memberRole) {
        // 최상위 레벨에 있는 경우 (캐시된 구조)
        console.log('[디버깅] 최상위 레벨에서 역할 정보 가져옴:', cachedContext.memberRole);
        setMemberRole(cachedContext.memberRole);
      } else {
        console.log('[디버깅] 역할 정보 없음, 현재 memberRole:', memberRole);
      }
      
      console.log(`[StudySidebarContainer] 캐시된 스터디 정보 사용: ${cachedContext.studyName}`);
    } else {
      console.log(`[StudySidebarContainer] 캐시된 스터디 정보 없음: ${studyId}`);
    }
  }, [studyId, memberRole]);

  // 새 스터디 정보가 업데이트될 때마다 실행
  useEffect(() => {
    // 이벤트 리스너 등록 (커스텀 이벤트 방식)
    const checkForUpdates = setInterval(() => {
      const latestContext = studyContextService.getStudyContext(studyId);
      if (latestContext) {
        // 현재 memberRole 값 (API 응답 또는 캐시된 값)
        const currentContextRole = latestContext.memberContext?.memberRole || latestContext.memberRole;
        
        if (latestContext.studyName !== studyInfo.studyName || 
            latestContext.studyImageUrl !== studyInfo.studyImageUrl ||
            currentContextRole !== memberRole) {
          
          // 스터디 컨텍스트 정보 변경을 감지하는 함수
          const handleStudyContextChange = () => {
            if (latestContext) {
              setStudyInfo({
                studyName: latestContext.studyName || studyInfo.studyName,
                studyImageUrl: latestContext.studyImageUrl || studyInfo.studyImageUrl
              });
              
              // 멤버 역할 정보 업데이트 - 두 가지 위치 모두 확인
              if (latestContext.memberContext && latestContext.memberContext.memberRole) {
                setMemberRole(latestContext.memberContext.memberRole);
              } else if (latestContext.memberRole) {
                setMemberRole(latestContext.memberRole);
              }
            }
          };
          
          handleStudyContextChange();
        }
      }
    }, 1000); // 1초마다 체크
    
    return () => clearInterval(checkForUpdates);
  }, [studyId, studyInfo, memberRole]);

  // 브레드크럼 조건부 표시를 위한 함수
  const renderBreadcrumb = () => {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: 'white',
        borderRadius: '4px',
        margin: '0.5rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <Link to={`/studies/${studyId}`} style={{ color: '#4A5568', display: 'flex', alignItems: 'center' }}>
          <IoHomeOutline size={18} />
        </Link>
        
        <IoChevronForward size={16} style={{ margin: '0 0.5rem', color: '#718096' }} />
        
        {activeTab && (
          <Link 
            to={`/studies/${studyId}/${getPathFromTab(activeTab)}`} 
            style={{ 
              color: subPage ? '#4A5568' : '#FF0000',
              fontWeight: '500', 
              textDecoration: 'none'
            }}
          >
            {activeTab}
          </Link>
        )}
        
        {subPage && (
          <>
            <IoChevronForward size={16} style={{ margin: '0 0.5rem', color: '#718096' }} />
            <span style={{ color: '#FF0000', fontWeight: '500' }}>{subPage}</span>
          </>
        )}
      </div>
    );
  };
  
  // 탭 이름에서 경로를 가져오는 도우미 함수
  const getPathFromTab = (tab) => {
    const pathMap = {
      '공지사항': 'notices',
      '일정': 'schedules',
      '과제': 'assignment',
      '게시판': 'posts',
      '출석': 'attendances',
      '관리': 'management',
      '랭킹': 'ranking'
    };
    return pathMap[tab] || '';
  };

  return (
    <div style={{
      width: '240px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
      flexShrink: 0,
      border: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      margin: '0.5rem 0'
    }}>
      {/* 디버깅 정보 */}
      {console.log('[디버깅] 렌더링 시 memberRole:', memberRole)}
      
      {/* 스터디 정보 헤더 (이미지와 이름) */}
      <StudyInfoHeader 
        studyName={studyInfo.studyName} 
        studyImageUrl={studyInfo.studyImageUrl}
      />
      
      {/* 브레드크럼 네비게이션 */}
      {renderBreadcrumb()}
      
      {/* 스터디 네비게이션 메뉴 - 스크롤 제거 */}
      <div style={{ 
        flex: 1,
      }}>
        <StudyNavigation activeTab={activeTab} memberRole={memberRole} />
      </div>
    </div>
  );
});

StudySidebarContainer.displayName = 'StudySidebarContainer';

StudySidebarContainer.propTypes = {
  activeTab: PropTypes.string,
  subPage: PropTypes.string
};

StudySidebarContainer.defaultProps = {
  activeTab: '',
  subPage: ''
};

export default StudySidebarContainer; 