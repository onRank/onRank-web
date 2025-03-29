import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { noticeService, studyService } from "../../../services/api";
import NoticeList from "../../../components/study/notice/NoticeList";
import NoticeDetail from "../../../components/study/notice/NoticeDetail";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebar from "../../../components/study/StudySidebar";

function NoticeManagerPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  // 스타일 정의
  const styles = {
    wrapper: {
      minHeight: "100vh",
      fontFamily: "sans-serif",
      backgroundColor: "#f9f9f9",
      color: "#333",
      width: "100%",
      maxWidth: "100%",
      overflowX: "hidden",
    },
    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "2rem",
      fontSize: "14px",
      color: "#666666",
      width: "100%",
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
    breadcrumbLinkActive: {
      color: "#FF0000",
      textDecoration: "none",
      transition: "color 0.2s ease",
      padding: "4px 8px",
      borderRadius: "4px",
      fontWeight: "bold",
    },
    mainArea: {
      display: "flex",
    },
    sidebar: {
      width: "220px",
      padding: "16px",
      backgroundColor: "#fff",
      borderRight: "1px solid #eee",
    },
    studyTitle: {
      fontSize: "14px",
      color: "#999",
      marginBottom: "12px",
    },
    content: {
      flex: 1,
      padding: "32px",
    },
    noticeTitle: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "24px",
    },
    createCard: {
      backgroundColor: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    createText: {
      fontWeight: "bold",
      marginBottom: "4px",
    },
    createSubText: {
      fontSize: "14px",
      color: "#888",
    },
    noticeList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    noticeItem: {
      backgroundColor: "#fff",
      padding: "16px",
      borderRadius: "8px",
      marginBottom: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      cursor: "pointer",
    },
    noticeInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    noticeIcon: {
      backgroundColor: "#f0f0f0",
      padding: "8px",
      borderRadius: "6px",
    },
    noticeDate: {
      fontSize: "14px",
      color: "#999",
    },
  };

  // 스터디 정보 관련 상태
  const [studyData, setStudyData] = useState({ title: "로딩 중..." });

  // 공지사항 관련 상태
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);

  // 페이지 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInitialized, setPageInitialized] = useState(false);

  // 스터디 정보 가져오기
  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        setIsLoading(true);
        const data = await studyService.getStudyById(studyId);
        if (data) {
          setStudyData({
            title: data.studyName || "제목 없음",
            // 기타 필요한 데이터
          });
        } else {
          setError("스터디 정보를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("스터디 정보 로드 오류:", err);
        setError("스터디 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyData();
  }, [studyId]);

  // 공지사항 목록 가져오기
  useEffect(() => {
    if (!pageInitialized) {
      const getNotices = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log("[NoticeManagerPage] 공지사항 목록 로드 시도");
          const response = await noticeService.getNotices(studyId);
          if (response.success) {
            setNotices(response.data || []);
          } else {
            setError(
              response.message || "공지사항 목록을 불러오는데 실패했습니다."
            );
          }
        } catch (err) {
          console.error("공지사항 목록 조회 실패:", err);
          setError(err.message || "공지사항 목록을 불러오는데 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      };

      getNotices();
      setPageInitialized(true);
    }
  }, [studyId, pageInitialized]);

  // 공지사항 상세 가져오기
  useEffect(() => {
    if (selectedNoticeId) {
      const getNoticeById = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await noticeService.getNoticeById(
            studyId,
            selectedNoticeId
          );
          if (response.success) {
            setSelectedNotice(response.data);
          } else {
            setError(response.message || "공지사항을 불러오는데 실패했습니다.");
          }
        } catch (err) {
          console.error("공지사항 상세 조회 실패:", err);
          setError(err.message || "공지사항을 불러오는데 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      };

      getNoticeById();
    }
  }, [studyId, selectedNoticeId]);

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
    setSelectedNotice(null);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={styles.wrapper}>
      {/* 경로 표시 */}
      <div style={styles.breadcrumb}>
        <Link
          to="/studies"
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
          style={styles.breadcrumbLinkActive}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F8F9FA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {studyData.title}
        </Link>
        <span>{">"}</span>
        <Link
          to={`/studies/${studyId}/notices`}
          style={styles.breadcrumbLinkActive}
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

      {/* 메인 컨텐츠 */}
      <div style={styles.mainArea}>
        <StudySidebar activeTab="공지사항" />
        <div style={styles.content}>
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
            <>
              <h2 style={styles.noticeTitle}>공지사항 관리</h2>
              <NoticeList
                notices={notices}
                onNoticeClick={handleNoticeClick}
                handleCreate={handleCreate}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoticeManagerPage;
