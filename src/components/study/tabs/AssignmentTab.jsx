import PropTypes from 'prop-types';
import { useTheme } from '../../../contexts/ThemeContext';

function AssignmentTab({ assignments }) {
  const { colors } = useTheme();
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: colors.text
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
            color: colors.textSecondary,
            border: `1px dashed ${colors.border}`,
            borderRadius: '4px',
            backgroundColor: colors.cardBackground
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
                backgroundColor: colors.cardBackground,
                boxShadow: `0 2px 4px ${colors.shadowColor}`,
                border: `1px solid ${colors.border}`,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
            >
              <h2 style={{
                fontSize: '18px',
                marginBottom: '12px',
                color: colors.text
              }}>{assignment.title}</h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: colors.textSecondary
              }}>
                <span style={{ fontSize: '14px' }}>{assignment.dueDate}</span>
                <span style={{
                  fontSize: '14px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: colors.surfaceHover,
                  color: colors.text
                }}>{assignment.status}</span>
                {assignment.score && (
                  <span style={{
                    fontSize: '14px',
                    color: colors.primary,
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