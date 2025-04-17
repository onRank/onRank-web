import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";

/**
 * 공지사항 수정 폼 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.studyId - 스터디 ID
 * @param {string} props.noticeId - 공지사항 ID
 * @param {Object} props.initialData - 초기 공지사항 데이터
 * @param {Function} props.onCancel - 취소 버튼 클릭 핸들러
 * @param {Function} props.onSaveComplete - 저장 완료 후 호출될 콜백
 */
function NoticeEditForm({
  studyId,
  noticeId,
  initialData,
  onCancel,
  onSaveComplete,
}) {
  const { editNotice, deleteNotice } = useNotice();
  const navigate = useNavigate();

  const [noticeTitle, setNoticeTitle] = useState(
    initialData?.noticeTitle || ""
  );
  const [noticeContent, setNoticeContent] = useState(
    initialData?.noticeContent || ""
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  // 수정: 남겨둘 파일 ID 배열 상태 추가 (기본값은 모든 파일 ID)
  const [remainingFileIds, setRemainingFileIds] = useState(
    initialData?.files?.map((file) => file.fileId) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const maxLength = 10000;

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

  // 선택된 파일 제거 핸들러
  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  // 기존 파일 제거/복원 핸들러 추가
  const handleToggleExistingFile = (fileId) => {
    if (remainingFileIds.includes(fileId)) {
      // 파일 ID가 있으면 제거 (유지하지 않음)
      setRemainingFileIds((prev) => prev.filter((id) => id !== fileId));
    } else {
      // 파일 ID가 없으면 추가 (다시 유지함)
      setRemainingFileIds((prev) => [...prev, fileId]);
    }
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
        // 수정: 백엔드 API 요구사항에 맞게 데이터 구조 변경
        remainingFileIds: remainingFileIds, // 유지할 파일 ID 배열 (숫자 타입)
        newFileNames: selectedFiles.map((file) => file.name), // 새 파일명 배열 (문자열 타입)
      };

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

      // 성공 시 상세 보기 모드로 전환
      onSaveComplete();
    } catch (error) {
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
      marginBottom: "32px",
    },
    fileList: {
      marginTop: "8px",
      padding: "8px 12px",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      fontSize: "14px",
    },
    fileItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "4px",
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
    fileListHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    removeFileButton: {
      marginLeft: "auto",
      color: "#e74c3c",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
    },
    restoreFileButton: {
      marginLeft: "auto",
      color: "#27ae60",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
    },
    removedFile: {
      textDecoration: "line-through",
      color: "#999",
    },
    fileInfo: {
      display: "flex",
      alignItems: "center",
      flex: 1,
    },
  };

  const hasNoFiles =
    (!initialData?.files || initialData.files.length === 0) &&
    selectedFiles.length === 0;

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

      {/* 통합된 파일 목록 */}
      <div style={styles.fileList}>
        <div style={styles.fileListHeader}>
          <span>첨부 파일</span>
        </div>

        {hasNoFiles ? (
          <div style={styles.noFiles}>첨부된 파일이 없습니다</div>
        ) : (
          <div>
            {/* 기존 파일 목록 */}
            {initialData?.files?.map((file) => (
              <div key={`existing-${file.fileId}`} style={styles.fileItem}>
                <div
                  style={{
                    ...styles.fileInfo,
                    ...(remainingFileIds.includes(file.fileId)
                      ? {}
                      : styles.removedFile),
                  }}
                >
                  <span style={styles.fileIcon}>📎</span>
                  {file.fileName}
                  <span style={styles.fileSize}>
                    ({file.fileSize ? (file.fileSize / 1024).toFixed(1) : "?"}{" "}
                    KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleExistingFile(file.fileId)}
                  style={styles.removeButton}
                >
                  {remainingFileIds.includes(file.fileId) ? "✕" : "복원"}
                </button>
              </div>
            ))}

            {/* 새로 선택된 파일 목록 */}
            {selectedFiles.map((file, index) => (
              <div key={`new-${index}`} style={styles.fileItem}>
                <div style={styles.fileInfo}>
                  <span style={styles.fileIcon}>📎</span>
                  {file.name}
                  <span style={styles.fileSize}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.name)}
                  style={styles.removeButton}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 파일 업로드 버튼 */}
      <div style={styles.fileUploadRow}>
        <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
          <Button variant="addFiles" type="button" />
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* 액션 버튼들 */}
      <div style={styles.actionButtons}>
        <div style={styles.leftButtons}>
          <Button type="submit" variant="store" />
          <Button type="button" variant="delete" onClick={handleDelete} />
        </div>
        <Button type="button" variant="back" onClick={onCancel} />
      </div>
    </form>
  );
}

NoticeEditForm.propTypes = {
  studyId: PropTypes.string.isRequired,
  noticeId: PropTypes.string.isRequired,
  initialData: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSaveComplete: PropTypes.func.isRequired,
};

export default NoticeEditForm;
