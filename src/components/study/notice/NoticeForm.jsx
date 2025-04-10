import { useState, useEffect } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";

const NoticeForm = ({ studyId, notice = null, onFinish }) => {
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isLoading, createNotice } = useNotice();
  const { colors } = useTheme();
  const maxLength = 10000;

  useEffect(() => {
    if (notice) {
      setNoticeTitle(notice.noticeTitle);
      setNoticeContent(notice.noticeContent);
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
      // 생성 모드
      const newNotice = {
        noticeTitle,
        noticeContent,
        fileNames: selectedFiles.map((file) => file.name),
      };

      const result = await createNotice(studyId, newNotice, selectedFiles);

      // 성공 여부 확인 (성공이지만 파일 업로드 실패 경고가 있는 경우 포함)
      if (!result.success) {
        setError(result.message || "공지사항 저장 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      // 경고 메시지 표시 (파일 업로드 실패)
      if (result.warning) {
        console.warn("[NoticeForm] 공지사항 생성 경고:", result.warning);
        setError(result.warning);
      } else {
        // 순수한 성공 메시지
        console.log("[NoticeForm] 공지사항 생성 성공:", result.message);
      }

      // 성공 시 콜백 호출 - 생성된 공지사항의 ID를 전달
      if (result.data && result.data.noticeId) {
        console.log("[NoticeForm] 생성된 공지사항 ID:", result.data.noticeId);
        // 약간 지연 후 콜백 호출 (사용자가 성공/경고 메시지를 볼 수 있도록)
        setTimeout(
          () => {
            onFinish?.(result.data.noticeId);
          },
          result.warning ? 1500 : 500
        ); // 경고가 있으면 더 오래 표시
      } else {
        console.warn(
          "[NoticeForm] 생성된 공지사항에 ID가 없습니다:",
          result.data
        );
        setTimeout(
          () => {
            onFinish?.();
          },
          result.warning ? 1500 : 500
        );
      }
    } catch (error) {
      console.error("[NoticeForm] 공지사항 처리 중 오류:", error);
      setError(
        "공지사항 처리 중 오류 발생: " + (error.message || "알 수 없는 오류")
      );
      setIsSubmitting(false);
    } finally {
      // 오류가 있거나 경고가 있는 경우에는 isSubmitting 상태를 변경하지 않음
      // 성공 콜백에서 페이지 이동 처리
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
      color: `var(--textPrimary)`,
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: `1px solid var(--border)`,
      fontSize: "14px",
      backgroundColor: `var(--inputBackground)`,
      color: `var(--textPrimary)`,
    },
    textarea: {
      width: "100%",
      minHeight: "200px",
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid var(--border)`,
      resize: "none",
      fontSize: "14px",
      backgroundColor: `var(--inputBackground)`,
      color: `var(--textPrimary)`,
    },
    charCount: {
      textAlign: "right",
      fontSize: "12px",
      color: `var(--textSecondary)`,
      marginTop: "4px",
    },
    fileUploadRow: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "8px",
      marginBottom: "32px",
    },
    fileUploadButton: {
      backgroundColor: `var(--primary)`,
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
      backgroundColor: `var(--errorBackground)`,
      color: `var(--error)`,
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "16px",
    },
    fileList: {
      marginTop: "8px",
      padding: "8px 12px",
      backgroundColor: `var(--cardBackground)`,
      borderRadius: "4px",
      fontSize: "14px",
      border: `1px solid var(--border)`,
    },
    fileItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "4px",
      color: `var(--textPrimary)`,
    },
    fileIcon: {
      marginRight: "8px",
      color: `var(--textSecondary)`,
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
                style={{
                  marginLeft: "10px",
                  color: `var(--textSecondary)`,
                  fontSize: "12px",
                }}
              >
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.name)}
                style={{
                  marginBottom: "4px",
                  marginLeft: "auto",
                  color: `var(--error)`,
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
          onClick={() => onFinish()}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default NoticeForm;
