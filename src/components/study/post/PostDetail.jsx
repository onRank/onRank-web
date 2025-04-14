import PropTypes from "prop-types";
import { useEffect } from "react";
import { usePost } from "./PostProvider";
import { formatDate } from "../../../utils/dateUtils";
import ErrorMessage from "../../common/ErrorMessage";
import Button from "../../common/Button";

function PostDetail({
  studyId,
  postId,
  selectedPost: propSelectedPost,
  handleBack,
  handleEdit,
}) {
  const {
    selectedPost: contextSelectedPost,
    isLoading,
    error,
    getPostById,
  } = usePost();

  // props로 전달된 selectedPost를 우선 사용하고, 없으면 context에서 가져온 것을 사용
  const post = propSelectedPost || contextSelectedPost;

  useEffect(() => {
    if (!propSelectedPost) {
      getPostById(studyId, postId);
    }
  }, [studyId, postId, getPostById, propSelectedPost]);

  if (isLoading) return <div>로딩중...</div>;

  if (error) {
    return (
      <div className="p-6">
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!post || !post.postTitle || !post.postContent) {
    return (
      <div className="p-6">
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message="잘못된 게시판 데이터입니다." type="warning" />
      </div>
    );
  }

  // 이제 post 변수를 사용하여 렌더링
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleBack} variant="back" />
        <Button onClick={() => handleEdit(postId)} variant="edit" />
      </div>
      <div className="border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{post.postTitle}</h1>
        <div className="flex items-center text-gray-600 mb-6">
          <span>{formatDate(post.postCreatedAt)}</span>
        </div>
        <div className="prose max-w-none">{post.postContent}</div>
      </div>
    </div>
  );
}

PostDetail.propTypes = {
  studyId: PropTypes.string.isRequired,
  postId: PropTypes.number.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
};

export default PostDetail;
