import PropTypes from 'prop-types';

function StudyManagement({ studyData }) {
  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>스터디 정보 관리</h3>
      <div style={{ 
        border: '1px solid #E5E5E5', 
        borderRadius: '8px', 
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>스터디 이름</label>
          <input 
            type="text" 
            value={studyData.title} 
            readOnly
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }} 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>스터디 설명</label>
          <textarea 
            value={studyData.description} 
            readOnly
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              minHeight: '100px'
            }} 
          />
        </div>
        <button style={{
          backgroundColor: '#4263eb',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          cursor: 'pointer'
        }}>
          정보 수정
        </button>
      </div>
      
      <div style={{
        border: '1px solid #ff6b6b',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#fff5f5',
        marginTop: '2rem'
      }}>
        <h3 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#e03131'
        }}>
          위험 영역
        </h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          스터디를 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
        </p>
        <button style={{
          backgroundColor: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          cursor: 'pointer'
        }}>
          스터디 삭제
        </button>
      </div>
    </div>
  );
}

StudyManagement.propTypes = {
  studyData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string
  }).isRequired
};

export default StudyManagement; 