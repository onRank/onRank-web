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

  // 파일 첨부 여부 확인
  const hasFiles = 
    (post.files && post.files.length > 0) || 
    (post.fileUrls && post.fileUrls.length > 0);

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

  // 일관된 필드명 처리
  const title = post.postTitle || post.title || post.boardTitle || "제목 없음";
  const createdAt = post.postCreatedAt || post.createdAt || new Date().toISOString();

  return (
    <div onClick={onClick} className="post-item">
      <div className="post-content-block">
        <div className="post-date">게시: {formatDateYMD(createdAt)}</div>
        <h2 className="post-title">
          {title}
          {hasFiles && <span className="post-attachment-icon">📎</span>}
        </h2>
      </div>

      {isManager && (
        <div className="post-menu-container" ref={menuRef} style={{ marginLeft: "auto" }}>
          <button
            className="post-menu-button"
            onClick={handleMenuClick}
            aria-label="메뉴 열기"
            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>
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
    files: PropTypes.array,
    fileUrls: PropTypes.array
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default PostListItem; 