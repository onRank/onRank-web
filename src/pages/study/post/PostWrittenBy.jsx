import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePost } from "../../../components/study/post/PostProvider";
import PostMyDetailPage from "./PostMyDetailPage";
import PostOthersDetailPage from "./PostOthersDetailPage";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";

function PostWrittenBy() {
  const { studyId, postId } = useParams();
  const { selectedPost, isLoading, error, getPostById } = usePost();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      try {
        setCurrentUser(JSON.parse(userInfo));
      } catch (err) {
        console.error("[PostWrittenBy] 사용자 정보 파싱 오류:", err);
      }
    }
  }, []);

  // 게시물 정보 가져오기
  useEffect(() => {
    if (studyId && postId) {
      getPostById(studyId, parseInt(postId, 10));
    }
  }, [studyId, postId, getPostById]);

  // 작성자와 현재 사용자 비교
  useEffect(() => {
    if (selectedPost && currentUser) {
      setIsAuthor(selectedPost.postWritenBy === currentUser.userId);
    }
  }, [selectedPost, currentUser]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!selectedPost) {
    return <div>게시물을 찾을 수 없습니다.</div>;
  }

  // 작성자에 따라 적절한 컴포넌트 렌더링
  return isAuthor ? <PostMyDetailPage /> : <PostOthersDetailPage />;
}

export default PostWrittenBy;
