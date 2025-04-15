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
      // TODO: API 연동 전까지는 임시 데이터 사용
      // const data = await assignmentService.getAssignments(studyId);
      
      // 임시 데이터
      const mockData = [
        {
          id: "1",
          title: "[기말 프로젝트]",
          dueDate: "2025.3.2",
          status: "진행중",
          content: "기말 프로젝트 과제입니다. 요구사항을 잘 읽고 제출해주세요."
        },
        {
          id: "2",
          title: "[중간 프로젝트]",
          dueDate: "2025.2.1",
          status: "완료",
          score: "10/10",
          content: "중간 프로젝트 과제입니다. 제출 기한을 확인하세요."
        }
      ];
      
      setAssignments(mockData);
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
    // TODO: 상세 페이지 구현 후 활성화
    // navigate(`/studies/${studyId}/assignment/${assignmentId}`);
    console.log("[AssignmentContainer] 과제 상세 보기:", assignmentId);
    
    // 임시: 선택한 과제 정보 콘솔에 출력
    const assignment = assignments.find(item => item.id === assignmentId);
    if (assignment) {
      console.log("[AssignmentContainer] 선택한 과제:", assignment);
    }
  };
  
  // 과제 생성 페이지로 이동
  const handleCreateAssignment = () => {
    // TODO: 생성 페이지 구현 후 활성화
    // navigate(`/studies/${studyId}/assignment/create`);
    console.log("[AssignmentContainer] 과제 생성 페이지로 이동");
  };
  
  // 과제 삭제
  const handleDeleteAssignment = async (assignmentId) => {
    try {
      setIsLoading(true);
      
      // TODO: API 연동
      // await assignmentService.deleteAssignment(studyId, assignmentId);
      
      console.log("[AssignmentContainer] 과제 삭제:", assignmentId);
      
      // 임시: 상태에서만 제거
      setAssignments(prev => prev.filter(item => item.id !== assignmentId));
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