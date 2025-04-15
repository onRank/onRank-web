import PropTypes from 'prop-types';
import { useTheme } from '../../../contexts/ThemeContext';

function AssignmentListPage({
  assignments,
  isManager,
  onViewAssignment,
  onCreateAssignment,
  onDeleteAssignment,
  isLoading,
  error
}) {
  const { colors } = useTheme();
  
  // 과제 항목 렌더링 함수
  const renderAssignmentItem = (assignment) => {
    const { id, title, dueDate, status, score } = assignment;
    
    return (
      <div 
        key={id} 
        className="assignment-item"
        style={{
          padding: "1rem",
          border: `1px solid ${colors.border}`,
          borderRadius: "8px",
          marginBottom: "1rem",
          backgroundColor: colors.cardBackground,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => onViewAssignment(id)}
      >
        <div className="assignment-info">
          <h3 style={{ marginBottom: "0.5rem", color: colors.text }}>{title}</h3>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.9rem", color: colors.textSecondary }}>
            <span>마감일: {dueDate}</span>
            <span>상태: {status}</span>
            {score && <span>점수: {score}</span>}
          </div>
        </div>
        
        {isManager && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("정말로 이 과제를 삭제하시겠습니까?")) {
                onDeleteAssignment(id);
              }
            }}
            style={{
              backgroundColor: colors.error,
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            삭제
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className="assignment-list-page">
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <h1 style={{ color: colors.text }}>과제 목록</h1>
        {isManager && (
          <button
            onClick={onCreateAssignment}
            style={{
              backgroundColor: colors.primary,
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            과제 생성
          </button>
        )}
      </div>
      
      {/* 오류 메시지 표시 */}
      {error && (
        <div 
          style={{ 
            color: colors.error, 
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: colors.errorBackground || `${colors.error}20`,
            borderRadius: "4px"
          }}
        >
          {error}
        </div>
      )}
      
      {/* 로딩 상태 표시 */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: colors.textSecondary }}>
          로딩 중...
        </div>
      ) : assignments.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "2rem", 
          color: colors.textSecondary,
          border: `1px dashed ${colors.border}`,
          borderRadius: "4px",
          backgroundColor: colors.cardBackground
        }}>
          등록된 과제가 없습니다.
          {isManager && <p>오른쪽 상단의 '과제 생성' 버튼을 클릭하여 새 과제를 생성해보세요.</p>}
        </div>
      ) : (
        <div className="assignment-list">
          {assignments.map(renderAssignmentItem)}
        </div>
      )}
    </div>
  );
}

AssignmentListPage.propTypes = {
  assignments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      dueDate: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      score: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  isManager: PropTypes.bool.isRequired,
  onViewAssignment: PropTypes.func.isRequired,
  onCreateAssignment: PropTypes.func.isRequired,
  onDeleteAssignment: PropTypes.func.isRequired,
};

export default AssignmentListPage; 