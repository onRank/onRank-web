import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import StudyInfoHeader from './StudyInfoHeader';
import StudyNavigation from './StudyNavigation';
import studyContextService from '../../../services/studyContext';

// 스터디 사이드바 컨테이너 컴포넌트
const StudySidebarContainer = memo(({ activeTab }) => {
  const { studyId } = useParams();
  const { colors } = useTheme();
  const [studyInfo, setStudyInfo] = useState({
    studyName: '',
    studyImageUrl: null
  });

  // 컴포넌트 마운트 시 스터디 정보 로드
  useEffect(() => {
    // 캐시된 스터디 컨텍스트 정보 가져오기
    const cachedContext = studyContextService.getStudyContext(studyId);
    
    if (cachedContext) {
      setStudyInfo({
        studyName: cachedContext.studyName || '',
        studyImageUrl: cachedContext.studyImageUrl || null
      });
      console.log(`[StudySidebarContainer] 캐시된 스터디 정보 사용: ${cachedContext.studyName}`);
    } else {
      console.log(`[StudySidebarContainer] 캐시된 스터디 정보 없음: ${studyId}`);
    }
  }, [studyId]);

  // 새 스터디 정보가 업데이트될 때마다 실행
  useEffect(() => {
    // 스터디 컨텍스트 정보 변경을 감지하는 함수
    const handleStudyContextChange = () => {
      const latestContext = studyContextService.getStudyContext(studyId);
      if (latestContext) {
        setStudyInfo({
          studyName: latestContext.studyName || studyInfo.studyName,
          studyImageUrl: latestContext.studyImageUrl || studyInfo.studyImageUrl
        });
      }
    };

    // 이벤트 리스너 등록 (커스텀 이벤트 방식)
    const checkForUpdates = setInterval(() => {
      const latestContext = studyContextService.getStudyContext(studyId);
      if (latestContext && 
          (latestContext.studyName !== studyInfo.studyName || 
           latestContext.studyImageUrl !== studyInfo.studyImageUrl)) {
        handleStudyContextChange();
      }
    }, 1000); // 1초마다 체크
    
    return () => clearInterval(checkForUpdates);
  }, [studyId, studyInfo]);

  return (
    <div style={{
      width: '240px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
      flexShrink: 0,
      border: `1px solid ${colors.border}`
    }}>
      {/* 스터디 정보 헤더 (이미지와 이름) */}
      <StudyInfoHeader 
        studyName={studyInfo.studyName} 
        studyImageUrl={studyInfo.studyImageUrl}
      />
      
      {/* 스터디 네비게이션 메뉴 */}
      <StudyNavigation activeTab={activeTab} />
    </div>
  );
});

StudySidebarContainer.displayName = 'StudySidebarContainer';

StudySidebarContainer.propTypes = {
  activeTab: PropTypes.string
};

StudySidebarContainer.defaultProps = {
  activeTab: ''
};

export default StudySidebarContainer; 