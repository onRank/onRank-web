import PropTypes from "prop-types";
import { useEffect } from "react";
import { usePost } from "./PostProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import ErrorMessage from "../../common/ErrorMessage";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";

function PostDetail({ studyId, postId, handleBack, handleEdit, handleDelete }) {
  const { selectedPost, isLoading, error, getPostById } = usePost();
  const { colors } = useTheme(); // eslint-disable-line no-unused-vars

  useEffect(() => {
    if (!selectedPost || selectedPost.postId !== parseInt(postId, 10)) {
      console.log("[PostDetail] 게시글 상세 요청:", postId);
      getPostById(studyId, postId);
    } else {
      console.log(
        "[PostDetail] 이미 선택된 게시글과 동일하여 요청 생략:",
        postId
      );
    }
  }, [studyId, postId, getPostById, selectedPost]);

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <ErrorMessage message={error} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Button onClick={handleBack} variant="back" />
        </div>
      </div>
    );
  }

  if (!selectedPost) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <ErrorMessage message="게시글 데이터를 찾을 수 없습니다." type="warning" />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Button onClick={handleBack} variant="back" />
        </div>
      </div>
    );
  }

  // 필드명 일관성을 위해 가져올 수 있는 모든 필드를 확인
  const title = selectedPost.postTitle || selectedPost.title || "제목 없음";
  const content = selectedPost.postContent || selectedPost.content || "내용 없음";
  const createdAt = selectedPost.postCreatedAt || selectedPost.createdAt || new Date().toISOString();

  return (
    <div style={{ padding: "1.5rem" }}>
      <div
        style={{
          border: `1px solid var(--border)`,
          borderRadius: "0.5rem",
          padding: "1.5rem",
          backgroundColor: `var(--cardBackground)`,
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: `var(--textPrimary)`,
          }}
        >
          {title}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: `var(--textSecondary)`,
            marginBottom: "1.5rem",
          }}
        >
          <span style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>•</span>
          <span>{formatDate(createdAt)}</span>
        </div>
        <div
          style={{
            maxWidth: "none",
            color: `var(--textPrimary)`,
          }}
        >
          {content}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
        {handleEdit && (
          <Button onClick={() => handleEdit(postId)} variant="edit" style={{ width: "84px", height: "36px" }} />
        )}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {handleDelete && (
            <Button onClick={() => handleDelete(postId)} variant="delete" style={{ width: "84px", height: "36px" }} />
          )}
          <Button onClick={handleBack} variant="back" style={{ width: "84px", height: "36px" }} />
        </div>
      </div>
    </div>
  );
}

PostDetail.propTypes = {
  studyId: PropTypes.string.isRequired,
  postId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  handleBack: PropTypes.func.isRequired,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func
};

export default PostDetail;
