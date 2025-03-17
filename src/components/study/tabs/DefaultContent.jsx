import PropTypes from 'prop-types';

function DefaultContent({ studyData }) {
  return (
    <>
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        border: '1px solid #E5E5E5',
        borderRadius: '4px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          스터디 소개
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#666666',
          whiteSpace: 'pre-line'
        }}>
          {studyData?.description || "스터디 소개가 없습니다."}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem'
      }}>
        <div style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#F8F9FA',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '16px',
            marginBottom: '1rem'
          }}>
            보증금
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>0원</span>
          </div>
        </div>

        <div style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#FFF9C4',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '16px',
            marginBottom: '1rem'
          }}>
            상금
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>0원</span>
          </div>
        </div>
      </div>
    </>
  );
}

DefaultContent.propTypes = {
  studyData: PropTypes.shape({
    description: PropTypes.string,
  })
};

export default DefaultContent; 