import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import NoticeList from "../../../components/study/notice/NoticeList";
import NoticeDetail from "../../../components/study/notice/NoticeDetail";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebar from "../../../components/study/StudySidebar";
import Header from "../../../components/common/Header";

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
    <div>
      <Header />
      <div style={{ display: "flex" }}>
        <StudySidebar activeTab="공지사항" />
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
    </div>
  );
}

function NoticeManagerPage() {
  return (
    <NoticeProvider>
      <NoticeManagerPageContent />
    </NoticeProvider>
  );
}

export default NoticeManagerPage;
