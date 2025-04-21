import { useState, useEffect } from "react";
import { usePost } from "./PostProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";

const PostForm = ({ studyId, post = null, mode = "create", onFinish }) => {
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const { isLoading, createPost, editPost } = usePost();
  const maxLength = 10000;

  useEffect(() => {
    if (post) {
      setPostTitle(post.postTitle);
      setPostContent(post.postContent);

      // 기존 파일이 있으면 설정
      if (post.files && Array.isArray(post.files)) {
        setExistingFiles(post.files);
      }
    }
  }, [post]);

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
  };

  // 선택된 파일 제거 핸들러
  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  // 게시판 생성 핸들러
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // 입력 검증
    if (!postTitle.trim()) {
      setError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "create") {
        // 생성 모드
        const newPost = {
          postTitle,
          postContent,
          fileNames: selectedFiles.map((file) => file.name),
        };

        const result = await createPost(studyId, newPost, selectedFiles);
        if (!result.success) {
          setError(result.message || "게시판 저장 중 오류가 발생했습니다.");
          return;
        }
        if (result.warning) {
          setError(result.warning);
        }

        // 성공 시 콜백 호출 - 생성된 게시판의 ID를 전달
        if (result.data && result.data.postId) {
          console.log("[PostForm] 생성된 게시판 ID:", result.data.postId);
          onFinish?.(result.data.postId);
        } else {
          console.warn(
            "[PostForm] 생성된 게시판에 ID가 없습니다:",
            result.data
          );
          onFinish?.();
        }
      } else {
        // 수정 모드
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
          post.postId,
          updatedPost,
          selectedFiles
        );
        if (!result.success) {
          setError(result.message || "게시판 수정 중 오류가 발생했습니다.");
          return;
        }
        if (result.warning) {
          setError(result.warning);
        }

        // 수정 모드에서는 기존 ID 전달
        onFinish?.(post.postId);
      }
    } catch (error) {
      setError(
        "게시판 처리 중 오류 발생: " + (error.message || "알 수 없는 오류")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // PostFormPage 스타일 적용
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
      padding: "24px 0",
      gap: "12px",
      justifyContent: "flex-end",
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

  // 드래그 앤 드롭 영역 스타일
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
      width: "45%",
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

  if (isLoading || isSubmitting) return <LoadingSpinner />;

  return (
    <form onSubmit={handleCreatePost} style={styles.formContainer}>
      {error && <div style={styles.errorMessage}>{error}</div>}

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
          placeholder="게시판 내용을 입력하세요"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          maxLength={maxLength}
        />
        <div style={styles.charCount}>
          {postContent.length}/{maxLength}
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
        <Button type="button" variant="upload" disabled={isSubmitting} />
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

export default PostForm;
