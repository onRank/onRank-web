import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { usePost } from "./PostProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";

/**
 * 게시판 수정 폼 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.studyId - 스터디 ID
 * @param {string} props.postId - 게시판 ID
 * @param {Object} props.initialData - 초기 게시판 데이터
 * @param {Function} props.onCancel - 취소 버튼 클릭 핸들러
 * @param {Function} props.onSaveComplete - 저장 완료 후 호출될 콜백
 */
function PostEditForm({
  studyId,
  postId,
  initialData,
  onCancel,
  onSaveComplete,
}) {
  const { editPost, deletePost } = usePost();
  const navigate = useNavigate();

  const [postTitle, setPostTitle] = useState(initialData?.postTitle || "");
  const [postContent, setPostContent] = useState(
    initialData?.postContent || ""
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(initialData?.files || []);
  const [filesToRemove, setFilesToRemove] = useState([]);
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

    // 기존 파일과 이름 중복 확인 (수정 모드에서)
    const duplicateWithExisting = newFiles.filter((file) =>
      existingFiles.some((f) => f.fileName === file.name)
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
    // 파일 선택 후 input 초기화
    e.target.value = "";
  };

  // 선택된 파일 제거 핸들러
  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  // 기존 파일 제거 핸들러
  const handleRemoveExistingFile = (file) => {
    setExistingFiles((prev) => prev.filter((f) => f.fileId !== file.fileId));
    setFilesToRemove((prev) => [...prev, file]);
  };

  // 저장 핸들러
  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    // 입력 검증
    if (!postTitle.trim()) {
      setSubmitError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedPost = {
        postTitle,
        postContent,
        fileNames: selectedFiles.map((file) => file.name),
        // 유지할 기존 파일 목록
        existingFileIds: existingFiles.map((file) => file.fileId),
        // 제거할 파일 목록
        removeFileIds: filesToRemove.map((file) => file.fileId),
      };

      const result = await editPost(
        studyId,
        parseInt(postId, 10),
        updatedPost,
        selectedFiles
      );

      if (!result.success) {
        setSubmitError(result.message || "게시판 수정 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      // 성공 시 상세 보기 모드로 전환
      onSaveComplete();
    } catch (error) {
      setSubmitError("게시판 수정 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시판을 삭제하시겠습니까?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deletePost(studyId, parseInt(postId, 10));
      if (result.success) {
        navigate(`/studies/${studyId}/posts`);
      } else {
        setSubmitError(result.message || "게시판 삭제 중 오류가 발생했습니다.");
        setIsSubmitting(false);
      }
    } catch (error) {
      setSubmitError("게시판 삭제 중 오류가 발생했습니다.");
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
      minHeight: "313px",
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
          placeholder="게시판 제목을 입력하세요"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
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
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          maxLength={maxLength}
        />
        <div style={styles.charCount}>
          {postContent.length}/{maxLength}
        </div>
      </div>

      {/* 기존 파일 목록 표시 */}
      {existingFiles.length > 0 && (
        <div style={styles.fileList}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            기존 파일
          </div>
          {existingFiles.map((file) => (
            <div key={file.fileId} style={styles.fileItem}>
              <span style={styles.fileIcon}>📎</span>
              {file.fileName}
              <button
                type="button"
                onClick={() => handleRemoveExistingFile(file)}
                style={{
                  marginBottom: "4px",
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

      {/* 새로 선택된 파일 목록 표시 */}
      {selectedFiles.length > 0 && (
        <div style={styles.fileList}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>새 파일</div>
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
                  marginBottom: "4px",
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

      {/* 파일 업로드 버튼 */}
      <div style={styles.fileUploadRow}>
        <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Button variant="addFiles" type="button" />
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

PostEditForm.propTypes = {
  studyId: PropTypes.string.isRequired,
  postId: PropTypes.string.isRequired,
  initialData: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSaveComplete: PropTypes.func.isRequired,
};

export default PostEditForm;
