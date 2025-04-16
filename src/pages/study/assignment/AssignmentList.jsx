import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from 'styled-components';
import { useTheme } from "../../../contexts/ThemeContext";
import useStudyRole from "../../../hooks/useStudyRole";
import assignmentService from "../../../services/assignment";

function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { studyId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  // useStudyRole 훅 사용 - 권한 체크
  const { memberRole, isManager } = useStudyRole();
  
  console.log("[AssignmentList] 초기화, studyId:", studyId, "memberRole:", memberRole);
  console.log("[AssignmentList] 관리자 권한:", isManager);
  
  // 과제 목록 불러오기
  const fetchAssignments = async () => {
    if (!studyId) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await assignmentService.getAssignments(studyId);
      setAssignments(response.data || []);
    } catch (err) {
      console.error("[AssignmentList] 과제 데이터 조회 실패:", err);
      setError("과제 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
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
    if (!window.confirm("정말로 이 과제를 삭제하시겠습니까?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      await assignmentService.deleteAssignment(studyId, assignmentId);
      console.log("[AssignmentList] 과제 삭제:", assignmentId);
      
      // 삭제 성공 후 목록 다시 불러오기
      fetchAssignments();
    } catch (err) {
      console.error("[AssignmentList] 과제 삭제 실패:", err);
      setError("과제 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 과제 목록 로드
  useEffect(() => {
    fetchAssignments();
  }, [studyId]);
  
  // 과제 항목 렌더링 함수
  const renderAssignmentItem = (assignment) => {
    const { assignmentId, assignmentTitle, assignmentDueDate, submissionStatus, submissionScore } = assignment;
    
    return (
      <AssignmentItem 
        key={assignmentId} 
        onClick={() => handleViewAssignment(assignmentId)}
      >
        <AssignmentInfo>
          <AssignmentTitle>{assignmentTitle}</AssignmentTitle>
          <AssignmentMeta>
            <span>마감일: {new Date(assignmentDueDate).toLocaleDateString()}</span>
            <span>상태: {submissionStatus || '미제출'}</span>
            {submissionScore && <span>점수: {submissionScore}</span>}
          </AssignmentMeta>
        </AssignmentInfo>
        
        {isManager && (
          <DeleteButton
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAssignment(assignmentId);
            }}
          >
            삭제
          </DeleteButton>
        )}
      </AssignmentItem>
    );
  };
  
  return (
    <Container>
      <Header>
        <Title>과제 목록</Title>
        {isManager && (
          <CreateButton onClick={handleCreateAssignment}>
            과제 업로드
          </CreateButton>
        )}
      </Header>
      
      {/* 오류 메시지 표시 */}
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
      
      {/* 로딩 상태 표시 */}
      {isLoading ? (
        <LoadingMessage>로딩 중...</LoadingMessage>
      ) : assignments.length === 0 ? (
        <EmptyMessage>
          등록된 과제가 없습니다.
          {isManager && <p>오른쪽 상단의 '과제 업로드' 버튼을 클릭하여 새 과제를 생성해보세요.</p>}
        </EmptyMessage>
      ) : (
        <AssignmentList>
          {assignments.map(renderAssignmentItem)}
        </AssignmentList>
      )}
    </Container>
  );
}

// 스타일 컴포넌트
const Container = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
`;

const CreateButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const AssignmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AssignmentItem = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const AssignmentInfo = styled.div`
  flex: 1;
`;

const AssignmentTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 18px;
`;

const AssignmentMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #c82333;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #f8d7da;
  border-radius: 4px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  border: 1px dashed #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
`;

export default AssignmentList; 