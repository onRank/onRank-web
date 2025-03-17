import PropTypes from 'prop-types';

function AssignmentTab({ assignments }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold'
        }}>과제</h1>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {assignments.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#666666',
            border: '1px dashed #E5E5E5',
            borderRadius: '4px'
          }}>
            등록된 과제가, 없습니다. 과제를 추가해보세요.
          </div>
        ) : (
          assignments.map((assignment) => (
            <div 
              key={assignment.id}
              style={{
                padding: '20px',
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
            >
              <h2 style={{
                fontSize: '18px',
                marginBottom: '12px'
              }}>{assignment.title}</h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#666'
              }}>
                <span style={{ fontSize: '14px' }}>{assignment.dueDate}</span>
                <span style={{
                  fontSize: '14px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#f0f0f0'
                }}>{assignment.status}</span>
                {assignment.score && (
                  <span style={{
                    fontSize: '14px',
                    color: '#000',
                    fontWeight: 'bold'
                  }}>{assignment.score}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

AssignmentTab.propTypes = {
  assignments: PropTypes.array.isRequired
};

export default AssignmentTab; 