import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebar from "../../../components/study/StudySidebar";
import Button from "../../../components/common/Button";

function NoticeEditManagerContent() {
  const { studyId, noticeId } = useParams();
  const navigate = useNavigate();
  const {
    selectedNotice,
    isLoading,
    error,
    getNoticeById,
    editNotice,
    deleteNotice,
  } = useNotice();

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const maxLength = 10000;

  // 컴포넌트 마운트 시 공지사항 정보 가져오기
  useEffect(() => {
    if (studyId && noticeId) {
      getNoticeById(studyId, parseInt(noticeId, 10));
    }
  }, [studyId, noticeId, getNoticeById]);

  // 공지사항 데이터가 로드되면 상태 업데이트
  useEffect(() => {
    if (selectedNotice) {
      setNoticeTitle(selectedNotice.noticeTitle || "");
      setNoticeContent(selectedNotice.noticeContent || "");

      // 기존 파일이 있으면 설정
      if (selectedNotice.files && Array.isArray(selectedNotice.files)) {
        setExistingFiles(selectedNotice.files);
      }
    }
  }, [selectedNotice]);

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
    if (!noticeTitle.trim()) {
      setSubmitError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
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

      // 성공 시 상세 페이지로 이동
      navigate(`/studies/${studyId}/notices/${noticeId}`);
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

  // 취소 핸들러
  const handleCancel = () => {
    navigate(`/studies/${studyId}/notices`);
  };

  if (isLoading || isSubmitting) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!selectedNotice) {
    return (
      <div style={{ padding: "24px" }}>
        <div style={{ marginTop: "16px" }}>
          해당 공지사항을 찾을 수 없습니다.
        </div>
      </div>
    );
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
        <Button type="button" variant="back" onClick={handleCancel} />
      </div>
    </form>
  );
}

function NoticeEditPage() {
  const { studyId } = useParams();
  const [studyData, setStudyData] = useState({ title: "스터디" });

  // 스터디 정보 가져오기
  useEffect(() => {
    const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
    if (cachedStudyDataStr) {
      try {
        const cachedStudyData = JSON.parse(cachedStudyDataStr);
        setStudyData(cachedStudyData);
      } catch (err) {
        console.error("[NoticeManagerPage] 캐시 데이터 파싱 오류:", err);
      }
    }
  }, [studyId]);

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      overflow: "hidden",
    },
    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "2rem",
      fontSize: "14px",
      color: "#666666",
      width: "100%",
      maxWidth: "1200px",
      padding: "0 1rem",
    },
    breadcrumbLink: {
      display: "flex",
      alignItems: "center",
      color: "#666666",
      textDecoration: "none",
      transition: "color 0.2s ease",
      padding: "4px 8px",
      borderRadius: "4px",
    },
    activeTab: {
      color: "#FF0000",
      fontWeight: "bold",
      padding: "2px 4px",
    },
    contentArea: {
      display: "flex",
    },
    wrapper: {
      minHeight: "100vh",
      fontFamily: "sans-serif",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
    },
    main: {
      display: "flex",
      flex: 1,
    },
    content: {
      flex: 1,
      padding: "48px 64px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "32px",
    },
  };

  return (
    <NoticeProvider>
      <div style={styles.breadcrumb}>
        <Link
          to="/"
          style={styles.breadcrumbLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F8F9FA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <IoHomeOutline size={16} />
        </Link>
        <span>{">"}</span>
        <Link
          to={`/studies/${studyId}`}
          style={styles.breadcrumbLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F8F9FA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {studyData?.title || "스터디"}
        </Link>
        <span>{">"}</span>
        <Link
          to={`/studies/${studyId}/notices`}
          style={styles.breadcrumbLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F8F9FA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          공지사항
        </Link>
      </div>
      <div style={styles.wrapper}>
        <div style={styles.main}>
          <aside>
            <StudySidebar activeTab="공지사항" />
          </aside>
          <main style={styles.content}>
            <h1 style={styles.title}>공지사항</h1>
            <NoticeEditManagerContent />
          </main>
        </div>
      </div>
    </NoticeProvider>
  );
}

export default NoticeEditPage;
