import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { postService } from "../../../services/post";
import PostListPage from "./PostListPage";
import PostDetail from "./PostDetail";
import PostCreate from "./PostCreate";
import PostEdit from "./PostEdit";

function PostContainer({ onSubPageChange }) {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [memberRole, setMemberRole] = useState(null);
  const { studyId, postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAddPage = location.pathname.includes("/posts/add");
  const isEditPage = location.pathname.includes("/edit");
  const isDetailPage = postId && !isEditPage && !isAddPage;

  // postId가 URL에 있는 경우 해당 게시글 상세 정보 조회
  useEffect(() => {
    const fetchPostDetail = async () => {
      if (postId) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await postService.getPostById(studyId, postId);
          if (response.success) {
            setSelectedPost(response.data);
            // 멤버 권한 정보 업데이트
            updateMemberRoleFromResponse(response);
          } else {
            setError(response.message || "게시글을 불러오는데 실패했습니다.");
            setSelectedPost(null);
          }
        } catch (error) {
          console.error("[PostContainer] 게시글 상세 조회 실패:", error);
          setError("게시글을 불러오는 중 오류가 발생했습니다.");
          setSelectedPost(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (postId) {
      fetchPostDetail();
    }
  }, [postId, studyId, updateMemberRoleFromResponse]);

  // 게시글 목록 조회
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await postService.getPosts(studyId);
        
        // 멤버 권한 정보 업데이트
        updateMemberRoleFromResponse(response);
        
        if (response.success) {
          console.log("[PostContainer] 게시글 목록 조회 성공:", response.data);
          setPosts(response.data || []);
        } else {
          setError(response.message || "게시글을 불러오는데 실패했습니다.");
          setPosts([]);
        }
      } catch (error) {
        console.error("[PostContainer] 게시글 데이터 조회 실패:", error);
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAddPage && !postId) {
      fetchPosts();
    }
  }, [studyId, isAddPage, updateMemberRoleFromResponse, postId]);

  // 응답에서 멤버 권한 정보 추출 및 업데이트
  function updateMemberRoleFromResponse(response) {
    if (response && response.memberContext) {
      setMemberRole(response.memberContext.memberRole);
    }
  }

  // 게시글 추가 페이지로 이동
  const handleAddPost = () => {
    navigate(`/studies/${studyId}/posts/add`);
  };

  // 새 게시글 생성
  const handleCreatePost = async (title, content, selectedFiles) => {
    setIsLoading(true);
    setError(null);
    try {
      // 게시글 데이터 구성
      const postData = {
        title,
        content,
        files: selectedFiles
      };

      // 게시글 생성 요청
      const result = await postService.createPost(studyId, postData);
      if (result.success) {
        // 게시글 목록 갱신 - API 호출 또는 로컬 상태 업데이트
        try {
          const updatedPostsResponse = await postService.getPosts(studyId);
          if (updatedPostsResponse.success) {
            setPosts(updatedPostsResponse.data || []);
          } else {
            // API 호출에 실패한 경우 로컬 상태에 새 게시글 추가
            setPosts(prevPosts => [result.data, ...prevPosts]);
          }
        } catch (updateError) {
          // 업데이트 실패 시 로컬 상태 업데이트
          setPosts(prevPosts => [result.data, ...prevPosts]);
        }

        // 목록 페이지로 이동
        navigate(`/studies/${studyId}/posts`);
      } else {
        setError(result.message || "게시글 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("[PostContainer] 게시글 추가 실패:", error);
      setError("게시글을 추가하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (postId) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await postService.deletePost(studyId, postId);
      if (result.success) {
        // 게시글 목록에서 삭제된 게시글 제거
        try {
          const updatedPostsResponse = await postService.getPosts(studyId);
          if (updatedPostsResponse.success) {
            setPosts(updatedPostsResponse.data || []);
          } else {
            // API 호출에 실패한 경우 로컬 상태 업데이트
            setPosts(prevPosts => prevPosts.filter(post => post.postId !== parseInt(postId)));
          }
        } catch (updateError) {
          // 업데이트 실패 시 로컬 상태 업데이트
          setPosts(prevPosts => prevPosts.filter(post => post.postId !== parseInt(postId)));
        }
        return true;
      } else {
        setError(result.message || "게시글 삭제에 실패했습니다.");
        return false;
      }
    } catch (error) {
      console.error("[PostContainer] 게시글 삭제 실패:", error);
      setError("게시글을 삭제하는 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 수정
  const handleUpdatePost = async (postId, updatedPost, selectedFiles) => {
    setIsLoading(true);
    setError(null);
    try {
      // 게시글 데이터 구성
      const postData = {
        title: updatedPost.title,
        content: updatedPost.content,
        files: selectedFiles
      };

      const result = await postService.updatePost(studyId, postId, postData);
      if (result.success) {
        // 게시글 상세 정보 갱신
        try {
          const updatedPostResponse = await postService.getPostById(studyId, postId);
          if (updatedPostResponse.success && updatedPostResponse.data) {
            // 상세 정보 업데이트
            setSelectedPost(updatedPostResponse.data);
            // 목록 업데이트
            setPosts(prevPosts => prevPosts.map(post =>
              post.postId === parseInt(postId)
                ? updatedPostResponse.data
                : post
            ));
          } else {
            // API 호출에 실패한 경우 로컬 상태 업데이트
            const updatedPostData = {
              postId: parseInt(postId),
              title: updatedPost.title,
              content: updatedPost.content,
              updatedAt: new Date().toISOString(),
              // 기존 데이터 유지
              createdAt: selectedPost?.createdAt,
              writer: selectedPost?.writer,
              files: selectedFiles || selectedPost?.files || [],
              ...updatedPostData
            };
            
            setSelectedPost(updatedPostData);
            setPosts(prevPosts => prevPosts.map(post =>
              post.postId === parseInt(postId)
                ? { ...post, ...updatedPostData }
                : post
            ));
          }
        } catch (updateError) {
          // 업데이트 실패 시 간단한 로컬 상태 업데이트
          const updatedData = {
            ...selectedPost,
            title: updatedPost.title,
            content: updatedPost.content,
            files: selectedFiles || selectedPost?.files || []
          };
          setSelectedPost(updatedData);
        }

        // 상세 페이지로 이동
        navigate(`/studies/${studyId}/posts/${postId}`);
        return true;
      } else {
        setError(result.message || "게시글 수정에 실패했습니다.");
        return false;
      }
    } catch (error) {
      console.error("[PostContainer] 게시글 수정 실패:", error);
      setError("게시글을 수정하는 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 게시글 상세 보기
  const handleViewPostDetail = (post) => {
    console.log("[PostContainer] 게시글 상세 보기:", post);
    // 다양한 필드명 처리 (postId 또는 boardId)
    const postId = post.postId || post.boardId;
    
    navigate(`/studies/${studyId}/posts/${postId}`);
  };

  // 게시글 목록으로 돌아가기
  const handleBackToPostList = () => {
    setSelectedPost(null);
    navigate(`/studies/${studyId}/posts`);
  };

  // 게시글 추가하기
  const handleNavigateToAddPage = () => {
    navigate(`/studies/${studyId}/posts/add`, {
      state: {
        memberRole
      }
    });
  };

  // 게시글 수정하기
  const handleNavigateToEditPage = (postId) => {
    navigate(`/studies/${studyId}/posts/${postId}/edit`, {
      state: {
        post: selectedPost,
        memberRole
      }
    });
  };

  // 뒤로 가기 처리 (모든 페이지에서 사용 가능)
  const handleBack = () => {
    navigate(`/studies/${studyId}/posts`);
  };

  // 서브페이지 변화 감지 및 알림
  useEffect(() => {
    if (onSubPageChange) {
      if (isDetailPage) {
        onSubPageChange("postDetail");
      } else if (isAddPage) {
        onSubPageChange("postAdd");
      } else if (isEditPage) {
        onSubPageChange("postEdit");
      } else {
        onSubPageChange("posts");
      }
    }
  }, [isDetailPage, isAddPage, isEditPage, onSubPageChange]);

  if (isAddPage) {
    return (
      <PostCreate
        onSubmit={handleCreatePost}
        onCancel={handleBack}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  if (isEditPage && selectedPost) {
    return (
      <PostEdit
        post={selectedPost}
        onSubmit={(title, content, files) => handleUpdatePost(postId, { title, content }, files)}
        onCancel={handleBack}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  if (isDetailPage) {
    return (
      <PostDetail
        post={selectedPost}
        onBack={handleBackToPostList}
        onEdit={() => handleNavigateToEditPage(postId)}
        onDelete={handleDeletePost}
        isLoading={isLoading}
      />
    );
  }

  return (
    <PostListPage
      posts={posts}
      onAddPost={handleNavigateToAddPage}
      onDeletePost={handleDeletePost}
      onViewPostDetail={handleViewPostDetail}
      isLoading={isLoading}
      error={error}
      memberRole={memberRole}
    />
  );
}

PostContainer.propTypes = {
  onSubPageChange: PropTypes.func,
};

export default PostContainer; 