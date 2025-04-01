import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import { formatDate } from "../../../utils/dateUtils";
import PropTypes from "prop-types";

function NoticeDetailUserContent({ onTitleLoaded }) {
  const { studyId, noticeId } = useParams(); // URL에서 studyId와 noticeId 추출
  const navigate = useNavigate();
  const { selectedNotice, isLoading, error, getNoticeById } = useNotice();

  // 컴포넌트 마운트 시 공지사항 정보 가져오기
  useEffect(() => {
    if (studyId && noticeId) {
      getNoticeById(studyId, parseInt(noticeId, 10));
    }
  }, [studyId, noticeId, getNoticeById]);

  // 공지사항 제목이 로드되면 부모 컴포넌트에 알림
  useEffect(() => {
    if (selectedNotice && selectedNotice.noticeTitle && onTitleLoaded) {
      onTitleLoaded(selectedNotice.noticeTitle);
    }
  }, [selectedNotice, onTitleLoaded]);

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

// PropTypes 추가
NoticeDetailUserContent.propTypes = {
  onTitleLoaded: PropTypes.func,
};

// 기본 props 설정
NoticeDetailUserContent.defaultProps = {
  onTitleLoaded: () => {},
};

function NoticeDetailUserPage() {
  const { studyId } = useParams();
  const [studyData, setStudyData] = useState({ title: "스터디" });
  const [pageTitle, setPageTitle] = useState("공지사항 상세");

  // 스터디 정보 가져오기
  useEffect(() => {
    const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
    if (cachedStudyDataStr) {
      try {
        const cachedStudyData = JSON.parse(cachedStudyDataStr);
        setStudyData(cachedStudyData);
      } catch (err) {
        console.error("[NoticeDetailUserPage] 캐시 데이터 파싱 오류:", err);
      }
    }
  }, [studyId]);

  // 자식 컴포넌트에서 제목을 받아오는 함수
  const updatePageTitle = (title) => {
    setPageTitle(title);
  };

  const styles = {
    wrapper: {
      minHeight: "100vh",
      fontFamily: "sans-serif",
      backgroundColor: "#f9f9f9",
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
  };

  return (
    <NoticeProvider>
      <div style={styles.wrapper}>
        {/* 브레드크럼 (경로 표시) */}
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
          <span>{">"}</span>
          <span style={styles.activeTab}>{pageTitle}</span>
        </div>
        <div style={styles.main}>
          <main style={styles.content}>
            <h1 style={styles.title}>{pageTitle}</h1>
            <NoticeDetailUserContent onTitleLoaded={updatePageTitle} />
          </main>
        </div>
      </div>
    </NoticeProvider>
  );
}

export default NoticeDetailUserPage;
