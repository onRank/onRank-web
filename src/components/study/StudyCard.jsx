import PropTypes from 'prop-types'
import { useTheme } from '../../contexts/ThemeContext';
import { DEFAULT_IMAGE_SVG, handleImageError } from '../../utils/imageUtils';

function StudyCard({ study, onClick }) {
  const { colors } = useTheme();
  
  // 디버깅 로그 추가
  console.log('[StudyCard] 렌더링:', study);
  
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: '15px',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: `0 2px 4px ${colors.isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 4px 6px ${colors.isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`
        }
      }}
    >
      {/* 스터디 이미지 */}
      <div style={{
        width: '100%',
        height: '180px',
        overflow: 'hidden',
        backgroundColor: colors.secondaryBackground
      }}>
        <img 
          src={study.imageUrl || DEFAULT_IMAGE_SVG} 
          alt={study.title}
          onError={(e) => handleImageError(e, study.imageUrl)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: colors.text,
          marginBottom: '8px'
        }}>
          {study.title || '제목 없음'}
        </h3>
        <p style={{
          fontSize: '14px',
          color: colors.textSecondary,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {study.description || '설명 없음'}
        </p>
      </div>
    </div>
  );
}

StudyCard.propTypes = {
  study: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired
}

export default StudyCard; 