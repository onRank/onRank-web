import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePost } from "../../../components/study/post/PostProvider";
import { useAuth } from "../../../contexts/AuthContext";
import PostMyDetailPage from "./PostMyDetailPage";
import PostOthersDetailPage from "./PostOthersDetailPage";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";

function PostWrittenBy() {
  const navigate = useNavigate();
  const { studyId, postId } = useParams();
  const { selectedPost, isLoading, error, getPostById } = usePost();
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useAuth();

  // 게시물 정보 로드
  useEffect(() => {
    if (studyId && postId) {
      getPostById(studyId, parseInt(postId, 10));
    }
  }, [studyId, postId, getPostById]);

  // 로딩 및 오류 처리
  if (isLoading) return <div>로딩중...</div>;
  if (error) return <ErrorMessage message={error} />;
  if (!selectedPost) return <div>게시물을 찾을 수 없습니다.</div>;
  if (!currentUser) return <div>사용자 정보를 불러오는 중입니다...</div>;

  // 작성자 확인 및 적절한 컴포넌트 렌더링
  const isAuthor = selectedPost.postWritenBy === user.userId;

  // 같은 컴포넌트 내에서 조건부 렌더링
  return isAuthor ? <PostMyDetailPage /> : <PostOthersDetailPage />;
}

export default PostWrittenBy;
