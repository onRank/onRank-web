import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import StudySidebar from "../../../components/study/StudySidebar";
import { formatDate } from "../../../utils/dateUtils";

function NoticeDetailManagerContent() {
  const { studyId, noticeId } = useParams();
  const navigate = useNavigate();
  const { selectedNotice, isLoading, error, getNoticeById, deleteNotice } =
    useNotice();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (studyId && noticeId) {
      getNoticeById(studyId, parseInt(noticeId, 10));
    }
  }, [studyId, noticeId, getNoticeById]);

  const handleBack = () => {
    navigate(`/studies/${studyId}/notices`);
  };

  const handleEdit = () => {
    navigate(`/studies/${studyId}/notices/${noticeId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    try {
      const result = await deleteNotice(studyId, parseInt(noticeId, 10));
      if (result.success) {
        navigate(`/studies/${studyId}/notices`);
      } else {
        alert(result.message || "공지사항 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isDeleting) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!selectedNotice) {
    return (
      <div style={{ padding: "24px" }}>
        <Button onClick={handleBack} variant="back" />
        <div style={{ marginTop: "16px" }}>
          해당 공지사항을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "40px 24px",
      fontFamily: "Pretendard, sans-serif",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      padding: "32px",
      border: "1px solid #eee",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "32px",
    },
    dateText: {
      fontSize: "14px",
      color: "#999",
      marginBottom: "24px",
    },
    content: {
      width: "100%",
      height: "300px",
      padding: "12px 16px",
      fontSize: "16px",
      border: "1px solid #d9d9d9",
      borderRadius: "6px",
      resize: "none",
      lineHeight: "1.6",
      whiteSpace: "pre-wrap",
      marginBottom: "8px",
    },
    fileSection: {
      borderTop: "1px solid #eee",
      paddingTop: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
    },
    fileTitle: {
      fontSize: "16px",
      fontWeight: "600",
    },
    fileLink: {
      color: "#1e3a8a",
      cursor: "pointer",
      textDecoration: "underline",
      fontSize: "14px",
    },
    inputTitle: {
      width: "100%",
      height: "40px",
      padding: "8px 12px",
      fontSize: "16px",
      border: "1px solid #d9d9d9",
      borderRadius: "6px",
      marginBottom: "24px",
    },
    textareaDescription: {
      fontSize: "14px",
      color: "#999",
      marginBottom: "24px",
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
      marginTop: "20px",
    },
    closeButtonWrap: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <Button onClick={handleBack} variant="back" />
        <div>
          <Button onClick={handleEdit} variant="edit" />
          <Button onClick={handleDelete} variant="delete" />
        </div>
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>{selectedNotice.noticeTitle}</h1>
        <div style={styles.dateText}>
          작성일: {formatDate(selectedNotice.noticeCreatedAt)}
          {selectedNotice.noticeModifiedAt !==
            selectedNotice.noticeCreatedAt && (
            <span style={{ marginLeft: "16px" }}>
              수정일: {formatDate(selectedNotice.noticeModifiedAt)}
            </span>
          )}
        </div>

        <div style={styles.content}>
          {selectedNotice.noticeContent || <p>&nbsp;</p>}
        </div>

        {selectedNotice.files && selectedNotice.files.length > 0 && (
          <div style={styles.fileSection}>
            <div style={styles.fileTitle}>첨부 파일</div>
            <ul>
              {selectedNotice.files.map((file) => (
                <li
                  key={file.fileId}
                  style={styles.fileLink}
                  onClick={() => window.open(file.fileUrl, "_blank")}
                >
                  {file.fileName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function NoticeDetailManagerPage() {
  const styles = {
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
  };

  return (
    <NoticeProvider>
      <div style={styles.wrapper}>
        <div style={styles.main}>
          <aside>
            <StudySidebar activeTab="공지사항" />
          </aside>
          <main style={styles.content}>
            <NoticeDetailManagerContent />
          </main>
        </div>
      </div>
    </NoticeProvider>
  );
}

export default NoticeDetailManagerPage;
