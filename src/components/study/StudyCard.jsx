import PropTypes from 'prop-types'

function StudyCard({ study, onClick }) {
  // 디버깅 로그 추가
  console.log('[StudyCard] 렌더링:', study);
  
  // 이미지 로딩 오류 처리
  const handleImageError = (e) => {
    // 더 안정적인 대체 이미지 URL 사용
    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22150%22%20fill%3D%22%23CCCCCC%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%2275%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20fill%3D%22%23333333%22%3E%EC%8A%A4%ED%84%B0%EB%94%94%20%EC%9D%B4%EB%AF%B8%EC%A7%80%3C%2Ftext%3E%3C%2Fsvg%3E';
    // 오류 로깅
    console.log('[StudyCard] 이미지 로딩 실패, 대체 이미지 사용:', study.imageUrl);
  };
  
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '15px',
        border: '1px solid #EEEEEE',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      {/* 스터디 이미지 */}
      <div style={{
        width: '100%',
        height: '180px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5'
      }}>
        <img 
          src={study.imageUrl || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22150%22%20fill%3D%22%23CCCCCC%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%2275%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20fill%3D%22%23333333%22%3E%EC%8A%A4%ED%84%B0%EB%94%94%20%EC%9D%B4%EB%AF%B8%EC%A7%80%3C%2Ftext%3E%3C%2Fsvg%3E'} 
          alt={study.title}
          onError={handleImageError}
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
          color: '#333333',
          marginBottom: '8px'
        }}>
          {study.title || '제목 없음'}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#666666',
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