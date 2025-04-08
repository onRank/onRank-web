import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import PostList from "../../../components/study/post/PostList";
import PostDetail from "../../../components/study/post/PostDetail";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebar from "../../../components/study/StudySidebar";
import Button from "../../../components/common/Button";
import {
  PostProvider,
  usePost,
} from "../../../components/study/post/PostProvider";

// 실제 게시판 컨텐츠를 표시하는 컴포넌트
function PostContent() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const [selectedPostId, setSelectedPostId] = useState(null);

  // PostProvider에서 상태와 함수 가져오기
  const { posts, selectedPost, isLoading, error, getPosts, getPostById } =
    usePost();

  // 페이지 마운트 시 게시판 목록 가져오기
  useEffect(() => {
    getPosts(studyId);
  }, [studyId, getPostById]);

  // 선택된 게시판 ID가 변경될 때 상세 정보 가져오기
  useEffect(() => {
    if (selectedPostId) {
      getPostById(studyId, selectedPostId);
    }
  }, [studyId, selectedPostId, getPostById]);

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

  const styles = {
    contentArea: {
      flex: 1,
      height: "fit-content",
      padding: "20px 40px",
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
  };

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
          selectedPost={selectedPost}
          handleBack={handleBack}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <PostList
          posts={posts}
          onPostClick={handlePostClick}
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
    <PostProvider>
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
        <span style={styles.activeTab}>게시판</span>
      </div>
      <div style={styles.container}>
        <StudySidebar activeTab="게시판" />
        <PostContent />
      </div>
    </PostProvider>
  );
}

export default PostPage;
