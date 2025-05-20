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
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { IoAttach } from "react-icons/io5";

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

  // 파일 다운로드 처리 (AssignmentDetail.jsx와 동일하게 수정)
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

  // 이미지 미리보기 확대 처리 (모든 브라우저에서 작동하도록 수정)
  const handlePreview = (url, fileName) => {
    if (!url) {
      console.error("파일 URL이 없습니다.");
      return;
    }

    // 새 창에서 URL 직접 열기
    window.open(url, "_blank");
  };

  // 취소 처리
  const handleCancel = () => {
    navigate(`/studies/${studyId}/assignments/${assignmentId}/submissions`);
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

    return `${year}.${month}.${day} ${hours}:${minutes}PM`;
  };

  // 파일 아이템 렌더링 함수
  const renderFileItem = (file, index) => {
    // 다양한 형태의 파일 객체 처리
    let fileUrl = "";
    let fileName = "";
    let fileId = "";

    // File 객체인 경우
    if (file instanceof File) {
      fileUrl = URL.createObjectURL(file);
      fileName = file.name;
    }
    // fileUrl과 fileName을 직접 가진 객체
    else if (file.fileUrl && file.fileName) {
      fileUrl = file.fileUrl;
      fileName = file.fileName;
      fileId = file.fileId;
    }
    // url과 name을 가진 객체
    else if (file.url && file.name) {
      fileUrl = file.url;
      fileName = file.name;
    }
    // file 속성 내에 객체가 있는 경우 (API 응답 구조에 맞게 처리)
    else if (file.file && typeof file.file === "object") {
      if (file.file.fileUrl) fileUrl = file.file.fileUrl;
      if (file.file.fileName) fileName = file.file.fileName;
      if (file.file.fileId) fileId = file.file.fileId;
    }
    // API에서 받은 다른 형태 처리
    else if (typeof file === "object") {
      // 다른 가능한 속성 조합 확인
      if (file.fileId) fileId = file.fileId;
      if (file.fileName) fileName = file.fileName;
      if (file.fileUrl) fileUrl = file.fileUrl;
    }

    console.log(`파일 정보 (${index}):`, {
      fileUrl,
      fileName,
      fileId,
      originalFile: file,
    });

    if (!fileUrl || !fileName) {
      console.error("파일 형식을 처리할 수 없음:", file);
      return null;
    }

    // 이미지 파일 여부 확인
    const isImage = isImageFile(fileName);

    return (
      <div key={index} className="file-item">
        <div className="file-info-row">
          <div className="file-icon">{getFileIcon(fileName)}</div>
          {isImage && (
            <div className="file-preview">
              <img src={fileUrl} alt={fileName} />
            </div>
          )}
          <div className="file-details">
            <div className="file-name">{fileName}</div>
          </div>
          <div className="file-actions">
            {isImage && (
              <button
                className="preview-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(fileUrl, fileName);
                }}>
                미리보기
              </button>
            )}
            <button
              className="download-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(fileUrl, fileName);
              }}>
              다운로드
            </button>
          </div>
        </div>
        {isImage && (
          <div className="image-preview-container">
            <img
              className="image-preview-thumbnail"
              src={fileUrl}
              alt={fileName}
            />
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="submission-loading">제출물 정보를 불러오는 중...</div>
    );
  }

  if (error) {
    return <div className="submission-error">{error}</div>;
  }

  if (!submission || !assignment) {
    return (
      <div className="submission-error">
        제출물 또는 과제 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="submission-detail-container">
      <header className="submission-detail-header">
        <button className="back-button" onClick={handleCancel}>
          ← 목록으로
        </button>
        <h1 className="title">
          {submission.memberName}{" "}
          <span className="email">{submission.memberEmail}</span>
        </h1>
        <p className="submission-time">
          제출: {formatDate(submission.submissionCreatedAt)}
        </p>
      </header>

      {/* 지시사항 토글 섹션 */}
      <div className="instructions-section">
        <div
          className="instructions-toggle"
          onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}>
          <div className="toggle-header">
            <h2 className="toggle-title">지시사항</h2>
            <span className="toggle-icon">
              {isInstructionsOpen ? <IoChevronUp /> : <IoChevronDown />}
            </span>
          </div>
        </div>

        {isInstructionsOpen && (
          <div className="instructions-content">
            <h3 className="instructions-title">{assignment.assignmentTitle}</h3>

            {assignment.assignmentContent && (
              <div className="instructions-text">
                {assignment.assignmentContent}
              </div>
            )}

            {assignment.assignmentFiles &&
              assignment.assignmentFiles.length > 0 && (
                <div className="instructions-files">
                  <h3 className="files-title">
                    <IoAttach className="file-icon" /> 첨부파일 (
                    {assignment.assignmentFiles.length})
                  </h3>
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

      {/* 제출물 내용 */}
      <div className="student-submission-section">
        <div className="section-header">
          <h2 className="section-title">제출완료</h2>
        </div>

        <div className="submission-content-wrapper">
          {submission.submissionContent && (
            <div className="submission-content-box">
              <div className="submission-content-text">
                {submission.submissionContent}
              </div>
            </div>
          )}

          {/* 제출물 첨부파일 */}
          {submission.submissionFiles &&
            submission.submissionFiles.length > 0 && (
              <div className="submission-files-section">
                <h3 className="files-title">
                  <IoAttach className="file-icon" /> 첨부파일 (
                  {submission.submissionFiles.length})
                </h3>
                <div className="files-list">
                  {submission.submissionFiles.map((file, index) =>
                    renderFileItem(file, index)
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* 채점 섹션 */}
      <div className="grading-section">
        <h2 className="grading-title">채점하기</h2>

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

        <div className="buttons-container">
          <Button variant="store" type="submit" disabled={isLoading} />
          <Button variant="back" type="button" onClick={handleCancel} />
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;
