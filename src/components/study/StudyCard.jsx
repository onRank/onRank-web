import PropTypes from 'prop-types'

function StudyCard({ study, onClick }) {
  // Extract or set default for creator name
  const creatorName = study.creatorName || study.leaderName || '스터디 리더';
  
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '25px',
        border: '1px solid #ABB1B3',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <div style={{
        padding: '1.5rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#000000'
        }}>
          {study.title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: '#ABB1B3',
          flex: 1
        }}>
          {study.description}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <span style={{
            fontSize: '0.875rem',
            color: '#000000'
          }}>
            멤버: {study.currentMembers}/{study.maxMembers}명
          </span>
          <span style={{
            fontSize: '0.875rem',
            color: study.status === '모집중' ? '#337BB8' : '#F9A955',
            fontWeight: '500'
          }}>
            {study.status}
          </span>
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: '#666666',
          marginTop: '0.5rem'
        }}>
          개설자: {creatorName}
        </div>
      </div>
    </div>
  );
}

StudyCard.propTypes = {
  study: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    currentMembers: PropTypes.number.isRequired,
    maxMembers: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    creatorName: PropTypes.string,
    leaderName: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired
}

export default StudyCard; 