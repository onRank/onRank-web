import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import NoticeList from "../../../components/study/notice/NoticeList";
import NoticeDetail from "../../../components/study/notice/NoticeDetail";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebar from "../../../components/study/StudySidebar";
import Button from "../../../components/common/Button";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";

// 실제 공지사항 컨텐츠를 표시하는 컴포넌트
function NoticeContent() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);

  // NoticeProvider에서 상태와 함수 가져오기
  const {
    notices,
    selectedNotice,
    isLoading,
    error,
    getNotices,
    getNoticeById,
  } = useNotice();

  // 페이지 마운트 시 공지사항 목록 가져오기
  useEffect(() => {
    getNotices(studyId);
  }, [studyId, getNotices]);

  // 선택된 공지사항 ID가 변경될 때 상세 정보 가져오기
  useEffect(() => {
    if (selectedNoticeId) {
      getNoticeById(studyId, selectedNoticeId);
    }
  }, [studyId, selectedNoticeId, getNoticeById]);

  // 공지사항 작성 페이지로 이동
  const handleCreate = () => {
    navigate(`/studies/${studyId}/notices/add`);
  };

  // 공지사항 상세 보기
  const handleNoticeClick = (noticeId) => {
    setSelectedNoticeId(noticeId);
    navigate(`/studies/${studyId}/notices/${noticeId}`);
  };

  // 공지사항 상세 보기에서 목록으로 돌아가기
  const handleBack = () => {
    setSelectedNoticeId(null);
    navigate(`/studies/${studyId}/notices`);
  };

  const styles = {
    contentArea: {
      flex: 1,
      height: "fit-content",
      padding: "0 40px",
      minWidth: 0, // 중요: 플렉스 아이템이 너비를 초과하지 않도록 설정
      overflow: "hidden", // 필요한 경우에만 스크롤 표시
    },
    title: {
      fontSize: "22px",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    addNoticeCard: {
      backgroundColor: "#fff",
      border: "1px solid #e5e5e5",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    addNoticeText: {
      fontWeight: "normal",
    },
    addNoticeSubtext: {
      color: "#777",
      fontSize: "14px",
      marginTop: "5px",
    },
  };

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={styles.contentArea}>
      <h1 style={styles.title}>공지사항</h1>

      <div style={styles.addNoticeCard}>
        <div>
          <div style={styles.addNoticeText}>공지사항 추가</div>
          <div style={styles.addNoticeSubtext}>공지사항을 추가해주세요.</div>
        </div>
        <Button variant="create" onClick={handleCreate} />
      </div>

      {selectedNoticeId ? (
        <NoticeDetail
          studyId={studyId}
          noticeId={selectedNoticeId}
          selectedNotice={selectedNotice}
          handleBack={handleBack}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <NoticeList
          notices={notices}
          onNoticeClick={handleNoticeClick}
          handleCreate={handleCreate}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// 메인 공지사항 페이지 컴포넌트
function NoticeManagerPage() {
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
      maxHeight: "100vh",
      overflow: "hidden",
      height: "fit-content",
      padding: "0 1rem",
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
  };

  return (
    <NoticeProvider>
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
        <span style={styles.activeTab}>공지사항</span>
      </div>
      <div style={styles.container}>
        <StudySidebar activeTab="공지사항" />
        <NoticeContent />
      </div>
    </NoticeProvider>
  );
}

export default NoticeManagerPage;
