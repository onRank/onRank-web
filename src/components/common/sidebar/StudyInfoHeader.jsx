import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../../contexts/ThemeContext';

// 스터디 헤더 정보 컴포넌트 (이미지와 제목 표시)
const StudyInfoHeader = memo(({ studyName, studyImageUrl }) => {
  const { colors } = useTheme();
  
  // 기본 이미지 URL (스터디 이미지가 없을 경우)
  const defaultImageUrl = '/logo1.png'; // 이미 있는 logo1.png 파일 활용
  
  return (
    <div style={{
      backgroundColor: '#333',
      color: 'white',
      height: '120px',
      position: 'relative',
      borderRadius: '4px 4px 0 0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* 배경 이미지 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${studyImageUrl || defaultImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0
      }} />
      
      {/* 검정색 반투명 오버레이 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }} />
      
      {/* 스터디 이름 */}
      <h2 style={{
        margin: 0,
        fontSize: '1.3rem',
        fontWeight: 'bold',
        textAlign: 'center',
        wordBreak: 'break-word',
        padding: '0 1rem',
        zIndex: 2,
        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
      }}>
        {studyName || '정보 로딩 중...'}
      </h2>
    </div>
  );
});

StudyInfoHeader.displayName = 'StudyInfoHeader';

StudyInfoHeader.propTypes = {
  studyName: PropTypes.string,
  studyImageUrl: PropTypes.string
};

StudyInfoHeader.defaultProps = {
  studyName: '',
  studyImageUrl: null
};

export default StudyInfoHeader; 