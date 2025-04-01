import PropTypes from 'prop-types';

function PointManagement() {
  return (
    <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
      <div style={{ 
        flex: 1, 
        padding: '2rem', 
        backgroundColor: '#f5f9f9', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>포인트</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <span role="img" aria-label="money" style={{ fontSize: '1.5rem' }}>💰</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>0원</span>
        </div>
      </div>
      
      <div style={{ 
        flex: 1, 
        padding: '2rem', 
        backgroundColor: '#fffde7', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>상금</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <span role="img" aria-label="money" style={{ fontSize: '1.5rem' }}>💰</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>0원</span>
        </div>
      </div>
    </div>
  );
}

PointManagement.propTypes = {
  // 필요시 props 추가
};

export default PointManagement; 