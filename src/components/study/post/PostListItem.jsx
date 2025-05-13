import PropTypes from "prop-types";
import { formatDateYMD } from "../../../utils/dateUtils";
import { useTheme } from "../../../contexts/ThemeContext";
import { useState, useRef } from "react";
import { usePost } from "./PostProvider";
import ActionPopup from "../../common/ActionPopup";

function PostListItem({ post, onClick, onEdit, onDelete }) {
  // Theme (light/dark) - currently only color variables come from css vars, but keep hook for future
  const { isDarkMode } = useTheme(); // eslint-disable-line no-unused-vars
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { memberRole } = usePost();

  // 관리자 권한 (CREATOR / HOST)
  const isManager = memberRole === "CREATOR" || memberRole === "HOST";

  // 토글 메뉴
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(post.postId);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      onDelete(post.postId);
    }
  };

  return (
    <div onClick={onClick} className="post-item">
      <div className="post-content-block">
        <div className="post-date">게시: {formatDateYMD(post.postCreatedAt || post.createdAt)}</div>
        <h2 className="post-title">{post.postTitle || post.title || post.boardTitle}</h2>
      </div>

      {isManager && (
        <div className="post-menu-container" ref={menuRef}>
          <button
            className="post-menu-button"
            onClick={handleMenuClick}
            aria-label="메뉴 열기">
            ⋮
          </button>

          <ActionPopup
            show={menuOpen}
            onClose={() => setMenuOpen(false)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            position="bottom-right"
          />
        </div>
      )}
    </div>
  );
}

PostListItem.propTypes = {
  post: PropTypes.shape({
    postId: PropTypes.number.isRequired,
    postTitle: PropTypes.string,
    title: PropTypes.string,
    postCreatedAt: PropTypes.string,
    createdAt: PropTypes.string,
    boardTitle: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default PostListItem; 