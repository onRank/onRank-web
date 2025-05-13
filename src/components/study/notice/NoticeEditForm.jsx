import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";
import FileCard from "../../study/FileCard";

function NoticeEditForm({
  studyId,
  noticeId,
  initialData,
  onCancel,
  onSaveComplete,
}) {
  const { editNotice, deleteNotice } = useNotice();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 콘솔에 초기 데이터 기록
  useEffect(() => {
    console.log("[NoticeEditForm] initialData:", initialData);
  }, [initialData]);

  const [noticeTitle, setNoticeTitle] = useState(
    initialData?.noticeTitle || ""
  );
  const [noticeContent, setNoticeContent] = useState(
    initialData?.noticeContent || ""
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  // 남겨둘 파일 ID 배열 상태 처리 개선
  const [remainingFileIds, setRemainingFileIds] = useState([]);

  // 초기 파일 데이터 설정
  useEffect(() => {
    if (initialData) {
      // API 응답 구조에 맞게 파일 ID 추출
      const fileIds = [];
      
      // files 배열이 있는 경우
      if (initialData.files && Array.isArray(initialData.files)) {
        initialData.files.forEach(file => {
          if (file.fileId) {
            fileIds.push(file.fileId);
          }
        });
      }
      
      console.log("[NoticeEditForm] 초기 파일 IDs:", fileIds);
      setRemainingFileIds(fileIds);
    }
  }, [initialData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const maxLength = 10000;
  const [isDragging, setIsDragging] = useState(false);

  // 파일 선택 창 열기 핸들러
  const handleOpenFileDialog = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 이미 선택된 파일과 중복 확인 (새로 추가하는 파일)
    const newFiles = files.filter(
      (file) => !selectedFiles.some((f) => f.name === file.name)
    );

    // 파일 크기 제한 (10MB)
    const oversizedFiles = newFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setSubmitError(
        `다음 파일이 10MB를 초과합니다: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    // 선택된 파일 추가
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    // 파일 선택 후 input 초기화
    e.target.value = "";
  };

  // 선택된 새 파일 제거 핸들러
  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  // 기존 파일 제거 핸들러 - 단순화
  const handleRemoveExistingFile = (fileId) => {
    // fileId를 remainingFileIds에서 제거
    setRemainingFileIds((prev) => prev.filter((id) => id !== fileId));
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // 이미 선택된 파일과 중복 확인 (새로 추가하는 파일)
    const newFiles = files.filter(
      (file) => !selectedFiles.some((f) => f.name === file.name)
    );

    // 기존 파일과 이름 중복 확인 (수정 모드에서)
    const duplicateWithExisting = newFiles.filter((file) =>
      remainingFileIds.some((id) => id === file.name)
    );

    if (duplicateWithExisting.length > 0) {
      setSubmitError(
        `이미 존재하는 파일이 있습니다: ${duplicateWithExisting
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    // 파일 크기 제한 (10MB)
    const oversizedFiles = newFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setSubmitError(
        `다음 파일이 10MB를 초과합니다: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    // 선택된 파일 추가
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  // 저장 핸들러
  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    // 입력 검증
    if (!noticeTitle.trim()) {
      setSubmitError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedNotice = {
        noticeTitle,
        noticeContent,
        remainingFileIds: remainingFileIds,
        newFileNames: selectedFiles.map((file) => file.name),
      };
      
      console.log("[NoticeEditForm] 수정 요청 데이터:", updatedNotice);
      console.log("[NoticeEditForm] 새 파일 수:", selectedFiles.length);

      const result = await editNotice(
        studyId,
        parseInt(noticeId, 10),
        updatedNotice,
        selectedFiles
      );

      if (!result.success) {
        setSubmitError(
          result.message || "공지사항 수정 중 오류가 발생했습니다."
        );
        setIsSubmitting(false);
        return;
      }

      // 성공 시 상세 보기 페이지로 리다이렉트
      if (onSaveComplete) {
        onSaveComplete();
      } else {
        // 콜백 없을 경우 직접 이동
        navigate(`/studies/${studyId}/notices/${noticeId}`);
      }
    } catch (error) {
      console.error("공지사항 수정 중 오류:", error);
      setSubmitError("공지사항 수정 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deleteNotice(studyId, parseInt(noticeId, 10));
      if (result.success) {
        navigate(`/studies/${studyId}/notices`);
      } else {
        setSubmitError(
          result.message || "공지사항 삭제 중 오류가 발생했습니다."
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      setSubmitError("공지사항 삭제 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner />;
  }

  const styles = {
    formContainer: {
      width: "100%",
    },
    inputGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "14px",
    },
    textarea: {
      width: "100%",
      minHeight: "280px",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      resize: "none",
      fontSize: "14px",
    },
    charCount: {
      textAlign: "right",
      fontSize: "12px",
      color: "#888",
      marginTop: "4px",
    },
    fileUploadRow: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "8px",
      marginBottom: "16px",
    },
    fileList: {
      marginTop: "16px",
      padding: "8px 12px",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      fontSize: "14px",
    },
    fileItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "8px",
    },
    fileIcon: {
      marginRight: "8px",
      color: "#666",
    },
    errorMessage: {
      backgroundColor: "#fdecea",
      color: "#e74c3c",
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "16px",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "24px",
    },
    leftButtons: {
      display: "flex",
      gap: "12px",
    },
    noFiles: {
      color: "#666",
      fontSize: "14px",
      fontStyle: "italic",
      textAlign: "center",
      padding: "12px",
    },
    fileContainer: {
      marginBottom: "24px",
    },
    fileCardContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "10px",
    },
    fileGroupTitle: {
      fontWeight: "bold",
      marginBottom: "8px",
      fontSize: "14px",
    },
  };

  // 현재 표시할 기존 파일 필터링 - remainingFileIds에 있는 파일만 표시
  const filteredExistingFiles = initialData?.files?.filter(file => 
    remainingFileIds.includes(file.fileId)
  ) || [];
  
  console.log("[NoticeEditForm] 남은 파일:", filteredExistingFiles);

  // 파일이 하나도 없는지 확인
  const hasNoFiles =
    filteredExistingFiles.length === 0 && selectedFiles.length === 0;

  const dragDropStyles = {
    dropZone: {
      border: isDragging ? "2px dashed #e74c3c" : "2px dashed #ccc",
      borderRadius: "6px",
      padding: "20px",
      textAlign: "center",
      backgroundColor: isDragging ? "#fef2f2" : "#f8f9fa",
      marginBottom: "16px",
      transition: "all 0.2s ease",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      width: "100%",
    },
    icon: {
      fontSize: "24px",
      marginBottom: "8px",
      color: isDragging ? "#e74c3c" : "#666",
    },
    text: {
      color: "#666",
      fontSize: "12px",
      textAlign: "center",
      lineHeight: "1.5",
    },
  };

  return (
    <form onSubmit={handleSave} style={styles.formContainer}>
      {submitError && <div style={styles.errorMessage}>{submitError}</div>}

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor="title">
          제목
        </label>
        <input
          id="title"
          style={styles.input}
          placeholder="공지사항 제목을 입력하세요"
          value={noticeTitle}
          onChange={(e) => setNoticeTitle(e.target.value)}
          required
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor="content">
          내용을 입력해주세요.
        </label>
        <textarea
          id="content"
          style={styles.textarea}
          placeholder="공지사항 내용을 입력하세요"
          value={noticeContent}
          onChange={(e) => setNoticeContent(e.target.value)}
          maxLength={maxLength}
        />
        <div style={styles.charCount}>
          {noticeContent.length}/{maxLength}
        </div>
      </div>

      {/* 파일 목록 표시 (기존 및 새 파일) */}
      <div style={styles.fileContainer}>
        {filteredExistingFiles.length > 0 && (
          <div>
            <div style={styles.fileGroupTitle}>기존 첨부 파일</div>
            <div style={styles.fileCardContainer}>
              {filteredExistingFiles.map((file) => (
                <FileCard
                  key={file.fileId}
                  file={{
                    name: file.fileName,
                    type:
                      file.fileUrl &&
                      file.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)
                        ? "image/jpeg"
                        : "application/octet-stream",
                  }}
                  onDelete={() => handleRemoveExistingFile(file.fileId)}
                />
              ))}
            </div>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div>
            <div style={styles.fileGroupTitle}>첨부 파일</div>
            <div style={styles.fileCardContainer}>
              {selectedFiles.map((file, index) => (
                <FileCard key={index} file={file} onDelete={handleRemoveFile} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 드래그 앤 드롭 영역 */}
      <div
        style={dragDropStyles.dropZone}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload").click()}
      >
        <div style={dragDropStyles.icon}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 8L12 3L7 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 3V15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={dragDropStyles.text}>
          파일의 주소나 놓기
          <br />
          클릭하여 추가하세요
        </div>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <div style={styles.actionButtons}>
        <div style={styles.leftButtons}>
          <Button type="submit" variant="store" disabled={isSubmitting} />
          <Button type="button" variant="delete" onClick={handleDelete} disabled={isSubmitting} />
        </div>
        <Button
          type="button"
          variant="back"
          onClick={() => onCancel()}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}

NoticeEditForm.propTypes = {
  studyId: PropTypes.string.isRequired,
  noticeId: PropTypes.string.isRequired,
  initialData: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSaveComplete: PropTypes.func,
};

NoticeEditForm.defaultProps = {
  initialData: {},
  onSaveComplete: null,
};

export default NoticeEditForm;
