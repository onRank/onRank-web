import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotice } from "../../../components/study/notice/NoticeProvider";
import NoticeList from "../../../components/study/notice/NoticeList";
import NoticeEditForm from "../../../components/study/notice/NoticeEditForm";
import StudySidebarContainer from "../../../components/common/sidebar/StudySidebarContainer";
import Button from "../../../components/common/Button";
import { noticeService } from "../../../services/notice";

// 실제 공지사항 컨텐츠를 표시하는 컴포넌트
function NoticeContent() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const { notices, isLoading, error, getPosts, deleteNotice } = useNotice();

  // 수정 모드 상태 추가
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    getPosts(studyId);
  }, [studyId, getPosts]);

  // 공지사항 클릭 핸들러 (상세 페이지로 이동)
  const handleNoticeClick = (noticeId) => {
    // 이미 수정 모드라면 클릭해도 이동하지 않음
    if (!isEditMode) {
      navigate(`/studies/${studyId}/notices/${noticeId}`);
    }
  };

  // 공지사항 추가 버튼 핸들러
  const handleCreate = () => {
    navigate(`/studies/${studyId}/notices/add`);
  };

  // 수정 버튼 클릭 핸들러
  const handleEdit = async (noticeId) => {
    // 수정 모드로 전환
    setIsEditMode(true);
    setEditingNoticeId(noticeId);

    // 수정할 공지사항 데이터 로드
    try {
      setContentLoading(true);
      const response = await noticeService.getNoticeById(studyId, noticeId);
      if (response.success && response.data) {
        setEditingNotice(response.data);
      } else {
        alert("공지사항 정보를 불러오는데 실패했습니다.");
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("공지사항 로드 중 오류:", error);
      alert("공지사항 정보를 불러오는데 실패했습니다.");
      setIsEditMode(false);
    } finally {
      setContentLoading(false);
    }
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = async (noticeId) => {
    if (!window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const result = await deleteNotice(studyId, noticeId);
      if (result.success) {
        // 목록 다시 로드
        getPosts(studyId);
      } else {
        alert(result.message || "공지사항 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 삭제 중 오류:", error);
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    }
  };

  // 수정 취소 핸들러
  const handleEditCancel = () => {
    setIsEditMode(false);
    setEditingNoticeId(null);
    setEditingNotice(null);
  };

  // 수정 완료 핸들러
  const handleEditComplete = () => {
    setIsEditMode(false);
    setEditingNoticeId(null);
    setEditingNotice(null);
    // 목록 다시 로드
    getPosts(studyId);
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
    <div>
      {isEditMode && editingNotice ? (
        // 수정 모드일 때 NoticeEditForm 렌더링
        <NoticeEditForm
          studyId={studyId}
          noticeId={editingNoticeId.toString()}
          initialData={editingNotice}
          onCancel={handleEditCancel}
          onSaveComplete={handleEditComplete}
        />
      ) : (
        // 목록 모드일 때 NoticeList와 생성 버튼 렌더링
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "16px",
            }}
          >
            <Button variant="create" onClick={handleCreate} />
          </div>
          <NoticeList
            notices={notices}
            onNoticeClick={handleNoticeClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}

// 메인 공지사항 페이지 컴포넌트
function NoticeManagerPage() {
  const { studyId } = useParams();
  const [pageTitle, setPageTitle] = useState("공지사항");
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
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    activeTab: {
      color: "#FF0000",
      fontWeight: "bold",
      padding: "2px 4px",
    },
    addButton: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "16px",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.main}>
        <aside>
          <StudySidebarContainer activeTab="공지사항" />
        </aside>
        <main style={styles.content}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <NoticeContent />
        </main>
      </div>
    </div>
  );
}

export default NoticeManagerPage;
