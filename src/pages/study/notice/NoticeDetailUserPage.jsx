import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebarContainer from "../../../components/common/sidebar/StudySidebarContainer";
import Button from "../../../components/common/Button";

function NoticeDetailContent({ onTitleLoaded }) {
  const { studyId, noticeId } = useParams();
  const navigate = useNavigate();
  const { selectedNotice, isLoading, error, getNoticeById } = useNotice();

  // 컴포넌트 마운트 시 공지사항 정보 가져오기 (최적화)
  useEffect(() => {
    if (studyId && noticeId) {
      const parsedId = parseInt(noticeId, 10);
      // selectedNotice가 없거나 현재 요청한 ID와 다른 경우에만 API 요청
      if (!selectedNotice || selectedNotice.noticeId !== parsedId) {
        console.log("[NoticeDetailContent] 공지사항 상세 요청:", noticeId);
        getNoticeById(studyId, parsedId);
      } else {
        console.log(
          "[NoticeDetailContent] 이미 선택된 공지사항과 동일하여 요청 생략:",
          noticeId
        );
      }
    }
  }, [studyId, noticeId, getNoticeById, selectedNotice]);

  // 공지사항 제목이 로드되면 부모 컴포넌트에 알림
  useEffect(() => {
    if (selectedNotice && selectedNotice.noticeTitle && onTitleLoaded) {
      onTitleLoaded(selectedNotice.noticeTitle);
    }
  }, [selectedNotice, onTitleLoaded]);

  // 닫기 버튼 핸들러 - 공지사항 목록으로 이동
  const handleClose = () => {
    navigate(`/studies/${studyId}/notices`);
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
        <Button variant="back" onClick={handleClose} />
      </div>
    </div>
  );
}

// PropTypes 추가
NoticeDetailContent.propTypes = {
  onTitleLoaded: PropTypes.func,
};

// 기본 props 설정
NoticeDetailContent.defaultProps = {
  onTitleLoaded: () => {},
};

function NoticeUserManagerPage() {
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
      maxHeight: "100vh",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
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
    activeTab: {
      color: "#FF0000",
      fontWeight: "bold",
      padding: "2px 4px",
    },
    mainContainer: {
      display: "flex",
    },
  };

  return (
    <NoticeProvider>
      <div style={styles.wrapper}>
        <div style={styles.main}>
          <aside>
            <StudySidebarContainer activeTab="공지사항" />
          </aside>
          <main style={styles.content}>
            <h1 style={styles.title}>{pageTitle}</h1>
            <NoticeDetailContent onTitleLoaded={updatePageTitle} />
          </main>
        </div>
      </div>
    </NoticeProvider>
  );
}

export default NoticeUserManagerPage;
