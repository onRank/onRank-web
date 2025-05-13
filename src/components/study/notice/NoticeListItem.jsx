import PropTypes from "prop-types";
import { formatDateYMD } from "../../../utils/dateUtils";
import { useTheme } from "../../../contexts/ThemeContext";
import { useState, useRef } from "react";
import { useNotice } from "./NoticeProvider";
import ActionPopup from "../../../components/common/ActionPopup";

function NoticeListItem({ notice, onClick, onEdit, onDelete }) {
  const { isDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { memberRole } = useNotice();

  // 관리자 권한 확인 (CREATOR 또는 HOST인 경우)
  const isManager = memberRole === "CREATOR" || memberRole === "HOST";
  
  // 파일 첨부 여부 확인
  const hasFiles = 
    (notice.files && notice.files.length > 0) || 
    (notice.fileUrls && notice.fileUrls.length > 0);
  
  // 토글 메뉴 클릭 처리
  const handleMenuClick = (e) => {
    e.stopPropagation(); // 클릭 이벤트가 카드까지 전파되지 않도록 방지
    setMenuOpen(!menuOpen);
  };

  // 수정 처리
  const handleEdit = () => {
    if (onEdit) onEdit(notice.noticeId);
  };

  // 삭제 처리
  const handleDelete = () => {
    if (onDelete && window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      onDelete(notice.noticeId);
    }
  };

  // 메뉴 닫기
  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div
      onClick={onClick}
      className="notice-item"
    >
      <div className="notice-content-block">
        <div className="notice-date">
          게시: {formatDateYMD(notice.noticeCreatedAt)}
        </div>
        <h2 className="notice-title">
          {notice.noticeTitle}
          {hasFiles && <span className="notice-attachment-icon">📎</span>}
        </h2>
      </div>

      {isManager && (
        <div className="notice-menu-container" ref={menuRef}>
          <button
            className="notice-menu-button"
            onClick={handleMenuClick}
            aria-label="메뉴 열기"
          >
            ⋮
          </button>

          {/* 액션 팝업 */}
          <ActionPopup
            show={menuOpen}
            onClose={handleCloseMenu}
            onEdit={handleEdit}
            onDelete={handleDelete}
            position="bottom-right"
          />
        </div>
      )}
    </div>
  );
}

NoticeListItem.propTypes = {
  notice: PropTypes.shape({
    noticeId: PropTypes.number.isRequired,
    noticeTitle: PropTypes.string.isRequired,
    noticeContent: PropTypes.string,
    noticeCreatedAt: PropTypes.string.isRequired,
    noticeModifiedAt: PropTypes.string.isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        fileId: PropTypes.number.isRequired,
        fileName: PropTypes.string.isRequired,
        fileUrl: PropTypes.string.isRequired,
      })
    ),
    fileUrls: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default NoticeListItem;
