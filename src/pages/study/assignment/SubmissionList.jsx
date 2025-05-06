import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStudyRole from '../../../hooks/useStudyRole';
import assignmentService from '../../../services/assignment';
import Button from '../../../components/common/Button';
import './SubmissionList.css';

const SubmissionList = () => {
  const { studyId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isManager } = useStudyRole();
  
  // 컴포넌트 마운트 시 제출물 목록 조회
  useEffect(() => {
    // 관리자가 아닌 경우 접근 제한
    if (!isManager) {
      alert("관리자만 접근할 수 있는 페이지입니다.");
      navigate(`/studies/${studyId}/assignment`);
      return;
    }
    
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const response = await assignmentService.getSubmissions(studyId, assignmentId);
        console.log("[SubmissionList] 제출물 목록 조회 성공:", response);
        
        // 과제 정보와 제출물 목록 설정
        if (response && response.data) {
          setSubmissions(response.data);
        }
        
        // 과제 정보 가져오기
        const assignmentResponse = await assignmentService.getAssignmentById(studyId, assignmentId);
        setAssignment(assignmentResponse.data);
        
      } catch (err) {
        console.error("[SubmissionList] 제출물 목록 조회 실패:", err);
        setError("제출물 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [studyId, assignmentId, isManager, navigate]);
  
  // 제출물 상세 페이지로 이동
  const handleViewSubmission = (submissionId) => {
    navigate(`/studies/${studyId}/assignment/${assignmentId}/submissions/${submissionId}`);
  };
  
  // 과제 목록 페이지로 돌아가기
  const handleBack = () => {
    navigate(`/studies/${studyId}/assignment`);
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `제출: ${year}.${month}.${day} ${hours}:${minutes}PM`;
  };
  
  // 제출 상태를 한글로 변환하는 함수
  const getStatusText = (status) => {
    switch(status) {
      case 'SUBMITTED': return '제출완료';
      case 'SCORED': return '채점완료';
      case 'NOTSUBMITTED': return '미제출';
      default: return '미제출';
    }
  };
  
  if (isLoading) {
    return <div className="submission-loading">제출물 목록을 불러오는 중...</div>;
  }
  
  if (error) {
    return <div className="submission-error">{error}</div>;
  }
  
  return (
    <div className="submission-container">
      <header className="submission-header">
        <button className="back-button" onClick={handleBack}>← 목록으로</button>
        <h1 className="title">{assignment.assignmentTitle || '과제'}</h1>
      </header>
      
      <div className="submission-list-wrapper">
        <div className="submission-list-header">
          <div className="header-item name">이름</div>
          <div className="header-item status">상태</div>
          <div className="header-item score">점수</div>
        </div>
        
        {submissions.length === 0 ? (
          <div className="empty-submissions">제출된 과제가 없습니다.</div>
        ) : (
          <div className="submission-items">
            {submissions.map((submission) => (
              <div 
                key={submission.submissionId} 
                className="submission-item"
                onClick={() => handleViewSubmission(submission.submissionId)}
              >
                <div className="member-info">
                  <div className="name-email-container">
                    <div className="member-name">{submission.memberName}</div>
                    <div className="member-email">{submission.memberEmail}</div>
                  </div>
                  <div className="submission-date">{formatDate(submission.submissionCreatedAt)}</div>
                </div>
                
                <div className="submission-right">
                  <div className="status-text">
                    {getStatusText(submission.submissionStatus)}
                  </div>
                  
                  <div className="submission-score">
                    {submission.submissionStatus === 'SCORED' ? (
                      <div className="score-badge red">{submission.submissionScore}/{assignment.assignmentMaxPoint} pt</div>
                    ) : (
                      <div className="score-badge gray">---/{assignment.assignmentMaxPoint} pt</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="submission-actions">
        <Button variant="back" onClick={handleBack} />
      </div>
    </div>
  );
};

export default SubmissionList; 