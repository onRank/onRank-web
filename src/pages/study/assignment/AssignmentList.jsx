import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from 'styled-components';
import { useTheme } from "../../../contexts/ThemeContext";
import useStudyRole from "../../../hooks/useStudyRole";
import assignmentService from "../../../services/assignment";
import { FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';

function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { studyId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [activePopup, setActivePopup] = useState(null);
  const popupRef = useRef(null);
  
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
  
  // 과제 수정 페이지로 이동
  const handleEditAssignment = (assignmentId) => {
    navigate(`/studies/${studyId}/assignment/${assignmentId}/edit`);
    setActivePopup(null);
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
      setActivePopup(null);
    }
  };
  
  // 팝업 메뉴 표시/숨김
  const togglePopup = (e, assignmentId) => {
    e.stopPropagation();
    if (activePopup === assignmentId) {
      setActivePopup(null);
    } else {
      setActivePopup(assignmentId);
    }
  };
  
  // 외부 클릭시 팝업 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActivePopup(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 컴포넌트 마운트 시 과제 목록 로드
  useEffect(() => {
    fetchAssignments();
  }, [studyId]);
  
  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 제출 상태를 한글로 변환
  const getStatusText = (status) => {
    switch(status) {
      case 'NOTSUBMITTED': return '미제출';
      case 'SUBMITTED': return '제출완료';
      case 'SCORED': return '채점완료';
      default: return '미제출';
    }
  };
  
  // 과제 상태에 따라 분류
  const categorizeAssignments = () => {
    if (!assignments || assignments.length === 0) return {};
    
    // isManager에 따라 다른 카테고리 제공
    const categories = isManager 
      ? {
          '진행중': [],
          '완료': [],
          '마감': []
        }
      : {
          '진행중': [],
          '제출완료': [],
          '마감': []
        };
    
    const now = new Date();
    
    assignments.forEach(assignment => {
      const dueDate = new Date(assignment.assignmentDueDate);
      
      if (isManager) {
        // 관리자 뷰
        if (dueDate > now) {
          categories['진행중'].push(assignment);
        } else {
          categories['마감'].push(assignment);
        }
      } else {
        // 참여자 뷰
        if (dueDate > now) {
          if (assignment.submissionStatus === 'SUBMITTED' || assignment.submissionStatus === 'SCORED') {
            categories['제출완료'].push(assignment);
          } else {
            categories['진행중'].push(assignment);
          }
        } else {
          categories['마감'].push(assignment);
        }
      }
    });
    
    // 빈 카테고리 제거
    return Object.fromEntries(
      Object.entries(categories).filter(([_, items]) => items.length > 0)
    );
  };
  
  const categorizedAssignments = categorizeAssignments();
  
  // 상태에 따라 "진행중", "완료", "마감" 등의 카테고리 표시
  const renderAssignmentsByCategory = () => {
    const categories = Object.keys(categorizedAssignments);
    
    if (categories.length === 0) return null;
    
    return categories.map(category => (
      <CategorySection key={category}>
        <CategoryTitle>{category}</CategoryTitle>
        <AssignmentListContainer>
          {categorizedAssignments[category].map(assignment => renderAssignmentItem(assignment, category))}
        </AssignmentListContainer>
      </CategorySection>
    ));
  };
  
  // 참여자 뷰에서 사용할 과제 항목 렌더링
  const renderParticipantAssignmentItem = (assignment, category) => {
    const { assignmentId, assignmentTitle, assignmentDueDate, submissionStatus, submissionScore, assignmentMaxPoint } = assignment;
    
    // 제출 상태에 따른 색상 설정
    let statusColor = "#6c757d"; // 기본 회색
    if (submissionStatus === 'SUBMITTED') statusColor = "#ffc107"; // 제출 - 노란색
    if (submissionStatus === 'SCORED') statusColor = "#28a745"; // 채점완료 - 녹색
    if (category === '마감' && submissionStatus !== 'SCORED') statusColor = "#dc3545"; // 마감됨 - 빨간색
    
    return (
      <AssignmentItem 
        key={assignmentId} 
        onClick={() => handleViewAssignment(assignmentId)}
        status={submissionStatus}
        statusColor={statusColor}
      >
        <AssignmentInfo>
          <AssignmentDate>마감: {formatDate(assignmentDueDate)}</AssignmentDate>
          <AssignmentTitle>{assignmentTitle}</AssignmentTitle>
          <AssignmentMetaRow>
            <StatusBadge status={submissionStatus}>{getStatusText(submissionStatus)}</StatusBadge>
            {submissionStatus === 'SCORED' && (
              <ScoreDisplay>
                {submissionScore}/{assignmentMaxPoint} pt
              </ScoreDisplay>
            )}
          </AssignmentMetaRow>
        </AssignmentInfo>
      </AssignmentItem>
    );
  };
  
  // 관리자 뷰에서 사용할 과제 항목 렌더링
  const renderManagerAssignmentItem = (assignment, category) => {
    const { assignmentId, assignmentTitle, assignmentDueDate, submissionStatus, submissionScore, assignmentMaxPoint } = assignment;
    
    // 관리자 뷰는 좌측 보더 색상 없음
    
    return (
      <AssignmentItem 
        key={assignmentId} 
        onClick={() => handleViewAssignment(assignmentId)}
      >
        <AssignmentInfo>
          <AssignmentDate>마감: {formatDate(assignmentDueDate)}</AssignmentDate>
          <AssignmentTitle>{assignmentTitle}</AssignmentTitle>
        </AssignmentInfo>
        
        <ActionsContainer>
          <MoreButton onClick={(e) => togglePopup(e, assignmentId)}>
            <FiMoreVertical size={18} />
          </MoreButton>
          
          {activePopup === assignmentId && (
            <PopupMenu ref={popupRef}>
              <PopupMenuItem onClick={(e) => {
                e.stopPropagation();
                handleEditAssignment(assignmentId);
              }}>
                <FiEdit2 size={16} color="#16191f"/>
                <span>수정</span>
              </PopupMenuItem>
              <PopupMenuItem onClick={(e) => {
                e.stopPropagation();
                handleDeleteAssignment(assignmentId);
              }}>
                <FiTrash2 size={16} color="#16191f"/>
                <span>삭제</span>
              </PopupMenuItem>
            </PopupMenu>
          )}
        </ActionsContainer>
      </AssignmentItem>
    );
  };
  
  // 과제 항목 렌더링 함수 (관리자/참여자 구분)
  const renderAssignmentItem = (assignment, category) => {
    return isManager 
      ? renderManagerAssignmentItem(assignment, category)
      : renderParticipantAssignmentItem(assignment, category);
  };
  
  return (
    <Container>
      <Header>
        <Title>과제</Title>
        {isManager && (
          <CreateButtonWrapper>
            <CreateButton onClick={handleCreateAssignment}>
              + 추가
            </CreateButton>
          </CreateButtonWrapper>
        )}
      </Header>
      
      {/* 오류 메시지 표시 */}
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
      
      {/* 로딩 상태 표시 */}
      {isLoading ? (
        <LoadingMessage>과제 정보를 불러오는 중...</LoadingMessage>
      ) : assignments.length === 0 ? (
        <EmptyMessage>
          {isManager 
            ? "새로운 과제를 추가해주세요."
            : "등록된 과제가 없습니다."}
        </EmptyMessage>
      ) : (
        <AssignmentsWrapper>
          {renderAssignmentsByCategory()}
        </AssignmentsWrapper>
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

const CreateButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const CreateButton = styled.button`
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #c82333;
  }
`;

const AssignmentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CategorySection = styled.section`
  margin-bottom: 1.5rem;
`;

const CategoryTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
`;

const AssignmentListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AssignmentItem = styled.div`
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  ${props => props.statusColor && `
    border-left: 4px solid ${props.statusColor};
  `}
  
  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #f8f9fa;
  }
`;

const AssignmentInfo = styled.div`
  flex: 1;
`;

const AssignmentDate = styled.div`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 6px;
`;

const AssignmentTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 16px;
  font-weight: 500;
`;

const AssignmentMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
  
  ${props => {
    switch(props.status) {
      case 'SUBMITTED':
        return `
          background-color: #fff3cd;
          color: #856404;
        `;
      case 'SCORED':
        return `
          background-color: #d4edda;
          color: #155724;
        `;
      default:
        return `
          background-color: #f8f9fa;
          color: #6c757d;
        `;
    }
  }}
`;

const ScoreDisplay = styled.div`
  background-color: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  
  &:hover {
    color: #000;
  }
`;

const PopupMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 150px;
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
`;

const PopupMenuItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #e9ecef;
  }
  
  span {
    color: #16191f;
    font-size: 14px;
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