import { useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../../../components/common/Button";
import ActionPopup from "../../../components/common/ActionPopup";
import { formatDateYMD } from "../../../utils/dateUtils";
import "../../../styles/post.css";

function PostListPage({
  posts,
  onAddPost,
  onDeletePost,
  onViewPostDetail,
  isLoading,
  error,
  memberRole,
}) {
  const { colors } = useTheme();
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // 관리자 권한 확인
  const isManager = memberRole === "HOST" || memberRole === "CREATOR";

  // 게시글 액션 팝업 표시
  const handleShowActionPopup = (event, postId) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY
    });
    setSelectedPostId(postId);
    setShowActionPopup(true);
  };

  // 게시글 액션 팝업 닫기
  const handleCloseActionPopup = () => {
    setShowActionPopup(false);
    setSelectedPostId(null);
  };

  // 게시글 삭제 처리
  const handleDelete = async () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      await onDeletePost(selectedPostId);
      handleCloseActionPopup();
    }
  };

  return (
    <div className="post-list-container">
      {/* 게시글 추가 안내 - 관리자 권한이 있을 때만 표시 */}
      {isManager && (
        <div
          className="add-section-box"
          style={{ backgroundColor: colors.cardBackground }}>
          <div>
            <div className="add-section-title" style={{ color: colors.text }}>
              게시글 추가
            </div>
            <div
              className="add-section-description"
              style={{ color: colors.textSecondary }}>
              새로운 게시글을 추가해주세요.
            </div>
          </div>
          <Button onClick={onAddPost} variant="add" />
        </div>
      )}

      {/* 오류 메시지 표시 */}
      {error && <div className="error-message">{error}</div>}

      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div className="loading-message">게시글을 불러오는 중입니다...</div>
      )}

      {/* 게시글 목록 */}
      {!isLoading && posts.length === 0 ? (
        <div className="empty-message">
          등록된 게시글이 없습니다.{" "}
          {isManager && "게시글 추가 버튼을 눌러 새 게시글을 추가해보세요."}
        </div>
      ) : (
        <div className="post-items">
          {posts.map((post) => (
            <div
              key={post.postId}
              className="post-item"
              onClick={() => onViewPostDetail(post)}
              style={{ backgroundColor: colors.cardBackground }}
            >
              <div className="post-item-header">
                <h3 className="post-title" style={{ color: colors.textPrimary }}>
                  {post.postTitle || post.title || post.boardTitle}
                </h3>
                {isManager && (
                  <button
                    className="more-options-button"
                    onClick={(e) => handleShowActionPopup(e, post.postId || post.boardId)}
                  >
                    <span className="more-options-icon">⋮</span>
                  </button>
                )}
              </div>
              <div className="post-item-content" style={{ color: colors.text }}>
                {post.postContent || post.content || post.boardContent}
              </div>
              <div className="post-item-footer">
                <span className="post-date">
                  게시: {formatDateYMD(post.postCreatedAt || post.createdAt || post.boardCreatedAt)}
                </span>
                <span className="post-writer">{post.postWritenBy || post.writer}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 액션 팝업 */}
      {showActionPopup && (
        <ActionPopup
          position={popupPosition}
          onClose={handleCloseActionPopup}
          actions={[
            { label: "삭제", onClick: handleDelete },
          ]}
        />
      )}
    </div>
  );
}

PostListPage.propTypes = {
  posts: PropTypes.array.isRequired,
  onAddPost: PropTypes.func.isRequired,
  onDeletePost: PropTypes.func.isRequired,
  onViewPostDetail: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  memberRole: PropTypes.string,
};

export default PostListPage; 