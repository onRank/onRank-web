import PropTypes from "prop-types";
import { useEffect } from "react";
import { usePost } from "./PostProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import ErrorMessage from "../../common/ErrorMessage";
import Button from "../../common/Button";

function PostDetail({ studyId, postId, handleBack, handleEdit }) {
  const { selectedPost, isLoading, error, getPostById } = usePost();

  useEffect(() => {
    getPostById(studyId, postId);
  }, [studyId, postId, getPostById]);

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6">
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!selectedPost || !selectedPost.postTitle || !selectedPost.postContent) {
    return (
      <div className="p-6">
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message="잘못된 게시판 데이터입니다." type="warning" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleBack} variant="back" />
        <Button onClick={() => handleEdit(postId)} variant="edit" />
      </div>
      <div className="border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{selectedPost.postTitle}</h1>
        <div className="flex items-center text-gray-600 mb-6">
          <span>{formatDate(selectedPost.postCreatedAt)}</span>
        </div>
        <div className="prose max-w-none">{selectedPost.postContent}</div>
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
