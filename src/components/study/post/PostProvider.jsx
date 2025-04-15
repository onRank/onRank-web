import PropTypes from "prop-types";
import { createContext, useContext, useState, useCallback } from "react";
import { postService } from "../../../services/post";

// Context 생성
const PostContext = createContext();

// Context를 사용하기 위한 커스텀 훅
export const usePost = () => useContext(PostContext);

// Provider 컴포넌트
export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 공지사항 목록 불러오기
  const getPosts = useCallback(async (studyId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postService.getPosts(studyId);
      if (response.success) {
        const sortedPosts = [...(response.data || [])].sort(
          (a, b) => new Date(b.postCreatedAt) - new Date(a.postCreatedAt)
        );
        setPosts(sortedPosts);
      } else {
        setError(
          response.message || "공지사항 목록을 불러오는데 실패했습니다."
        );
        setPosts([]);
      }
    } catch (err) {
      console.error("공지사항 목록 조회 실패:", err);
      setError(err.message || "공지사항 목록을 불러오는데 실패했습니다.");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 공지사항 상세보기
  const getPostById = useCallback(async (studyId, postId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postService.getPostById(studyId, postId);
      if (response.success) {
        setSelectedPost(response.data);
      } else {
        setError(response.message || "공지사항을 불러오는데 실패했습니다.");
        setSelectedPost(null);
      }
    } catch (err) {
      console.error("공지사항 상세 조회 실패:", err);
      setError(err.message || "공지사항을 불러오는데 실패했습니다.");
      setSelectedPost(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 공지사항 생성
  const createPost = useCallback(async (studyId, newPost, files = []) => {
    setIsLoading(true);
    try {
      const response = await postService.createPost(studyId, newPost, files);
      if (response.success) {
        // 성공시 목록에 새 공지사항 추가 후 최신 생성일자 기준으로 정렬
        if (response.data) {
          setPosts((prev) => {
            // 새 공지사항 추가
            const updatedPosts = [response.data, ...prev];

            return updatedPosts.sort(
              (a, b) => new Date(b.postCreatedAt) - new Date(a.postCreatedAt)
            );
          });
        }
        return response; // 경고 메시지 등을 포함하기 위해 전체 응답 반환
      } else {
        throw new Error(response.message || "공지사항 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error("공지사항 등록 실패:", err);
      return {
        success: false,
        message: err.message || "공지사항 등록에 실패했습니다.",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 공지사항 수정
  const editPost = useCallback(
    async (studyId, postId, postData, files = []) => {
      setIsLoading(true);
      try {
        const response = await postService.editPost(
          studyId,
          postId,
          postData,
          files
        );
        if (response.success) {
          // 수정된 공지사항으로 상태 업데이트 후 생성일자 기준으로 정렬
          setPosts((prev) => {
            // 먼저 해당 공지사항 업데이트
            const updatedPosts = prev.map((post) =>
              post.postId === postId
                ? {
                    ...post,
                    ...postData,
                  }
                : post
            );

            // 생성일자 기준으로 내림차순 정렬 (최신순)
            return updatedPosts.sort(
              (a, b) => new Date(b.postCreatedAt) - new Date(a.postCreatedAt)
            );
          });
          return response; // 경고 메시지 등을 포함하기 위해 전체 응답 반환
        } else {
          throw new Error(response.message || "공지사항 수정에 실패했습니다.");
        }
      } catch (err) {
        console.error("공지사항 수정 실패:", err);
        return {
          success: false,
          message: err.message || "공지사항 수정에 실패했습니다.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 공지사항 삭제
  const deletePost = useCallback(async (studyId, postId) => {
    setIsLoading(true);
    try {
      const response = await postService.deletePost(studyId, postId);
      if (response.success) {
        // 삭제된 공지사항을 목록에서 제거
        setPosts((prev) => prev.filter((post) => post.postId !== postId));
        return { success: true };
      } else {
        throw new Error(response.message || "공지사항 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("공지사항 삭제 실패:", err);
      return {
        success: false,
        message: err.message || "공지사항 삭제에 실패했습니다.",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        selectedPost,
        isLoading,
        error,
        getPosts,
        getPostById,
        createPost,
        editPost,
        deletePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

PostProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
