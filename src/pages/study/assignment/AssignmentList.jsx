import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import useStudyRole from "../../../hooks/useStudyRole";
import assignmentService from "../../../services/assignment";
import { FiEdit2, FiTrash2, FiMoreVertical, FiPlus } from 'react-icons/fi';
import './AssignmentList.css';

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
  const handleEditAssignment = (assignmentId, e) => {
    if (e) {
      e.stopPropagation();
    }
    console.log(`[AssignmentList] 과제 수정 페이지로 이동: studyId=${studyId}, assignmentId=${assignmentId}`);
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
      <div className="category-section" key={category}>
        <h2 className="category-title">{category}</h2>
        <div className="assignment-list-container">
          {categorizedAssignments[category].map(assignment => renderAssignmentItem(assignment, category))}
        </div>
      </div>
    ));
  };
  
  // 참여자 뷰에서 사용할 과제 항목 렌더링
  const renderParticipantAssignmentItem = (assignment, category) => {
    const { assignmentId, assignmentTitle, assignmentDueDate, submissionStatus, submissionScore, assignmentMaxPoint } = assignment;
    
    // 제출 상태에 따른 클래스 설정
    let statusClass = '';
    if (submissionStatus === 'SUBMITTED') statusClass = 'submitted';
    if (submissionStatus === 'SCORED') statusClass = 'scored';
    
    return (
      <div 
        className="assignment-item" 
        key={assignmentId} 
        onClick={() => handleViewAssignment(assignmentId)}
      >
        <div className="assignment-info">
          <div className="assignment-info-container">
            <div className="assignment-date">마감: {formatDate(assignmentDueDate)}</div>
            <h3 className="assignment-title">{assignmentTitle}</h3>
          </div>
          <div className="assignment-meta-row">
            <span className={`status-tag ${submissionStatus.toLowerCase()}`}>{getStatusText(submissionStatus)}</span>
            <div className="score-display">
              {submissionScore !== null ? submissionScore : '--'}/{assignmentMaxPoint} pt
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 관리자 뷰에서 사용할 과제 항목 렌더링
  const renderManagerAssignmentItem = (assignment, category) => {
    const { assignmentId, assignmentTitle, assignmentDueDate, submissionStatus, submissionScore, assignmentMaxPoint } = assignment;
        
    return (
      <div 
        className="assignment-item" 
        key={assignmentId} 
        onClick={() => handleViewAssignment(assignmentId)}
      >
        <div className="assignment-info">
          <div className="assignment-info-container">
            <div className="assignment-date">마감: {formatDate(assignmentDueDate)}</div>
            <h3 className="assignment-title">{assignmentTitle}</h3>
          </div>
          <div className="assignment-meta-row">
            <span className={`status-tag ${category === '마감' ? 'not-submitted' : ''}`}>
              {category}
            </span>
            <div className="score-display">
              {submissionScore !== null ? submissionScore : '--'}/{assignmentMaxPoint} pt
            </div>
          </div>
        </div>
        
        <div className="actions-container">
          <button className="more-button" onClick={(e) => togglePopup(e, assignmentId)}>
            <FiMoreVertical size={18} />
          </button>
          
          {activePopup === assignmentId && (
            <div className="popup-menu" ref={popupRef}>
              <div className="popup-menu-item" onClick={(e) => {
                e.stopPropagation();
                handleEditAssignment(assignmentId);
              }}>
                <FiEdit2 size={16} color="#16191f"/>
                <span>수정</span>
              </div>
              <div className="popup-menu-item" onClick={(e) => {
                e.stopPropagation();
                handleDeleteAssignment(assignmentId);
              }}>
                <FiTrash2 size={16} color="#16191f"/>
                <span>삭제</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // 과제 항목 렌더링 함수 (관리자/참여자 구분)
  const renderAssignmentItem = (assignment, category) => {
    return isManager 
      ? renderManagerAssignmentItem(assignment, category)
      : renderParticipantAssignmentItem(assignment, category);
  };
  
  // 과제 추가 섹션 렌더링
  const renderAddAssignmentSection = () => {
    if (!isManager) return null;
    
    return (
      <div className="assignment-add-section">
        <div>
          <div className="assignment-add-title">새로운 과제 추가</div>
          <div className="assignment-add-description">
            학생들에게 제공할 새로운 과제를 추가해보세요.
          </div>
        </div>
        <button className="create-button" onClick={handleCreateAssignment}>
          + 추가
        </button>
      </div>
    );
  };
  
  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <h1 className="assignment-title">과제</h1>
      </div>
      
      {/* 오류 메시지 표시 */}
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {/* 과제 추가 섹션 */}
      {renderAddAssignmentSection()}
      
      {/* 로딩 상태 표시 */}
      {isLoading ? (
        <div className="loading-message">과제 정보를 불러오는 중...</div>
      ) : assignments.length === 0 ? (
        <div className="empty-message">
          {isManager 
            ? "새로운 과제를 추가해주세요."
            : "등록된 과제가 없습니다."}
        </div>
      ) : (
        <div className="assignments-wrapper">
          {renderAssignmentsByCategory()}
        </div>
      )}
    </div>
  );
}

export default AssignmentList; 