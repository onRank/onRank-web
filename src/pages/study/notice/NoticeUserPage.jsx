// 일반 사용자가 보는 공지사항 페이지

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import NoticeList from "../../../components/study/notice/NoticeList";
import NoticeDetail from "../../../components/study/notice/NoticeDetail";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";

function NoticeUserPageContent() {
  const { studyId } = useParams();
  const { notices, getNotices, isLoading, error } = useNotice();
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [pageInitialized, setPageInitialized] = useState(false);

  // 페이지 로드 시 공지사항 목록 가져오기
  useEffect(() => {
    if (!pageInitialized) {
      console.log("[NoticeUserPage] 공지사항 목록 로드 시도");
      getNotices(studyId);
      setPageInitialized(true);
    }
  }, [studyId, getNotices, pageInitialized]);

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

  // 공지사항 상세 보기
  if (selectedNoticeId) {
    return (
      <NoticeDetail
        studyId={studyId}
        noticeId={selectedNoticeId}
        handleBack={handleBack}
      />
    );
  }

  // 공지사항 목록 보기 (생성 기능 없음)
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">공지사항</h1>
      <NoticeList
        notices={notices}
        onNoticeClick={handleNoticeClick}
        isLoading={isLoading}
        handleCreate={null} // 사용자는 공지사항 생성 권한이 없음
      />
    </div>
  );
}

function NoticeUserPage() {
  return (
    <NoticeProvider>
      <NoticeUserPageContent />
    </NoticeProvider>
  );
}

export default NoticeUserPage;
