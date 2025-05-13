import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assignmentService from "../../../services/assignment";
import Button from "../../../components/common/Button";
import ScoreDisplay from "../../../components/common/ScoreDisplay";
import {
  formatFileSize,
  getFileIcon,
  downloadFile,
  uploadFileToS3,
  extractUploadUrlFromResponse,
  handleFileUploadWithS3,
  isImageFile,
  getFilePreviewUrl,
} from "../../../utils/fileUtils";
import './AssignmentStyles.css';

const AssignmentDetail = () => {
  const { studyId, assignmentId } = useParams();
  console.log("[AssignmentDetail] URL 파라미터:", { studyId, assignmentId });
  
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [memberContext, setMemberContext] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [submissionContent, setSubmissionContent] = useState("");

  // 재제출 모드 상태
  const [isResubmitting, setIsResubmitting] = useState(false);
  // 유지할 기존 파일 ID 목록
  const [remainingFileIds, setRemainingFileIds] = useState([]);
  // 기존 제출 파일 목록
  const [existingFiles, setExistingFiles] = useState([]);

  // 업로드 진행 상태 추적
  const [uploadStatus, setUploadStatus] = useState([]);

  const MAX_CHAR_COUNT = 10000;

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      if (!studyId || !assignmentId) {
        console.error("[AssignmentDetail] studyId 또는 assignmentId가 없음:", { studyId, assignmentId });
        return;
      }

      setIsLoading(true);
      setError(null);

      console.log(`[AssignmentDetail] 과제 상세 정보 조회 시작: studyId=${studyId}, assignmentId=${assignmentId}`);

      try {
        const response = await assignmentService.getAssignmentById(
          studyId,
          assignmentId
        );
        console.log("[AssignmentDetail] 과제 상세 정보 조회 성공:", response);

        // API 응답 구조에 맞게 데이터 저장
        if (response.memberContext) {
          setMemberContext(response.memberContext);
        }

        // 과제 데이터는 response.data에 있음
        if (response.data) {
          // 데이터 검증 및 기본값 설정
          const assignmentData = {
            ...response.data,
            submissionStatus: response.data.submissionStatus || "NOTSUBMITTED",
            assignmentFiles: response.data.assignmentFiles || [],
            submissionFiles: response.data.submissionFiles || [],
            submissionContent: response.data.submissionContent || "",
            submissionScore: response.data.submissionScore || null,
            submissionComment: response.data.submissionComment || "",
          };

          setAssignment(assignmentData);
        } else {
          console.error("[AssignmentDetail] 과제 데이터가 없습니다:", response);
          setError("과제 정보를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("[AssignmentDetail] 과제 상세 정보 조회 실패:", err);
        setError("과제 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetail();
  }, [studyId, assignmentId]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles && selectedFiles.length > 0) {
      console.log(
        "파일 선택:",
        selectedFiles
          .map((file) => `${file.name} (${formatFileSize(file.size)})`)
          .join(", ")
      );
      setFiles(selectedFiles);
      setUploadProgress(0);
      setError(null);
      setUploadStatus([]);
    }
  };

  const handleSubmissionContentChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHAR_COUNT) {
      setSubmissionContent(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);
      setIsUploading(true);

      // 파일 업로드 관련 데이터 준비
      const newFiles = files; // 새로 추가한 파일들
      
      let response;
      
      if (isResubmitting) {
        // 재제출 모드: PUT 요청, remainingFileIds + newFileNames 사용
        console.log("[AssignmentDetail] 과제 재제출 준비");
        
        // 새로 추가한 파일 이름 목록 생성
        const newFileNames = newFiles.map(file => file.name);
        
        // API 문서 형식에 맞게 데이터 구성
        const resubmissionData = {
          submissionContent: submissionContent,
          remainingFileIds: remainingFileIds, // 사용자가 선택한 유지할 기존 파일 ID 목록
          newFileNames: newFileNames // 새로 제출할 파일 이름 목록
        };
        
        console.log("[AssignmentDetail] 재제출 데이터:", resubmissionData);
        console.log("[AssignmentDetail] 첨부 파일:", newFiles.map(f => `${f.name} (${formatFileSize(f.size)})`));
        console.log("[AssignmentDetail] 유지 파일 ID:", remainingFileIds);
        
        // 재제출 API 호출
        response = await assignmentService.resubmitAssignment(
          studyId,
          assignmentId,
          resubmissionData
        );
        
        console.log("[AssignmentDetail] 재제출 응답:", response);
      } else {
        // 신규 제출 모드: POST 요청, fileNames 사용
        console.log("[AssignmentDetail] 과제 신규 제출 준비");
        
        // 파일명 배열 생성
        const fileNames = newFiles.map((file) => file.name);
        
        const formattedData = {
          submissionContent: submissionContent,
          fileNames: fileNames,
        };
        
        console.log("[AssignmentDetail] 제출 데이터:", formattedData);
        console.log("[AssignmentDetail] 첨부 파일:", newFiles.map(f => `${f.name} (${formatFileSize(f.size)})`));
        
        // 신규 제출 API 호출
        response = await assignmentService.submitAssignment(
          studyId,
          assignmentId,
          formattedData
        );
        
        console.log("[AssignmentDetail] 제출 응답:", response);
      }
      
      // 파일 업로드 처리 (기존 로직 유지)
      if (newFiles.length > 0 && response) {
        console.log("[AssignmentDetail] 파일 업로드 시작, 파일 개수:", newFiles.length);
        
        try {
          // 파일 업로드 상태 트래킹을 위한 초기 상태 설정
          setUploadStatus(newFiles.map(file => ({
            fileName: file.name,
            progress: 0,
            status: 'uploading'
          })));
          
          // handleFileUploadWithS3 함수 사용 - 여러 파일 한번에 처리
          const uploadResults = await handleFileUploadWithS3(response, newFiles, 'uploadUrl');
          console.log("[AssignmentDetail] 파일 업로드 결과:", uploadResults);
          
          // 업로드 실패 발생 시 경고
          const failedUploads = uploadResults.filter(result => !result.success);
          if (failedUploads.length > 0) {
            console.warn("[AssignmentDetail] 일부 파일 업로드 실패:", failedUploads);
            setError("일부 파일 업로드에 실패했습니다. 다시 시도해 주세요.");
            return; // 성공 메시지 표시하지 않음
          }
          
          // 모든 파일 업로드 성공 시 상태 업데이트
          setUploadStatus(newFiles.map(file => ({
            fileName: file.name,
            progress: 100,
            status: 'success'
          })));
        } catch (uploadErr) {
          console.error("[AssignmentDetail] 파일 업로드 중 오류:", uploadErr);
          setError(`파일 업로드 중 오류가 발생했습니다: ${uploadErr.message || '알 수 없는 오류'}`);
          return; // 성공 메시지 표시하지 않음
        }
      }

      alert(isResubmitting ? "과제가 성공적으로 재제출되었습니다." : "과제가 성공적으로 제출되었습니다.");
      navigate(`/studies/${studyId}/assignment`);
    } catch (err) {
      console.error(isResubmitting ? "[AssignmentDetail] 과제 재제출 실패:" : "[AssignmentDetail] 과제 제출 실패:", err);
      setError(
        `과제 ${isResubmitting ? '재' : ''}제출에 실패했습니다: ${
          err.message || "알 수 없는 오류가 발생했습니다."
        }`
      );
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigate(`/studies/${studyId}/assignment`);
  };

  // 재제출 모드 활성화
  const handleResubmit = () => {
    setIsResubmitting(true);
    
    // 기존 제출 내용 불러오기
    if (assignment && assignment.submissionContent) {
      setSubmissionContent(assignment.submissionContent);
      setCharCount(assignment.submissionContent.length);
    } else {
      setSubmissionContent("");
      setCharCount(0);
    }
    
    // 기존 제출 파일 정보 설정 (나중에 재제출시 remainingFileIds로 사용)
    if (assignment && assignment.submissionFiles && assignment.submissionFiles.length > 0) {
      // 기존 파일 정보 저장
      setExistingFiles(assignment.submissionFiles);
      // 모든 기존 파일 ID를 유지 목록에 추가
      setRemainingFileIds(assignment.submissionFiles.map(file => file.fileId));
    } else {
      setExistingFiles([]);
      setRemainingFileIds([]);
    }
    
    setFiles([]);
    setUploadStatus([]);
  };

  // 재제출 취소
  const handleCancelResubmit = () => {
    setIsResubmitting(false);
    setFiles([]);
    setExistingFiles([]);
    setRemainingFileIds([]);
    setSubmissionContent("");
    setCharCount(0);
    setUploadStatus([]);
  };

  // 기존 파일 제거 처리
  const handleRemoveExistingFile = (fileId) => {
    // remainingFileIds에서 해당 파일 ID 제거
    setRemainingFileIds(prev => prev.filter(id => id !== fileId));
    // UI에서도 제거 (선택적)
    setExistingFiles(prev => prev.filter(file => file.fileId !== fileId));
  };

  // 파일 업로드 상태 확인
  const getUploadStatusForFile = (fileName) => {
    return (
      uploadStatus.find((item) => item.fileName === fileName) || {
        progress: 0,
        status: "pending",
      }
    );
  };

  if (isLoading && !assignment) {
    return <div className="loading-message">과제 정보를 불러오는 중...</div>;
  }

  if (error && !assignment) {
    return (
      <div className="error-container">
        <div>{error}</div>
        <button className="back-button" onClick={handleBack}>목록으로 돌아가기</button>
      </div>
    );
  }

  if (!assignment) {
    return <div className="error-container">과제 정보를 찾을 수 없습니다.</div>;
  }

  // 일자 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 정보 없음";

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

  // 제출 폼 렌더링 함수
  const renderSubmissionForm = () => (
    <>
      {/* 제출물 입력 영역 */}
      <div className="textarea-section">
        <textarea
          className="textarea"
          placeholder="제출물 내용을 입력하세요."
          value={submissionContent}
          onChange={handleSubmissionContentChange}
          maxLength={MAX_CHAR_COUNT}
        />
        <div className="char-count">
          {charCount}/{MAX_CHAR_COUNT}
        </div>
      </div>

      {/* 재제출 시 기존 파일 표시 */}
      {isResubmitting && existingFiles.length > 0 && (
        <div className="file-list">
          {existingFiles.map((file) => (
            <div className="file-item" key={file.fileId}>
              <div className="file-info-container">
                {isImageFile(file.fileName) && file.fileUrl && (
                  <div className="image-preview">
                    <img src={file.fileUrl} alt={file.fileName} />
                  </div>
                )}
                <div className="file-info">
                  <span className="file-name">{file.fileName}</span>
                </div>
              </div>
              <button
                className="remove-file-button"
                onClick={() => handleRemoveExistingFile(file.fileId)}
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 파일 첨부 영역 */}
      <div className="attachment-section">
        <h3 className="section-subtitle">첨부파일</h3>
        <div className="file-upload-container">
          {files.length > 0 ? (
            <div className="file-list">
              {files.map((file, index) => {
                const fileStatus = getUploadStatusForFile(file.name);
                return (
                  <div className="file-item" key={index} data-status={fileStatus.status}>
                    <div className="file-icon">{getFileIcon(file.name)}</div>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-info-row">
                        <span className="file-size">{formatFileSize(file.size)}</span>
                        {fileStatus.status === "uploading" &&
                          fileStatus.progress > 0 && (
                            <div className="file-upload-progress">
                              <div className="file-progress-bar" style={{width: `${fileStatus.progress}%`}}></div>
                            </div>
                          )}
                        {fileStatus.status === "error" && (
                          <div className="file-error-message">
                            {fileStatus.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="remove-file-button"
                      onClick={() =>
                        setFiles(files.filter((_, i) => i !== index))
                      }
                      disabled={isUploading}
                      type="button"
                    >
                      ✕
                    </button>
                    {isImageFile(file) && (
                      <button
                        className="preview-icon-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const previewUrl = URL.createObjectURL(file);
                          window.open(previewUrl);
                        }}
                        title="이미지 미리보기"
                        type="button"
                      >
                        👁️
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="file-upload-box">
              <label className="file-input-label">
                <input
                  className="file-input"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                  disabled={isUploading}
                />
                <div className="upload-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 18V6"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 11L12 6L17 11"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 18H4"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="upload-text">
                  파일을 클릭하여 추가하거나
                  <br />
                  여기에 드래그하세요
                </div>
              </label>
            </div>
          )}

          {files.length > 0 && (
            <div className="add-more-files-button">
              <label className="file-input-label">
                <input
                  className="file-input"
                  type="file"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files);
                    setFiles([...files, ...newFiles]);
                  }}
                  multiple
                  accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                  disabled={isUploading}
                />
                + 파일 추가
              </label>
            </div>
          )}
        </div>

        {/* 전체 업로드 진행률 */}
        {isUploading && (
          <div className="progress-container">
            <div className="progress-bar" style={{width: `${uploadProgress}%`}}></div>
            <div className="progress-text">{uploadProgress}% 업로드 중...</div>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && <div className="error-message">{error}</div>}

      {/* 버튼 영역 */}
      <div className="buttons-row">
        <Button
          variant="submit"
          onClick={handleSubmit}
          disabled={
            isLoading || 
            (files.length === 0 && submissionContent.trim() === "" && remainingFileIds.length === 0)
          }
          label={isResubmitting ? "다시 제출" : "제출"}
        />
        <Button
          variant="back"
          onClick={isResubmitting ? handleCancelResubmit : handleBack}
        />
      </div>
    </>
  );

  // 페이지 타이틀 결정
  const getPageTitle = () => {
    if (isResubmitting) return "다시 제출";

    switch (assignment.submissionStatus) {
      case "NOTSUBMITTED":
        return "미제출";
      case "SUBMITTED":
        return "제출완료";
      case "SCORED":
        return "채점완료";
      default:
        return "";
    }
  };

  return (
    <div className="container">
      <div className="header">
        <button className="back-button" onClick={handleBack}>← 목록으로</button>
        <h1 className="title">{assignment.assignmentTitle}</h1>
      </div>
      
      <div className="assignment-info-header">
        <div className="assignment-status-section">
          <div className="page-status">{getPageTitle()}</div>
          <div className="due-date">마감: {formatDate(assignment.assignmentDueDate)}</div>
        </div>
        <ScoreDisplay 
          score={assignment.submissionStatus === "SCORED" ? assignment.submissionScore : null}
          maxPoint={assignment.assignmentMaxPoint}
        />
      </div>

      <div className="content">
        {/* 1. 지시사항 섹션 */}
        <div className="section">
          <h2 className="section-title">지시사항</h2>
          <p className="description">{assignment.assignmentContent}</p>

          {/* 첨부 파일 목록 (assignmentFiles) */}
          {assignment.assignmentFiles &&
            assignment.assignmentFiles.length > 0 && (
              <div className="files-container">
                <h3 className="section-subtitle">첨부파일</h3>
                <div className="files-list">
                  {assignment.assignmentFiles.map((file, index) => (
                    <div className="file-download-item" key={index}>
                      <div className="file-info-row">
                        <div className="file-icon">{getFileIcon(file.fileName)}</div>
                        <div className="file-details">
                          <div className="file-name">{file.fileName}</div>
                        </div>
                        {isImageFile(file.fileName) && file.fileUrl && (
                          <button 
                            className="preview-button"
                            onClick={() => window.open(file.fileUrl, '_blank')}
                            title="이미지 미리보기"
                            type="button"
                          >
                            미리보기
                          </button>
                        )}
                        <button
                          className="download-button"
                          onClick={() =>
                            downloadFile(file.fileUrl, file.fileName)
                          }
                          type="button"
                        >
                          다운로드
                        </button>
                      </div>
                      {isImageFile(file.fileName) && file.fileUrl && (
                        <div className="image-preview-container">
                          <img className="image-preview-full" src={file.fileUrl} alt={file.fileName} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* 2. 제출물 섹션 - 상태에 따라 다른 UI */}
        <div className="section">
          {isResubmitting ? (
            <>
              <h2 className="section-title">제출물</h2>
              {renderSubmissionForm()}
            </>
          ) : assignment.submissionStatus === "NOTSUBMITTED" ? (
            <>
              <h2 className="section-title">제출물</h2>
              {renderSubmissionForm()}
            </>
          ) : assignment.submissionStatus === "SUBMITTED" ? (
            <>
              <h2 className="section-title">제출물</h2>
              <div className="submission-row">
                <div className="submission-label">
                  제출: {formatDate(assignment.submissionDate)}
                </div>
              </div>

              {/* 제출 내용 표시 */}
              {assignment.submissionContent && (
                <div className="submission-content-section">
                  <h3 className="section-subtitle">제출 내용</h3>
                  <div className="submission-content-text">
                    {assignment.submissionContent}
                  </div>
                </div>
              )}

              {/* 제출 파일 표시 */}
              {assignment.submissionFiles && assignment.submissionFiles.length > 0 && (
                <div className="files-container">
                  <h3 className="section-subtitle">제출 파일</h3>
                  <div className="files-list">
                    {assignment.submissionFiles.map((file, index) => (
                      <div className="file-download-item" key={index}>
                        <div className="file-info-row">
                          <div className="file-icon">{getFileIcon(file.fileName)}</div>
                          <div className="file-details">
                            <div className="file-name">{file.fileName}</div>
                          </div>
                          {isImageFile(file.fileName) && file.fileUrl && (
                            <button 
                              className="preview-button"
                              onClick={() => window.open(file.fileUrl, '_blank')}
                              title="이미지 미리보기"
                              type="button"
                            >
                              미리보기
                            </button>
                          )}
                          <button
                            className="download-button"
                            onClick={() =>
                              downloadFile(file.fileUrl, file.fileName)
                            }
                            type="button"
                          >
                            다운로드
                          </button>
                        </div>
                        {isImageFile(file.fileName) && file.fileUrl && (
                          <div className="image-preview-container">
                            <img className="image-preview-full" src={file.fileUrl} alt={file.fileName} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 코멘트 섹션 (있을 경우에만 표시) */}
              {assignment.submissionComment && (
                <div className="feedback-section">
                  <h3 className="section-subtitle">코멘트</h3>
                  <div className="feedback-content">
                    {assignment.submissionComment}
                  </div>
                </div>
              )}

              <div className="buttons-row">
                <Button 
                  variant="reSubmit" 
                  onClick={handleResubmit}
                  label="다시 제출"
                />
              </div>
            </>
          ) : (
            assignment.submissionStatus === "SCORED" && (
              <>
                <h2 className="section-title">제출물</h2>
                <div className="submission-row">
                  <div className="submission-label">
                    제출: {formatDate(assignment.submissionDate)}
                  </div>
                </div>

                {/* 제출 내용 표시 */}
                {assignment.submissionContent && (
                  <div className="submission-content-section">
                    <h3 className="section-subtitle">제출 내용</h3>
                    <div className="submission-content-text">
                      {assignment.submissionContent}
                    </div>
                  </div>
                )}

                {/* 제출 파일 표시 */}
                {assignment.submissionFiles && assignment.submissionFiles.length > 0 && (
                  <div className="files-container">
                    <h3 className="section-subtitle">제출 파일</h3>
                    <div className="files-list">
                      {assignment.submissionFiles.map((file, index) => (
                        <div className="file-download-item" key={index}>
                          <div className="file-info-row">
                            <div className="file-icon">{getFileIcon(file.fileName)}</div>
                            <div className="file-details">
                              <div className="file-name">{file.fileName}</div>
                            </div>
                            {isImageFile(file.fileName) && file.fileUrl && (
                              <button 
                                className="preview-button"
                                onClick={() => window.open(file.fileUrl, '_blank')}
                                title="이미지 미리보기"
                                type="button"
                              >
                                미리보기
                              </button>
                            )}
                            <button
                              className="download-button"
                              onClick={() =>
                                downloadFile(file.fileUrl, file.fileName)
                              }
                              type="button"
                            >
                              다운로드
                            </button>
                          </div>
                          {isImageFile(file.fileName) && file.fileUrl && (
                            <div className="image-preview-container">
                              <img className="image-preview-full" src={file.fileUrl} alt={file.fileName} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 코멘트 섹션 (있을 경우에만 표시) */}
                {assignment.submissionComment && (
                  <div className="feedback-section">
                    <h3 className="section-subtitle">코멘트</h3>
                    <div className="feedback-content">
                      {assignment.submissionComment}
                    </div>
                  </div>
                )}

                <div className="buttons-row">
                  <Button 
                    variant="reSubmit" 
                    onClick={handleResubmit}
                    label="다시 제출"
                  />
                  <Button 
                    variant="back" 
                    onClick={handleBack}
                    label="닫기"
                  />
                </div>
                <div></div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
