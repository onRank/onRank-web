import PropTypes from 'prop-types'
import studyDefaultImage from '../../assets/images/study.png';

function StudyCard({ study, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      }}
    >
      <div style={{
        width: '100%',
        height: '200px',
        overflow: 'hidden'
      }}>
        <img 
          src={studyDefaultImage} 
          alt={study.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      <div style={{
        padding: '1rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'var(--text-primary, #111827)'
        }}>
          {study.title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary, #6B7280)',
          marginBottom: '0.5rem'
        }}>
          {study.description}
        </p>
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-color, #E5E7EB)',
          paddingTop: '0.75rem'
        }}>
          <span style={{
            fontSize: '0.875rem',
            color: 'var(--text-primary, #374151)'
          }}>
            멤버: {study.currentMembers}/{study.maxMembers}명
          </span>
          <span style={{
            fontSize: '0.875rem',
            color: study.status === '모집중' ? '#059669' : '#DC2626',
            fontWeight: '500'
          }}>
            {study.status}
          </span>
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
    status: PropTypes.string.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired
}

export default StudyCard; 