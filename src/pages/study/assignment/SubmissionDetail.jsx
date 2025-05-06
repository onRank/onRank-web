import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStudyRole from '../../../hooks/useStudyRole';
import assignmentService from '../../../services/assignment';
import Button from '../../../components/common/Button';
import './SubmissionDetail.css';

const SubmissionDetail = () => {
  const { studyId, assignmentId, submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isManager } = useStudyRole();
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 컴포넌트 마운트 시 제출물 상세 정보 조회
  useEffect(() => {
    // 관리자가 아닌 경우 접근 제한
    if (!isManager) {
      alert("관리자만 접근할 수 있는 페이지입니다.");
      navigate(`/studies/${studyId}/assignment`);
      return;
    }
    
    const fetchSubmissionDetail = async () => {
      try {
        setIsLoading(true);
        // API 호출을 통해 제출물 상세 정보 조회
        // TODO: 실제 API 구현 시 변경 필요
        const response = await assignmentService.getSubmissions(studyId, assignmentId);
        
        if (response && response.data) {
          const foundSubmission = response.data.find(s => s.submissionId === parseInt(submissionId));
          if (foundSubmission) {
            setSubmission(foundSubmission);
            setScore(foundSubmission.submissionScore || '');
            setComment(foundSubmission.submissionComment || '');
          } else {
            setError("제출물을 찾을 수 없습니다.");
          }
        }
        
        // 과제 정보 가져오기
        const assignmentResponse = await assignmentService.getAssignmentById(studyId, assignmentId);
        if (assignmentResponse && assignmentResponse.data) {
          setAssignment(assignmentResponse.data);
        }
        
      } catch (err) {
        console.error("[SubmissionDetail] 제출물 상세 조회 실패:", err);
        setError("제출물 상세 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubmissionDetail();
  }, [studyId, assignmentId, submissionId, isManager, navigate]);
  
  // 채점 저장 처리
  const handleSaveGrade = async () => {
    if (!score) {
      alert("점수를 입력해주세요.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 채점 데이터 준비
      const gradeData = {
        submissionScore: parseInt(score),
        submissionComment: comment
      };
      
      // API 호출
      await assignmentService.scoreSubmission(studyId, assignmentId, submissionId, gradeData);
      
      alert("채점이 완료되었습니다.");
      navigate(`/studies/${studyId}/assignment/${assignmentId}/submissions`);
      
    } catch (err) {
      console.error("[SubmissionDetail] 채점 저장 실패:", err);
      alert("채점 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 취소 처리
  const handleCancel = () => {
    navigate(`/studies/${studyId}/assignment/${assignmentId}/submissions`);
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
    
    return `${year}.${month}.${day} ${hours}:${minutes}PM`;
  };
  
  if (isLoading) {
    return <div className="submission-loading">제출물 정보를 불러오는 중...</div>;
  }
  
  if (error) {
    return <div className="submission-error">{error}</div>;
  }
  
  if (!submission || !assignment) {
    return <div className="submission-error">제출물 또는 과제 정보를 찾을 수 없습니다.</div>;
  }
  
  return (
    <div className="submission-detail-container">
      <header className="submission-detail-header">
        <button className="back-button" onClick={handleCancel}>← 목록으로</button>
        <h1 className="title">{submission.memberName} <span className="email">{submission.memberEmail}</span></h1>
        <p className="submission-time">제출: {formatDate(submission.submissionCreatedAt)}</p>
      </header>
      
      <div className="submission-content-section">
        {submission.submissionContent && (
          <div className="submission-content-box">
            <h2 className="section-title">제출완료</h2>
            <div className="submission-content-text">{submission.submissionContent}</div>
          </div>
        )}
        
        {submission.attachmentFiles && submission.attachmentFiles.length > 0 && (
          <div className="attachment-files-section">
            <h2 className="section-title">첨부파일</h2>
            <div className="attachment-files-list">
              {submission.attachmentFiles.map((file, index) => (
                <div key={index} className="attachment-file-item">
                  <span className="file-name">{file.fileName}</span>
                  <div className="file-actions">
                    <button className="preview-button">미리보기</button>
                    <button className="download-button">다운로드</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="grading-section">
        <h2 className="section-title">채점하기</h2>
        
        <div className="max-point-info">
          최대 포인트: {assignment.assignmentMaxPoint} pt
        </div>
        
        <div className="score-input-section">
          <label htmlFor="score-input">포인트:</label>
          <input
            id="score-input"
            type="number"
            min="0"
            max={assignment.assignmentMaxPoint}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder={`0-${assignment.assignmentMaxPoint}`}
          />
        </div>
        
        <div className="comment-input-section">
          <label htmlFor="comment-input">코멘트:</label>
          <textarea
            id="comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="코멘트를 입력하세요 (선택사항)"
            rows={4}
          />
        </div>
      </div>
      
      <div className="submission-detail-actions">
        <Button variant="back" onClick={handleCancel} />
        <Button variant="store" onClick={handleSaveGrade} disabled={isSubmitting} />
      </div>
    </div>
  );
};

export default SubmissionDetail; 