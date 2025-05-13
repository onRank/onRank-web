import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { usePost, PostProvider } from "../../../components/study/post/PostProvider";
import PostList from "../../../components/study/post/PostList";
import PostDetail from "./PostDetail";
import PostForm from "../../../components/study/post/PostForm";
import PostEditForm from "../../../components/study/post/PostEditForm";
import useStudyRole from "../../../hooks/useStudyRole";
import Button from "../../../components/common/Button";
import "../../../styles/post.css";

// 내부 컨테이너 (Provider 안에서 실제 로직 처리)
const PostInnerContainer = ({ onSubPageChange }) => {
  const { studyId, postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    posts,
    selectedPost,
    isLoading: contextLoading,
    error,
    memberRole,
    getPosts,
    getPostById,
    createPost,
    editPost,
    deletePost,
  } = usePost();

  const { isManager } = useStudyRole();
  const [isLoading, setIsLoading] = useState(false);

  // 현재 경로 상태 분석
  const isAddPage = location.pathname.endsWith("/posts/add");
  const isEditPage = location.pathname.includes("/edit");
  const isDetailPage = postId && !isEditPage && !isAddPage;

  // 목록/상세 데이터 패칭
  useEffect(() => {
    if (!isAddPage && posts.length === 0) {
      getPosts(studyId);
    }
  }, [studyId, posts.length, getPosts, isAddPage]);

  useEffect(() => {
    if (postId) {
      getPostById(studyId, postId);
    }
  }, [studyId, postId, getPostById]);

  // subPage 상태 부모 전달
  useEffect(() => {
    if (isAddPage) onSubPageChange("추가");
    else if (isEditPage) onSubPageChange("수정");
    else if (isDetailPage) onSubPageChange("상세");
    else onSubPageChange(null);

    return () => onSubPageChange(null);
  }, [isAddPage, isEditPage, isDetailPage, onSubPageChange]);

  // 로딩 상태 동기화
  useEffect(() => {
    setIsLoading(contextLoading);
  }, [contextLoading]);

  // 네비게이션 유틸
  const navigateToList = () => navigate(`/studies/${studyId}/posts`);
  const navigateToAdd = () => navigate(`/studies/${studyId}/posts/add`);
  const navigateToEdit = (id) => navigate(`/studies/${studyId}/posts/${id}/edit`);
  const navigateToDetail = (id) => navigate(`/studies/${studyId}/posts/${id}`);

  // CRUD 핸들러
  const handleSubmitCreate = async (postData, files) => {
    setIsLoading(true);
    const newPost = postData; // {postTitle, postContent, fileNames}
    try {
      const result = await createPost(studyId, newPost, files);
      if (result.success) {
        navigateToList();
        return true;
      }
      alert(result.message || "게시글 생성에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (id, updatedPostData, files) => {
    setIsLoading(true);
    try {
      const result = await editPost(studyId, id, updatedPostData, files);
      if (result.success) {
        navigateToDetail(id);
        return true;
      }
      alert(result.message || "게시글 수정에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return false;
    const result = await deletePost(studyId, id);
    if (result.success) {
      navigateToList();
      return true;
    }
    alert(result.message || "게시글 삭제에 실패했습니다.");
    return false;
  };

  // 렌더링 분기
  if (isAddPage) {
    return (
      <div>
        <h1 className="page-title">게시글 추가</h1>
        <PostForm
          onSubmit={handleSubmitCreate}
          onCancel={navigateToList}
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (isEditPage && selectedPost) {
    return (
      <div>
        <h1 className="page-title">게시글 수정</h1>
        <PostEditForm
          studyId={studyId}
          postId={postId}
          initialData={selectedPost}
          onCancel={navigateToList}
          onSaveComplete={() => navigateToDetail(postId)}
        />
      </div>
    );
  }

  if (isDetailPage && selectedPost) {
    return (
      <div>
        <h1 className="page-title">게시글 상세</h1>
        <PostDetail
          studyId={studyId}
          postId={selectedPost.postId}
          handleBack={navigateToList}
          handleEdit={isManager ? navigateToEdit : undefined}
          handleDelete={isManager ? handleDelete : undefined}
        />
      </div>
    );
  }

  // 목록 페이지
  return (
    <div>
      <h1 className="page-title">게시판</h1>

      {isManager && (
        <div className="add-section-box">
          <div>
            <div className="add-section-title">게시글 추가</div>
            <div className="add-section-description">새로운 게시글을 추가해주세요.</div>
          </div>
          <Button variant="add" onClick={navigateToAdd} />
        </div>
      )}

      {isLoading ? (
        <div className="loading-message">로딩중...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : posts && posts.length === 0 ? (
        <div className="empty-message">등록된 게시글이 없습니다.</div>
      ) : (
        <PostList
          posts={posts}
          onPostClick={navigateToDetail}
          onEdit={isManager ? navigateToEdit : undefined}
          onDelete={isManager ? handleDelete : undefined}
        />
      )}
    </div>
  );
};

PostInnerContainer.propTypes = {
  onSubPageChange: PropTypes.func.isRequired,
};

export default function PostContainer({ onSubPageChange }) {
  return (
    <PostProvider>
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            position: "relative",
            padding: "0 1rem",
            marginTop: "1rem",
          }}
        >
          <PostInnerContainer onSubPageChange={onSubPageChange} />
        </div>
      </div>
    </PostProvider>
  );
}

PostContainer.propTypes = {
  onSubPageChange: PropTypes.func.isRequired,
}; 