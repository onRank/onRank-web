import { useState, useEffect } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";

const NoticeForm = ({ studyId, notice = null, mode = "create", onFinish }) => {
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isLoading, createNotice, editNotice } = useNotice();
  const maxLength = 10000;

  useEffect(() => {
    if (notice) {
      setNoticeTitle(notice.noticeTitle);
      setNoticeContent(notice.noticeContent);

      // 기존 파일이 있으면 설정
      if (notice.files && Array.isArray(notice.files)) {
        setExistingFiles(notice.files);
      }
    }
  }, [notice]);

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 이미 선택된 파일과 중복 확인 (새로 추가하는 파일)
    const newFiles = files.filter(
      (file) => !selectedFiles.some((f) => f.name === file.name)
    );

    // 기존 파일과 이름 중복 확인 (수정 모드에서)
    const duplicateWithExisting = newFiles.filter((file) =>
      existingFiles.some((f) => f.fileName === file.name)
    );

    if (duplicateWithExisting.length > 0) {
      setError(
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
      setError(
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

  // 공지사항 생성 핸들러
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // 입력 검증
    if (!noticeTitle.trim()) {
      setError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "create") {
        // 생성 모드
        const newNotice = {
          noticeTitle,
          noticeContent,
          fileNames: selectedFiles.map((file) => file.name),
        };

        const result = await createNotice(studyId, newNotice, selectedFiles);
        if (!result.success) {
          setError(result.message || "공지사항 저장 중 오류가 발생했습니다.");
          return;
        }
        if (result.warning) {
          setError(result.warning);
        }
      } else {
        // 수정 모드
        const updatedNotice = {
          noticeTitle,
          noticeContent,
          fileNames: selectedFiles.map((file) => file.name),
          // 유지할 기존 파일 목록
          existingFileIds: existingFiles.map((file) => file.fileId),
          // 제거할 파일 목록
          removeFileIds: filesToRemove.map((file) => file.fileId),
        };

        const result = await editNotice(
          studyId,
          notice.noticeId,
          updatedNotice,
          selectedFiles
        );
        if (!result.success) {
          setError(result.message || "공지사항 수정 중 오류가 발생했습니다.");
          return;
        }
        if (result.warning) {
          setError(result.warning);
        }
      }
      onFinish?.(); // 전송 후 콜백 (예: 목록으로 이동)
    } catch (error) {
      setError(
        "공지사항 처리 중 오류 발생: " + (error.message || "알 수 없는 오류")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // NoticeFormPage 스타일 적용
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
      minHeight: "200px",
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
    fileUploadButton: {
      backgroundColor: "#e74c3c",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "6px 12px",
      cursor: "pointer",
      fontSize: "14px",
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
    errorMessage: {
      backgroundColor: "#fdecea",
      color: "#e74c3c",
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "16px",
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
  };

  if (isLoading || isSubmitting) return <LoadingSpinner />;

  return (
    <form onSubmit={handleCreateNotice} style={styles.formContainer}>
      {error && <div style={styles.errorMessage}>{error}</div>}

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

      {/* 파일 목록 표시 */}
      {selectedFiles.length > 0 && (
        <div style={styles.fileList}>
          {selectedFiles.map((file, index) => (
            <div key={index} style={styles.fileItem}>
              <span style={styles.fileIcon}>📎</span>
              {file.name}
              <span
                style={{ marginLeft: "10px", color: "#666", fontSize: "12px" }}
              >
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.name)}
                style={{
                  marginLeft: "auto",
                  color: "#e74c3c",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.fileUploadRow}>
        <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
          <div style={styles.fileUploadButton}>파일 첨부</div>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div style={styles.actionButtons}>
        <div style={styles.leftButtons}>
          <Button type="submit" variant="upload" disabled={isSubmitting} />
        </div>
        <Button
          type="button"
          variant="back"
          onClick={onFinish}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default NoticeForm;
