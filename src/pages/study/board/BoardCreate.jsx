import { useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../../../components/common/Button";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import "../../../styles/board.css";

function BoardCreate({ onSubmit, onCancel, isLoading }) {
  const { studyId } = useParams();
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    postTitle: "",
    postContent: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxLength = 10000;

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 필드에 값이 입력되면 해당 필드의 오류 메시지 제거
    if (value.trim() !== "") {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
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

  // 폼 유효성 검사
  const validateForm = () => {
    const errors = {};
    if (!formData.postTitle.trim()) {
      errors.postTitle = "제목을 입력해주세요.";
    }
    if (!formData.postContent.trim()) {
      errors.postContent = "내용을 입력해주세요.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const boardData = {
        ...formData,
        studyId,
        fileNames: selectedFiles.map((file) => file.name)
      };

      const success = await onSubmit(boardData, selectedFiles);

      if (success) {
        onCancel(); // 성공 시 목록 페이지로 이동
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("게시글 생성 중 오류 발생:", error);
      setError("게시글 생성 중 오류가 발생했습니다. " + (error.message || ""));
      setIsSubmitting(false);
    }
  };

  // NoticeForm 스타일 적용
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
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor="postTitle">
          제목
        </label>
        <input
          id="postTitle"
          name="postTitle"
          style={styles.input}
          placeholder="게시글 제목을 입력하세요"
          value={formData.postTitle}
          onChange={handleChange}
          required
        />
        {formErrors.postTitle && <div className="form-error">{formErrors.postTitle}</div>}
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor="postContent">
          내용을 입력해주세요.
        </label>
        <textarea
          id="postContent"
          name="postContent"
          style={styles.textarea}
          placeholder="게시글 내용을 입력하세요"
          value={formData.postContent}
          onChange={handleChange}
          maxLength={maxLength}
        />
        <div style={styles.charCount}>
          {formData.postContent.length}/{maxLength}
        </div>
        {formErrors.postContent && <div className="form-error">{formErrors.postContent}</div>}
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
          onClick={onCancel}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}

BoardCreate.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default BoardCreate; 