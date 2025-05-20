import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStudyRole from "../../../hooks/useStudyRole";
import assignmentService from "../../../services/assignment";
import Button from "../../../components/common/Button";
import {
  isImageFile,
  downloadFile,
  getFileIcon,
} from "../../../utils/fileUtils";
import "./SubmissionDetail.css";
import "./AssignmentStyles.css"; // AssignmentDetail 스타일 공유

const SubmissionDetail = () => {
  const { studyId, assignmentId, submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isManager } = useStudyRole();
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(true);
  const [scoreError, setScoreError] = useState("");

  // 컴포넌트 마운트 시 제출물 상세 정보 조회
  useEffect(() => {
    // 관리자가 아닌 경우 접근 제한
    if (!isManager) {
      alert("관리자만 접근할 수 있는 페이지입니다.");
      navigate(`/studies/${studyId}/assignments`);
      return;
    }

    const fetchSubmissionDetail = async () => {
      try {
        setIsLoading(true);

        // 제출물 상세 정보 가져오기
        try {
          const submissionResponse = await assignmentService.getSubmissionById(
            studyId,
            assignmentId,
            submissionId
          );
          if (submissionResponse && submissionResponse.data) {
            const data = submissionResponse.data;
            console.log("[SubmissionDetail] 제출물 상세 조회 성공:", data);

            // 과제 및 제출물 정보 설정
            setAssignment({
              assignmentId: data.assignmentId || assignmentId,
              assignmentTitle: data.assignmentTitle || "",
              assignmentContent: data.assignmentContent || "",
              assignmentDueDate: data.assignmentDueDate || "",
              assignmentMaxPoint: data.assignmentMaxPoint || 100,
              assignmentFiles: data.assignmentFiles || [],
            });

            setSubmission({
              submissionId: parseInt(submissionId),
              memberId: data.memberId,
              memberName: data.memberName || "사용자",
              memberEmail: data.memberEmail || "",
              submissionCreatedAt: data.submissionCreatedAt,
              submissionContent: data.submissionContent || "",
              submissionFiles: data.submissionFiles || [],
              submissionScore: data.submissionScore,
              submissionComment: data.submissionComment || "",
              submissionStatus: data.submissionStatus,
            });

            // 기존 채점 정보가 있으면 설정
            setScore(data.submissionScore || "");
            setComment(data.submissionComment || "");
            return;
          }
        } catch (err) {
          console.warn(
            "[SubmissionDetail] 제출물 상세 조회 API 실패, 대체 방법 시도:",
            err
          );
        }

        // API 호출 실패 시 대체 방법으로 데이터 조회
        const assignmentResponse = await assignmentService.getAssignmentById(
          studyId,
          assignmentId
        );
        if (assignmentResponse && assignmentResponse.data) {
          const data = assignmentResponse.data;

          setAssignment({
            assignmentId: data.assignmentId || assignmentId,
            assignmentTitle: data.assignmentTitle || "",
            assignmentContent: data.assignmentContent || "",
            assignmentDueDate: data.assignmentDueDate || "",
            assignmentMaxPoint: data.assignmentMaxPoint || 100,
            assignmentFiles: data.assignmentFiles || [],
          });

          if (data.submissionContent !== undefined) {
            setSubmission({
              submissionId: parseInt(submissionId),
              memberId: data.memberId,
              memberName: data.memberName || "사용자",
              memberEmail: data.memberEmail || "",
              submissionCreatedAt: data.submissionCreatedAt,
              submissionContent: data.submissionContent || "",
              submissionFiles: data.submissionFiles || [],
              submissionScore: data.submissionScore,
              submissionComment: data.submissionComment || "",
              submissionStatus: data.submissionStatus,
            });

            setScore(data.submissionScore || "");
            setComment(data.submissionComment || "");
          } else {
            // 제출물 목록에서 찾기
            const submissionsResponse = await assignmentService.getSubmissions(
              studyId,
              assignmentId
            );
            if (submissionsResponse && submissionsResponse.data) {
              const foundSubmission = submissionsResponse.data.find(
                (s) => s.submissionId === parseInt(submissionId)
              );
              if (foundSubmission) {
                setSubmission(foundSubmission);
                setScore(foundSubmission.submissionScore || "");
                setComment(foundSubmission.submissionComment || "");
              } else {
                setError("제출물을 찾을 수 없습니다.");
              }
            }
          }
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

  // 점수 입력 변경 처리
  const handleScoreChange = (e) => {
    const value = e.target.value;
    setScore(value);

    // 최대 포인트 검증
    const maxPoint = assignment?.assignmentMaxPoint || 100;
    if (parseInt(value) > maxPoint) {
      setScoreError(`최대 ${maxPoint}점까지 입력 가능합니다.`);
    } else if (parseInt(value) < 0) {
      setScoreError("0점 이상 입력해주세요.");
    } else {
      setScoreError("");
    }
  };

  // 채점 저장 처리
  const handleSaveGrade = async () => {
    if (!score) {
      alert("점수를 입력해주세요.");
      return;
    }

    // 최대 포인트 체크
    const maxPoint = assignment?.assignmentMaxPoint || 100;
    if (parseInt(score) > maxPoint) {
      alert(`최대 ${maxPoint}점까지 입력 가능합니다.`);
      return;
    }

    if (parseInt(score) < 0) {
      alert("0점 이상 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 채점 데이터 준비
      const gradeData = {
        submissionScore: parseInt(score),
        submissionComment: comment,
      };

      // API 호출
      await assignmentService.scoreSubmission(
        studyId,
        assignmentId,
        submissionId,
        gradeData
      );

      alert("채점이 완료되었습니다.");
      navigate(`/studies/${studyId}/assignments/${assignmentId}/submissions`);
    } catch (err) {
      console.error("[SubmissionDetail] 채점 저장 실패:", err);
      alert("채점 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 파일 다운로드 처리
  const handleDownload = (url, fileName) => {
    if (!url) {
      console.error("파일 URL이 없습니다.");
      return;
    }

    console.log(`파일 다운로드 시도: ${fileName} (${url})`);

    try {
      // fileUtils.js의 downloadFile 함수 직접 호출
      downloadFile(url, fileName);
    } catch (error) {
      console.error("파일 다운로드 중 오류:", error);
      alert("파일 다운로드에 실패했습니다. 다시 시도해 주세요.");

      // 실패 시 직접 URL 열기 시도
      window.open(url, "_blank");
    }
  };

  // 취소 처리
  const handleCancel = () => {
    navigate(`/studies/${studyId}/assignments/${assignmentId}/submissions`);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);

      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return "날짜 형식 오류";
      }

      return `${date.getFullYear()}.${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("날짜 변환 오류:", error);
      return "날짜 변환 오류";
    }
  };

  if (isLoading) {
    return <div className="loading-message">제출물 정보를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div>{error}</div>
        <button className="back-button" onClick={handleCancel}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!submission || !assignment) {
    return <div className="error-container">제출물 또는 과제 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <div className="title-and-status">
          <h1 className="assignment-title">
            {submission.memberName}{" "}
            <span className="email">{submission.memberEmail}</span>
          </h1>
          <div className="assignment-status">채점하기</div>
        </div>
        <div className="points-and-deadline">
          <div className="assignment-deadline">
            <div className="deadline-info">
              <span>제출: {formatDate(submission.submissionCreatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="assignment-content">
        {/* 1. 지시사항 토글 섹션 */}
        <div className="toggle-section">
          <div className="toggle-header" onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}>
            <h2 className="toggle-title">지시사항</h2>
            <span className="toggle-icon">
              {isInstructionsOpen ? <IoChevronUp /> : <IoChevronDown />}
            </span>
          </div>
          
          {isInstructionsOpen && (
            <div className="toggle-content">
              <p className="description">{assignment.assignmentContent}</p>

              {/* 첨부 파일 목록 (assignmentFiles) */}
              {assignment.assignmentFiles &&
                assignment.assignmentFiles.length > 0 && (
                  <div className="files-container">
                    <h3 className="section-subtitle">첨부파일</h3>
                    <div className="files-list">
                      {assignment.assignmentFiles.map((file, index) => 
                        renderFileItem(file, index)
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* 2. 제출물 토글 섹션 */}
        <div className="toggle-section">
          <div className="toggle-header" onClick={() => setIsSubmissionOpen(!isSubmissionOpen)}>
            <h2 className="toggle-title">제출물</h2>
            <span className="toggle-icon">
              {isSubmissionOpen ? <IoChevronUp /> : <IoChevronDown />}
            </span>
          </div>
          
          {isSubmissionOpen && (
            <div className="toggle-content">
              <div className="submission-date">
                제출: {formatDate(submission.submissionCreatedAt)}
              </div>
              
              {/* 제출된 내용 표시 */}
              {submission.submissionContent && (
                <div className="submission-content-section">
                  <h3 className="content-title">제출 내용</h3>
                  <div className="content-text">
                    {submission.submissionContent}
                  </div>
                </div>
              )}
              
              {/* 제출 파일 목록 */}
              {submission.submissionFiles && submission.submissionFiles.length > 0 && (
                <div className="submission-files">
                  <h3 className="files-title">제출 파일</h3>
                  <div className="files-list">
                    {submission.submissionFiles.map((file, index) => 
                      renderFileItem(file, index)
                    )}
                  </div>
                </div>
              )}
              
              {/* 채점 섹션 */}
              <div className="submission-content">
                <h3 className="section-title">채점하기</h3>

                <div className="max-point-info">
                  최대 포인트: {assignment.assignmentMaxPoint} pt
                </div>

                <div className="score-input-section">
                  <label htmlFor="score-input">포인트:</label>
                  <input
                    id="score-input"
                    type="number"
                    min="0"
                    max={assignment.assignmentMaxPoint || 100}
                    value={score}
                    onChange={handleScoreChange}
                    placeholder={`0-${assignment.assignmentMaxPoint || 100}`}
                  />
                  {scoreError && <div className="score-error">{scoreError}</div>}
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

                <div className="buttons-row">
                  <Button
                    variant="submit"
                    onClick={handleSaveGrade}
                    disabled={isSubmitting || scoreError}
                    label="저장"
                  />
                  <Button 
                    variant="back" 
                    onClick={handleCancel}
                    label="닫기"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;
