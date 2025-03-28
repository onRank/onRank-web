import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../component/Button";
import { formatDate } from "../../../utils/dateUtils";

function NoticeDetailUserContent() {
  const { studyId, noticeId } = useParams(); // URL에서 studyId와 noticeId 추출
  const navigate = useNavigate();
  const { selectedNotice, isLoading, error, getNoticeById } = useNotice();

  // 컴포넌트 마운트 시 공지사항 정보 가져오기
  useEffect(() => {
    if (studyId && noticeId) {
      getNoticeById(studyId, parseInt(noticeId, 10));
    }
  }, [studyId, noticeId, getNoticeById]);

  // 뒤로 가기 처리
  const handleBack = () => {
    navigate(`/studies/${studyId}/notices`);
  };

  // 파일 다운로드 처리
  const handleDownload = (fileUrl, fileName) => {
    window.open(fileUrl, "_blank");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!selectedNotice) {
    return <div>해당 공지사항을 찾을 수 없습니다.</div>;
  }

  const styles = {
    wrapper: {
      minHeight: "100vh",
      fontFamily: "sans-serif",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
    },
    topbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e0e0e0",
      padding: "12px 24px",
    },
    topbarLeft: {
      display: "flex",
      alignItems: "center",
      gap: "24px",
    },
    logo: {
      fontWeight: "bold",
    },
    main: {
      display: "flex",
      flex: 1,
    },
    sidebar: {
      width: "200px",
      padding: "16px",
      borderRight: "1px solid #e5e5e5",
    },
    contentArea: {
      flex: 1,
      padding: "32px",
    },
    breadcrumb: {
      fontSize: "14px",
      color: "#999",
      marginBottom: "16px",
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "4px",
    },
    date: {
      fontSize: "12px",
      color: "#888",
      marginBottom: "24px",
    },
    contentBox: {
      border: "1px solid #ddd",
      borderRadius: "6px",
      minHeight: "200px",
      padding: "16px",
      backgroundColor: "#fafafa",
      marginBottom: "32px",
    },
    fileLabel: {
      fontSize: "14px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    fileList: {
      listStyle: "none",
      padding: 0,
      marginBottom: "32px",
    },
    fileItem: {
      marginBottom: "6px",
      cursor: "pointer",
    },
    fileName: {
      fontSize: "14px",
      color: "#0066cc",
      textDecoration: "underline",
    },
    fileSize: {
      fontSize: "12px",
      color: "#999",
      marginLeft: "8px",
    },
    buttonWrap: {
      textAlign: "right",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.main}>
        <main style={styles.contentArea}>
          <div style={styles.breadcrumb}>
            공지사항 &gt; {selectedNotice.noticeTitle}
          </div>
          <h1 style={styles.title}>{selectedNotice.noticeTitle}</h1>
          <div style={styles.date}>
            {formatDate(selectedNotice.noticeCreatedAt)}
          </div>

          <div style={styles.contentBox}>
            {selectedNotice.noticeContent || <p>&nbsp;</p>}
          </div>

          {selectedNotice.files && selectedNotice.files.length > 0 && (
            <>
              <div style={styles.fileLabel}>첨부 파일</div>
              <ul style={styles.fileList}>
                {selectedNotice.files.map((file) => (
                  <li
                    key={file.fileId}
                    style={styles.fileItem}
                    onClick={() => handleDownload(file.fileUrl, file.fileName)}
                  >
                    <span style={styles.fileName}>{file.fileName}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div style={styles.buttonWrap}>
            <Button onClick={handleBack} variant="back" />
          </div>
        </main>
      </div>
    </div>
  );
}

function NoticeDetailUserPage() {
  return (
    <NoticeProvider>
      <NoticeDetailUserContent />
    </NoticeProvider>
  );
}

export default NoticeDetailUserPage;
