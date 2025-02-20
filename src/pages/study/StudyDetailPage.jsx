import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { studyService } from "../../services/api";
import NoticeList from "../../components/study/notice/NoticeList";
import NoticeDetail from "../../components/study/notice/NoticeDetail";
import ErrorMessage from "../../components/common/ErrorMessage";

function StudyDetailPage() {
  const { studyId } = useParams();
  const location = useLocation();
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL에서 현재 섹션 가져오기
  const getCurrentSection = () => {
    const pathParts = location.pathname.split("/");
    return pathParts.length > 3 ? pathParts[3] : "study-detail";
  };

  useEffect(() => {
    let isMounted = true;

    const fetchNotices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await studyService.getNotices(studyId);
        if (isMounted) {
          setNotices(data);
        }
      } catch (error) {
        if (isMounted) {
          console.error("공지사항 목록 조회 실패:", error);
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const currentSection = getCurrentSection();
<<<<<<< HEAD
    if (currentSection === "notices") {
=======
    if (currentSection === 'notices') {
>>>>>>> afcffeb517a608c94f70d23e174400b47717dd30
      fetchNotices();
    }

    return () => {
      isMounted = false;
    };
  }, [studyId, location.pathname]);

  const handleCreateNotice = () => {
    window.location.href = `/studies/${studyId}/notices/add`;
  };

  const renderContent = () => {
    const currentSection = getCurrentSection();

    switch (currentSection) {
<<<<<<< HEAD
      case "notice":
=======
      case 'notices':
>>>>>>> afcffeb517a608c94f70d23e174400b47717dd30
        return selectedNoticeId ? (
          <NoticeDetail
            studyId={studyId}
            noticeId={selectedNoticeId}
            onBack={() => setSelectedNoticeId(null)}
          />
        ) : (
          <NoticeList
            notices={notices}
            onNoticeClick={setSelectedNoticeId}
            onCreateClick={handleCreateNotice}
            isLoading={isLoading}
          />
        );
      case "schedule":
        return <div>일정 컴포넌트가 들어갈 자리입니다</div>;
      case "assignment":
        return <div>과제 컴포넌트가 들어갈 자리입니다</div>;
      case "board":
        return <div>게시판 컴포넌트가 들어갈 자리입니다</div>;
      case "attendance":
        return <div>출석 컴포넌트가 들어갈 자리입니다</div>;
      case "manage":
        return <div>관리 컴포넌트가 들어갈 자리입니다</div>;
      case "ranking":
        return <div>랭킹&보증금 컴포넌트가 들어갈 자리입니다</div>;
      default:
        return <div>스터디 정보 컴포넌트가 들어갈 자리입니다</div>;
    }
  };

  return (
    <>
      {error && <ErrorMessage message={error} />}
      {renderContent()}
    </>
  );
}

export default StudyDetailPage;
