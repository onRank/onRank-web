import PropTypes from "prop-types";
import { formatDateYMD } from "../../../utils/dateUtils";
import { useTheme } from "../../../contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { usePost } from "./PostProvider";
import ActionPopup from "../../common/ActionPopup";

function PostListItem({ post, onClick, onEdit, onDelete, index, totalItems }) {
  // Theme (light/dark) - currently only color variables come from css vars, but keep hook for future
  const { isDarkMode } = useTheme(); // eslint-disable-line no-unused-vars
  const [menuOpen, setMenuOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState("bottom-right");
  const menuRef = useRef(null);
  const { memberRole } = usePost();

  // 관리자 권한 (CREATOR / HOST)
  const isManager = memberRole === "CREATOR" || memberRole === "HOST";

  // 파일 첨부 여부 확인
  const hasFiles = 
    (post.files && post.files.length > 0) || 
    (post.fileUrls && post.fileUrls.length > 0);

  // 아이템 위치에 따라 팝업 위치 결정
  useEffect(() => {
    if (index !== undefined && totalItems !== undefined) {
      // 마지막 3개 아이템은 팝업이 위로 나타나도록 설정
      if (index >= totalItems - 3) {
        setPopupPosition("top-right");
      } else {
        setPopupPosition("bottom-right");
      }
    }
  }, [index, totalItems]);

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

  // 메뉴 닫기
  const handleCloseMenu = () => {
    setMenuOpen(false);
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
        <div className="post-menu-container" ref={menuRef}>
          <button
            className="post-menu-button"
            onClick={handleMenuClick}
            aria-label="메뉴 열기">
            ⋮
          </button>

          <ActionPopup
            show={menuOpen}
            onClose={handleCloseMenu}
            onEdit={handleEdit}
            onDelete={handleDelete}
            position={popupPosition}
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
  index: PropTypes.number,
  totalItems: PropTypes.number
};

export default PostListItem; 