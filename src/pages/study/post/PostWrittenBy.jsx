// src/pages/study/post/PostWrittenBy.jsx

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

  // 작성자와 현재 사용자 비교 (selectedPost가 있을 때만 실행)
  useEffect(() => {
    if (selectedPost && currentUser) {
      setIsAuthor(selectedPost.postWritenBy === currentUser.userId);
    }
  }, [selectedPost, currentUser]);

  // 로딩 중이면 로딩 스피너 표시
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 오류가 있으면 오류 메시지 표시
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // 중요: selectedPost가 없으면 렌더링하지 않음
  if (!selectedPost) {
    return <div>게시물을 찾을 수 없습니다.</div>;
  }

  // selectedPost와 isAuthor가 모두 설정된 후에만 컴포넌트 렌더링
  // props로 필요한 데이터를 전달하여 하위 컴포넌트에서 다시 데이터를 불러오지 않도록 함
  return isAuthor ? (
    <PostMyDetailPage
      studyId={studyId}
      postId={postId}
      selectedPost={selectedPost}
    />
  ) : (
    <PostOthersDetailPage
      studyId={studyId}
      postId={postId}
      selectedPost={selectedPost}
    />
  );
}

export default PostWrittenBy;
