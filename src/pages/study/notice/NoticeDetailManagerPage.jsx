import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { IoHomeOutline } from "react-icons/io5";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebarContainer from "../../../components/common/sidebar/StudySidebarContainer";
import Button from "../../../components/common/Button";
import NoticeEditForm from "../../../components/study/notice/NoticeEditForm";

function NoticeDetailManagerContent({ onTitleLoaded }) {
  const { studyId, noticeId } = useParams();
  const navigate = useNavigate();
  const { selectedNotice, isLoading, error, getNoticeById } = useNotice();
  const [isEditMode, setIsEditMode] = useState(false);

  // 컴포넌트 마운트 시 공지사항 정보 가져오기
  useEffect(() => {
    if (studyId && noticeId) {
      getNoticeById(studyId, parseInt(noticeId, 10));
    }
  }, [studyId, noticeId, getNoticeById]);

  // 공지사항 제목이 로드되면 부모 컴포넌트에 알림
  useEffect(() => {
    if (
      selectedNotice &&
      selectedNotice.noticeTitle &&
      onTitleLoaded &&
      !isEditMode
    ) {
      onTitleLoaded(selectedNotice.noticeTitle);
    }
  }, [selectedNotice, onTitleLoaded, isEditMode]);

  // 닫기 버튼 핸들러 - 공지사항 목록으로 이동
  const handleClose = () => {
    navigate(`/studies/${studyId}/notices`);
  };

  // 수정 버튼 핸들러 - URL 변경 대신 수정 모드로 전환
  const handleEdit = () => {
    setIsEditMode(true);
    if (onTitleLoaded) {
      onTitleLoaded("공지사항");
    }
  };

  // 수정 취소 및 완료 핸들러
  const handleEditCancel = () => {
    setIsEditMode(false);
    if (selectedNotice && onTitleLoaded) {
      onTitleLoaded(selectedNotice.noticeTitle);
    }
  };

  const handleEditComplete = () => {
    // 수정 완료 후 GET API를 다시 호출하여 최신 데이터 가져오기
    getNoticeById(studyId, parseInt(noticeId, 10));
    setIsEditMode(false);
  };

  if (isLoading) {
    return <div>로딩중...</div>;
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

  // 스타일 정의
  const styles = {
    container: {
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    date: {
      fontSize: "12px",
      color: "#888",
    },
    contentBox: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      minHeight: "313px",
      padding: "16px",
      background: "#fff",
    },
    attachmentWrapper: {
      marginTop: "12px",
    },
    attachmentTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    attachmentItem: {
      fontSize: "14px",
      marginBottom: "6px",
      color: "#333",
      cursor: "pointer",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
    },
  };

  return (
    <div style={styles.container}>
      {isEditMode ? (
        <NoticeEditForm
          studyId={studyId}
          noticeId={noticeId}
          initialData={selectedNotice}
          onCancel={handleEditCancel}
          onSaveComplete={handleEditComplete}
        />
      ) : (
        <>
          <div style={styles.date}>
            {new Date(selectedNotice.noticeCreatedAt).toLocaleDateString()}
          </div>
          <div style={styles.contentBox}>
            {selectedNotice.noticeContent || <p>내용이 없습니다.</p>}
          </div>
          {selectedNotice.files?.length > 0 && (
            <div style={styles.attachmentWrapper}>
              <div style={styles.attachmentTitle}>첨부 파일</div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {selectedNotice.files.map((file) => (
                  <li
                    key={file.fileId}
                    style={styles.attachmentItem}
                    onClick={() => window.open(file.fileUrl, "_blank")}
                  >
                    {file.fileName}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div style={styles.buttonContainer}>
            <Button variant="edit" onClick={handleEdit} />
            <Button variant="back" onClick={handleClose} />
          </div>
        </>
      )}
    </div>
  );
}

// PropTypes 추가
NoticeDetailManagerContent.propTypes = {
  onTitleLoaded: PropTypes.func,
};

// 기본 props 설정
NoticeDetailManagerContent.defaultProps = {
  onTitleLoaded: () => {},
};

function NoticeDetailManagerPage() {
  const { studyId, noticeId } = useParams();
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
        console.error("[NoticeDetailManagerPage] 캐시 데이터 파싱 오류:", err);
      }
    }
  }, [studyId]);

  // 자식 컴포넌트에서 제목을 받아오는 함수
  const updatePageTitle = (title) => {
    setPageTitle(title);
  };

  const styles = {
    wrapper: {
      maxHeight: "100vh",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
      padding: "0 1rem",
    },
    main: {
      display: "flex",
    },
    content: {
      flex: 1,
      padding: "0 40px",
      margin: "0 auto",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "10px",
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
          <aside>
            <StudySidebarContainer activeTab="공지사항" />
          </aside>
          <main style={styles.content}>
            <h1 style={styles.title}>{pageTitle}</h1>
            <NoticeDetailManagerContent onTitleLoaded={updatePageTitle} />
          </main>
        </div>
      </div>
    </NoticeProvider>
  );
}

export default NoticeDetailManagerPage;
