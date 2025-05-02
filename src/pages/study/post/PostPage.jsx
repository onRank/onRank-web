import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostList from "../../../components/study/post/PostList";
import PostDetail from "../../../components/study/post/PostDetail";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebarContainer from "../../../components/common/sidebar/StudySidebarContainer";
import Button from "../../../components/common/Button";
import { usePost } from "../../../components/study/post/PostProvider";
import PostEditForm from "../../../components/study/post/PostEditForm";

// 실제 게시판 컨텐츠를 표시하는 컴포넌트
function PostContent() {
  const navigate = useNavigate();
  const { studyId, postId } = useParams();
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  // PostProvider에서 상태와 함수 가져오기
  const {
    posts,
    isLoading,
    error,
    getPosts,
    getPostById,
    deletePost,
    selectedPost,
  } = usePost();

  // 페이지 마운트 시 게시판 목록 가져오기
  useEffect(() => {
    getPosts(studyId);
  }, [studyId, getPosts]);

  // URL에 postId가 있으면 해당 게시물 로드
  useEffect(() => {
    if (postId) {
      setSelectedPostId(parseInt(postId, 10));
      getPostById(studyId, parseInt(postId, 10));
    }
  }, [studyId, postId, getPostById]);

  // 게시판 작성 페이지로 이동
  const handleCreate = () => {
    navigate(`/studies/${studyId}/posts/add`);
  };

  // 게시판 상세 보기
  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    navigate(`/studies/${studyId}/posts/${postId}`);
  };

  // 게시판 상세 보기에서 목록으로 돌아가기
  const handleBack = () => {
    setSelectedPostId(null);
    navigate(`/studies/${studyId}/posts`);
  };

  // 게시판 수정 모드 활성화
  const handleEdit = (postId) => {
    setIsEditMode(true);
    setSelectedPostId(postId);
    navigate(`/studies/${studyId}/posts/${postId}`);
    <PostEditform />;
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setPermissionError("");

    if (selectedPostId) {
      getPostById(studyId, selectedPostId);
    }
  };

  // 수정 완료 후 처리
  const handleEditComplete = () => {
    setIsEditMode(false);
    setPermissionError("");
    getPostById(studyId, parseInt(selectedPostId, 10));
  };

  // 권한 오류 처리
  const handlePermissionError = (message) => {
    setPermissionError(message || "권한이 없습니다.");
  };

  // 게시물 삭제 처리 함수
  const handleDelete = async (postId) => {
    try {
      if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
        return; // 사용자가 취소한 경우
      }

      const result = await deletePost(studyId, postId);

      if (result.success) {
        // 삭제 성공 시 목록 새로고침 및 목록 화면으로 이동
        getPosts(studyId);

        // 상세 화면에 있었다면 목록으로 이동
        if (selectedPostId) {
          setSelectedPostId(null);
          navigate(`/studies/${studyId}/posts`);
        }

        // 성공 메시지 표시
        alert("게시물이 삭제되었습니다.");
      } else {
        // 실패 시 오류 메시지
        alert(result.message || "게시물 삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("게시물 삭제 중 오류:", error);
      alert("게시물 삭제 중 오류가 발생했습니다.");
    }
  };

  const styles = {
    contentArea: {
      flex: 1,
      height: "fit-content",
      paddingTop: "20px",
      paddingLeft: "40px",
      paddingRight: "40px",
      paddingBottom: "70px",
      minWidth: 0,
      overflow: "hidden",
    },
    title: {
      fontSize: "22px",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    addPostCard: {
      backgroundColor: "#fff",
      border: "1px solid #e5e5e5",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    addPostText: {
      fontWeight: "normal",
    },
    addPostSubtext: {
      color: "#777",
      fontSize: "14px",
      marginTop: "5px",
    },
    errorMessage: {
      backgroundColor: "#fdecea",
      color: "#e74c3c",
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "16px",
    },
  };

  // 편집 모드면 편집 폼 표시
  if (selectedPostId && isEditMode) {
    return (
      <div style={styles.contentArea}>
        <h1 style={styles.title}>게시판 수정</h1>

        {permissionError && (
          <div style={styles.errorMessage}>
            {permissionError}
            <div style={{ marginTop: "8px" }}>
              <Button
                variant="back"
                onClick={handleCancelEdit}
                text="돌아가기"
              />
            </div>
          </div>
        )}

        <PostEditForm
          studyId={studyId}
          postId={selectedPostId}
          initialData={selectedPost}
          onCancel={handleCancelEdit}
          onSaveComplete={handleEditComplete}
          onPermissionError={handlePermissionError}
        />
      </div>
    );
  }

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={styles.contentArea}>
      <h1 style={styles.title}>게시판</h1>

      <div style={styles.addPostCard}>
        <div>
          <div style={styles.addPostText}>게시판 추가</div>
          <div style={styles.addPostSubtext}>
            새로운 게시판 글을 추가해주세요
          </div>
        </div>
        <Button variant="create" onClick={handleCreate} />
      </div>

      {selectedPostId ? (
        <PostDetail
          studyId={studyId}
          postId={selectedPostId}
          handleBack={handleBack}
          handleEdit={() => handleEdit(selectedPostId)}
          handleDelete={() => handleDelete(selectedPostId)}
        />
      ) : (
        <PostList
          posts={posts}
          onPostClick={handlePostClick}
          onEditPost={handleEdit}
          onDeletePost={handleDelete}
          handleCreate={handleCreate}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// 메인 게시판 페이지 컴포넌트
function PostPage() {
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
        console.error("[PostPage] 캐시 데이터 파싱 오류:", err);
      }
    }
  }, [studyId]);

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      overflow: "hidden",
      height: "fit-content",
      padding: "0 1rem",
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
    <div style={styles.container}>
      <StudySidebarContainer activeTab="게시판" />
      <PostContent />
    </div>
  );
}

export default PostPage;
