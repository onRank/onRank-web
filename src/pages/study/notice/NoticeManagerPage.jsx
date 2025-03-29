import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import NoticeList from "../../../components/study/notice/NoticeList";
import NoticeDetail from "../../../components/study/notice/NoticeDetail";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebar from "../../../components/study/StudySidebar";
import { studyService } from "../../../services/api";

function NoticeManagerPageContent() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const { notices, getNotices, isLoading, error } = useNotice();
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [pageInitialized, setPageInitialized] = useState(false);

  // 페이지 로드 시 공지사항 목록 가져오기
  useEffect(() => {
    if (!pageInitialized) {
      console.log("[NoticeManagerPage] 공지사항 목록 로드 시도");
      getNotices(studyId);
      setPageInitialized(true);
    }
  }, [studyId, getNotices, pageInitialized]);

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
  };

  // 로딩 중일 때 LoadingSpinner 표시
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={{ display: "flex" }}>
      <StudySidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        {selectedNoticeId ? (
          <NoticeDetail
            studyId={studyId}
            noticeId={selectedNoticeId}
            handleBack={handleBack}
          />
        ) : (
          <>
            <h1 className="text-xl font-bold mb-6">공지사항 관리</h1>
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
  );
}

function NoticeManagerPage() {
  const { studyId } = useParams();
  const [studyData, setStudyData] = useState({ title: "로딩 중..." });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      {/* 경로 표시 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "2rem",
          fontSize: "14px",
          color: "#666666",
          width: "100%",
        }}
      >
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
          {studyData.title}
        </Link>
        <span>{">"}</span>
        <span
          style={{
            color: "#FF0000",
            fontWeight: "bold",
            padding: "2px 4px",
          }}
        >
          공지사항
        </span>
      </div>

      {/* 오류 메시지 표시 */}
      {error && <ErrorMessage message={error} />}

      {/* 메인 컨텐츠 */}
      <NoticeProvider>
        <NoticeManagerPageContent />
      </NoticeProvider>
    </div>
  );
}

export default NoticeManagerPage;
