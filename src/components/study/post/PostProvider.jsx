import PropTypes from "prop-types";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { postService } from "../../../services/post";
import { useParams } from "react-router-dom";

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
  const { studyId } = useParams();
  const [memberRole, setMemberRole] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // 게시글 목록 불러오기 - useCallback 먼저 선언
  const getPosts = useCallback(async (studyId) => {
    if (!studyId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log("[PostService] 게시글 목록 조회 요청:", studyId);
      const response = await postService.getPosts(studyId);
      
      // memberContext에서 역할 정보 추출
      if (response && typeof response === "object") {
        if (response.memberContext) {
          // 회원 역할 설정
          if (response.memberContext.memberRole) {
          setMemberRole(response.memberContext.memberRole);
        } else {
          // 역할 정보가 없을 경우 기본값 설정
          setMemberRole("PARTICIPANT");
          }
          
          // 현재 사용자 이름 설정
          if (response.memberContext.memberName) {
            setCurrentUserName(response.memberContext.memberName);
          }
        }
      }
      
      if (response.success) {
        // 최신순 정렬 (생성일 기준) - 이 부분 유지
        const sortedPosts = [...(response.data || [])].sort(
          (a, b) => new Date(b.postCreatedAt || b.createdAt) - new Date(a.postCreatedAt || a.createdAt)
        );
        setPosts(sortedPosts);
      } else {
        setError(response.message || "게시글 목록을 불러오는데 실패했습니다.");
        setPosts([]);
      }
    } catch (err) {
      console.error("[PostService] 게시글 목록 조회 실패:", err);
      setError(err.message || "게시글 목록을 불러오는데 실패했습니다.");
      setPosts([]);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  }, []);

  // Automatically fetch posts when component mounts (only once per study)
  useEffect(() => {
    if (studyId && !initialLoadDone) {
      getPosts(studyId);
    }
  }, [studyId, initialLoadDone, getPosts]);

  // 게시글 상세보기
  const getPostById = useCallback(async (studyId, postId) => {
    if (!studyId || !postId) return;
    postId = parseInt(postId, 10);

    // Avoid duplicate fetch if already selected
    if (selectedPost && selectedPost.postId === postId) {
      console.log("[PostProvider] 이미 선택된 게시글과 동일함");
      return;
    }

    // Optimistic UI – show data from list if exists
    const postFromList = posts.find((post) => post.postId === postId);
    if (postFromList) {
      setSelectedPost(postFromList);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await postService.getPostById(studyId, postId);

      // Extract member role and name if present
      if (response.memberContext) {
        if (response.memberContext.memberRole) {
        setMemberRole(response.memberContext.memberRole);
        }
        if (response.memberContext.memberName) {
          setCurrentUserName(response.memberContext.memberName);
        }
      }

      if (response.success) {
        setSelectedPost(response.data);
      } else {
        setError(response.message || "게시글을 불러오는데 실패했습니다.");
        if (!postFromList) setSelectedPost(null);
      }
    } catch (err) {
      console.error("[PostProvider] 게시글 상세 조회 실패:", err);
      setError(err.message || "게시글을 불러오는데 실패했습니다.");
      if (!postFromList) setSelectedPost(null);
    } finally {
      setIsLoading(false);
    }
  }, [posts, selectedPost]);

  // 게시글 생성
  const createPost = useCallback(async (studyId, newPost, files = []) => {
    setIsLoading(true);
    try {
      const response = await postService.createPost(studyId, newPost, files);
      if (response.success) {
        // 목록 새로고침 (직접 추가 대신 API 재호출)
        await getPosts(studyId);
        
        // 성공 응답 반환
        return {
          success: true,
          message: "게시글이 성공적으로 생성되었습니다.",
          data: response.data,
        };
      } else {
        // 명확한 에러 메시지가 있는 경우에만 에러 발생
        if (response.message) {
          throw new Error(response.message);
        } else {
          return {
            success: true,
            message: "게시글이 생성되었습니다.",
            data: response.data,
          };
        }
      }
    } catch (err) {
      console.error("[PostProvider] 게시글 등록 실패:", err);
      return {
        success: false,
        message: "게시글 등록 중 문제가 발생했습니다.",
      };
    } finally {
      setIsLoading(false);
    }
  }, [getPosts]);

  // 게시글 수정
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
          // 수정된 게시글으로 상태 업데이트 (정렬 없이)
          setPosts((prev) => {
            // 해당 게시글만 업데이트
            return prev.map((post) =>
              post.postId === postId
                ? {
                    ...post,
                    ...postData,
                  }
                : post
            );
          });
          return response; // 경고 메시지 등을 포함하기 위해 전체 응답 반환
        } else {
          throw new Error(response.message || "게시글 수정에 실패했습니다.");
        }
      } catch (err) {
        console.error("게시글 수정 실패:", err);
        return {
          success: false,
          message: err.message || "게시글 수정에 실패했습니다.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 게시글 삭제
  const deletePost = useCallback(async (studyId, postId) => {
    if (!studyId || !postId) {
      console.error("[PostProvider] 게시글 삭제 실패: 스터디ID 또는 게시글ID 누락");
      return { 
        success: false, 
        message: "필수 정보가 누락되었습니다." 
      };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[PostProvider] 게시글 삭제 요청: ${studyId}/${postId}`);
      const response = await postService.deletePost(studyId, postId);
      
      if (response.success) {
        // 목록에서 삭제된 게시글 제거
        setPosts(prevPosts => 
          prevPosts.filter(post => post.postId !== parseInt(postId, 10))
        );
        
        // 현재 선택된 게시글이 삭제되는 경우 초기화
        if (selectedPost && selectedPost.postId === parseInt(postId, 10)) {
          setSelectedPost(null);
        }
        
        return {
          success: true,
          message: "게시글이 성공적으로 삭제되었습니다."
        };
      } else {
        setError(response.message || "게시글 삭제 중 오류가 발생했습니다.");
        return {
          success: false,
          message: response.message || "게시글 삭제 중 오류가 발생했습니다."
        };
      }
    } catch (err) {
      console.error("[PostProvider] 게시글 삭제 중 오류:", err);
      setError("게시글 삭제 중 오류가 발생했습니다.");
      return {
        success: false,
        message: err.message || "게시글 삭제 중 오류가 발생했습니다."
      };
    } finally {
      setIsLoading(false);
    }
  }, [selectedPost]);

  return (
    <PostContext.Provider
      value={{
        posts,
        selectedPost,
        isLoading,
        error,
        memberRole,
        currentUserName,
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
