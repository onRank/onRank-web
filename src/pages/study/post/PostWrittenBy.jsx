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

  // 사용자 정보와 게시물 정보 모두 로드
  useEffect(() => {
    // 사용자 정보 로드
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      try {
        setCurrentUser(JSON.parse(userInfo));
      } catch (err) {
        console.error("[PostWrittenBy] 사용자 정보 파싱 오류:", err);
      }
    }
  }, []);

  // 게시물 정보 로드
  useEffect(() => {
    if (studyId && postId) {
      getPostById(studyId, parseInt(postId, 10));
    }
  }, [studyId, postId, getPostById]);

  // 로딩 및 오류 처리
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!selectedPost) return <div>게시물을 찾을 수 없습니다.</div>;
  if (!currentUser) return <div>사용자 정보를 불러오는 중입니다...</div>;

  // 작성자 확인 및 적절한 컴포넌트 렌더링
  const isAuthor = selectedPost.postWritenBy === currentUser.userId;

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
