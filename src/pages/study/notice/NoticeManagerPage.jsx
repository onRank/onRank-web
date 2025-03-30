import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { noticeService } from "../../../services/api";
import NoticeList from "../../../components/study/notice/NoticeList";
import NoticeDetail from "../../../components/study/notice/NoticeDetail";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
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
      padding: "20px",
      minWidth: 0, // 중요: 플렉스 아이템이 너비를 초과하지 않도록 설정
      overflow: "auto", // 필요한 경우에만 스크롤 표시
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
    return <LoadingSpinner />;
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
          // styles={{
          //   noticeCard: styles.noticeCard,
          //   noticeIcon: styles.noticeIcon,
          //   noticeTitle: styles.noticeTitle,
          //   noticeDate: styles.noticeDate,
          // }}
        />
      )}
    </div>
  );
}

// 메인 공지사항 페이지 컴포넌트
function NoticeManagerPage() {
  const { studyId } = useParams();
  const [studyData, setStudyData] = useState({ title: "" });

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
    },
  };

  return (
    <NoticeProvider>
      <div style={styles.container}>
        <StudySidebar activeTab="공지사항" />
        <NoticeContent />
      </div>
    </NoticeProvider>
  );
}

export default NoticeManagerPage;
