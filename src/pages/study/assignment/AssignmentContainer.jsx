import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import useStudyRole from "../../../hooks/useStudyRole";
import assignmentService from "../../../services/assignment";
import AssignmentListPage from "./AssignmentListPage";

function AssignmentContainer({ onSubPageChange }) {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { studyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // useStudyRole 훅 사용
  const { memberRole, isManager } = useStudyRole();
  
  console.log("[AssignmentContainer] 초기화, studyId:", studyId, "memberRole:", memberRole);
  console.log("[AssignmentContainer] 관리자 권한:", isManager);
  
  // 과제 목록 불러오기
  const fetchAssignments = async () => {
    if (!studyId) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await assignmentService.getAssignments(studyId);
      setAssignments(response.data|| []);
    } catch (err) {
      console.error("[AssignmentContainer] 과제 데이터 조회 실패:", err);
      setError("과제 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // subPage 상태 관리 및 콜백 호출
  useEffect(() => {
    // 현재는 목록 페이지만 구현되어 있어서 null을 전달
    if (onSubPageChange) {
      onSubPageChange(null);
    }
    
    // 컴포넌트 언마운트 시 subPage 초기화
    return () => {
      if (onSubPageChange) {
        onSubPageChange(null);
      }
    };
  }, [onSubPageChange]);
  
  // 과제 보기
  const handleViewAssignment = (assignmentId) => {
    navigate(`/studies/${studyId}/assignment/${assignmentId}`);
  };
  
  // 과제 생성 페이지로 이동
  const handleCreateAssignment = () => {
    navigate(`/studies/${studyId}/assignment/create`);
  };
  
  // 과제 삭제
  const handleDeleteAssignment = async (assignmentId) => {
    try {
      setIsLoading(true);
      
      await assignmentService.deleteAssignment(studyId, assignmentId);
      console.log("[AssignmentContainer] 과제 삭제:", assignmentId);
      
      // 삭제 성공 후 목록 다시 불러오기
      fetchAssignments();
    } catch (err) {
      console.error("[AssignmentContainer] 과제 삭제 실패:", err);
      setError("과제 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 과제 목록 로드
  useEffect(() => {
    fetchAssignments();
  }, [studyId]);
  
  return (
    <div style={{ width: '100%' }}>
      <AssignmentListPage
        assignments={assignments}
        isManager={isManager}
        onViewAssignment={handleViewAssignment}
        onCreateAssignment={handleCreateAssignment}
        onDeleteAssignment={handleDeleteAssignment}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

AssignmentContainer.propTypes = {
  onSubPageChange: PropTypes.func
};

export default AssignmentContainer;