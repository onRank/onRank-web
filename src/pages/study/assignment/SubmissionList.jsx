import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStudyRole from "../../../hooks/useStudyRole";
import assignmentService from "../../../services/assignment";
import Button from "../../../components/common/Button";
import ScoreDisplay from "../../../components/common/ScoreDisplay";
import "./SubmissionList.css";
import "./AssignmentStyles.css"; // AssignmentDetail 스타일 공유

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
      navigate(`/studies/${studyId}/assignments`);
      return;
    }

    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const response = await assignmentService.getSubmissions(
          studyId,
          assignmentId
        );
        console.log("[SubmissionList] 제출물 목록 조회 성공:", response);

        // 과제 정보와 제출물 목록 설정
        if (response && response.data) {
          setSubmissions(response.data);
        }

        // 과제 정보 가져오기
        const assignmentResponse = await assignmentService.getAssignmentById(
          studyId,
          assignmentId
        );
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
  const handleViewSubmission = (submission) => {
    // 미제출 상태인 경우 상세 페이지로 이동하지 않음
    if (submission.submissionStatus === "NOTSUBMITTED") {
      return;
    }
    
    navigate(
      `/studies/${studyId}/assignments/${assignmentId}/submissions/${submission.submissionId}`
    );
  };

  // 과제 목록 페이지로 돌아가기
  const handleBack = () => {
    navigate(`/studies/${studyId}/assignments`);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `제출: ${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 제출 상태를 한글로 변환하는 함수
  const getStatusText = (status, score) => {
    // 점수가 있으면 채점완료 상태로 간주
    if (score) {
      return "채점완료";
    }

    switch (status) {
      case "SUBMITTED":
        return "제출완료";
      case "SCORED":
        return "채점완료";
      case "NOTSUBMITTED":
        return "미제출";
      default:
        return "미제출";
    }
  };

  if (isLoading) {
    return (
      <div className="loading-message">제출물 목록을 불러오는 중...</div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div>{error}</div>
        <button className="back-button" onClick={handleBack}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <div className="title-and-status">
          <h1 className="assignment-title">{assignment.assignmentTitle || "과제"}</h1>
          <div className="assignment-status">채점 관리</div>
        </div>
      </div>

      <div className="assignment-content">
        <div className="toggle-section">
          <div className="toggle-header">
            <h2 className="toggle-title">제출 목록</h2>
          </div>
          
          <div className="toggle-content">
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
                      className={`submission-item ${submission.submissionStatus === "NOTSUBMITTED" ? "not-submitted" : ""}`}
                      onClick={() => handleViewSubmission(submission)}>
                      <div className="member-info">
                        <div className="name-email-container">
                          <div className="member-name">{submission.memberName}</div>
                          <div className="member-email">{submission.memberEmail}</div>
                        </div>
                        <div className="submission-date">
                          {formatDate(submission.submissionCreatedAt)}
                        </div>
                      </div>

                      <div className="submission-right">
                        <div className={`status-tag status-${submission.submissionStatus ? submission.submissionStatus.toLowerCase() : 'notsubmitted'}`}>
                          {getStatusText(
                            submission.submissionStatus,
                            submission.submissionScore
                          )}
                        </div>

                        <div className="submission-score">
                          <ScoreDisplay
                            score={submission.submissionScore}
                            maxPoint={assignment.assignmentMaxPoint}
                            className="submission-score-display"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="buttons-row">
          <Button variant="back" onClick={handleBack} />
        </div>
      </div>
    </div>
  );
};

export default SubmissionList;
