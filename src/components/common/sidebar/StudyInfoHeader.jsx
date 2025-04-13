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
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px 4px 0 0',
      textAlign: 'center'
    }}>
      {/* 스터디 이미지 */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        overflow: 'hidden',
        marginBottom: '1rem',
        border: '2px solid white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222'
      }}>
        <img 
          src={studyImageUrl || defaultImageUrl} 
          alt={studyName}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImageUrl;
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      
      {/* 스터디 이름 */}
      <h2 style={{
        margin: 0,
        fontSize: '1.2rem',
        fontWeight: 'bold',
        wordBreak: 'break-word'
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