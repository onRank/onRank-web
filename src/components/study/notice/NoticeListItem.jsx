import PropTypes from "prop-types";
import { formatDateYMD } from "../../../utils/dateUtils";
import { useTheme } from "../../../contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { useNotice } from "./NoticeProvider";

function NoticeListItem({ notice, onClick, onEdit, onDelete }) {
  const { isDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { memberRole } = useNotice();

  // 관리자 권한 확인 (CREATOR 또는 HOST인 경우)
  const isManager = memberRole === "CREATOR" || memberRole === "HOST";
  
  // 메뉴 영역 외 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // 토글 메뉴 클릭 처리
  const handleMenuClick = (e) => {
    e.stopPropagation(); // 클릭 이벤트가 카드까지 전파되지 않도록 방지
    setMenuOpen(!menuOpen);
  };

  // 수정 버튼 클릭 처리
  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onEdit) onEdit(notice.noticeId);
  };

  // 삭제 버튼 클릭 처리
  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onDelete && window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      onDelete(notice.noticeId);
    }
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
        <h2 className="notice-title">{notice.noticeTitle}</h2>
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

          {/* 드롭다운 메뉴 */}
          <div className="notice-menu-dropdown" style={{ display: menuOpen ? "block" : "none" }}>
            <div className="notice-menu-item" onClick={handleEdit}>
              수정
            </div>
            <div className="notice-menu-item-danger" onClick={handleDelete}>
              삭제
            </div>
          </div>
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
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default NoticeListItem;
