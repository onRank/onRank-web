import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { noticeService, studyService } from "../../../services/api";
import NoticeList from "../../../components/study/notice/NoticeList";
import NoticeDetail from "../../../components/study/notice/NoticeDetail";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebar from "../../../components/study/StudySidebar";
import Button from "../../../components/common/Button";

function NoticeManagerPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

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

  const styles = {
    outerContainer: {
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
      padding: "0 20px",
    },
    container: {
      display: "flex",
      minHeight: "100vh",
    },
    sidebarArea: {
      width: "200px",
      backgroundColor: "#f9f9f9",
      borderRight: "1px solid #e5e5e5",
    },
    contentArea: {
      flex: 1,
      padding: "20px",
    },
    title: {
      fontSize: "22px",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    addNoticeCard: {
      backgroundColor: "#fff",
      border: "1px solid #e5e5e5",
      borderRadius: "6px",
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
    createButton: {
      backgroundColor: "#DC3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: "14px",
    },
    noticeCard: {
      backgroundColor: "#fff",
      border: "1px solid #e5e5e5",
      borderRadius: "6px",
      padding: "15px",
      marginBottom: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
    },
    noticeIcon: {
      marginRight: "10px",
      color: "#666",
    },
    noticeTitle: {
      fontSize: "15px",
      fontWeight: "500",
    },
    noticeDate: {
      fontSize: "14px",
      color: "#888",
    },
    studyTitle: {
      fontSize: "14px",
      color: "#999",
      marginBottom: "12px",
      padding: "0 16px",
    },
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={styles.outerContainer}>
      {/* 경로 표시 */}
      <div style={styles.breadcrumb}>
        <Link
          to="/studies"
          style={{
            display: "flex",
            alignItems: "center",
            color: "#666666",
            textDecoration: "none",
            transition: "color 0.2s ease",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
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
          style={{
            color: "#FF0000",
            textDecoration: "none",
            transition: "color 0.2s ease",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
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
          style={{
            color: "#FF0000",
            textDecoration: "none",
            transition: "color 0.2s ease",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
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

      <div style={styles.container}>
        <div style={styles.sidebarArea}>
          <div style={styles.studyTitle}>스터디 이름</div>
          <StudySidebar activeTab="공지사항" />
        </div>

        <div style={styles.contentArea}>
          <h1 style={styles.title}>공지사항</h1>

          <div style={styles.addNoticeCard}>
            <div>
              <div style={styles.addNoticeText}>공지사항 추가</div>
              <div style={styles.addNoticeSubtext}>
                공지사항을 추가해주세요.
              </div>
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
      </div>
    </div>
  );
}

export default NoticeManagerPage;
