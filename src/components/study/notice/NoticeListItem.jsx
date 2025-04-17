import PropTypes from "prop-types";
import { formatDateYMD } from "../../../utils/dateUtils";
import { useTheme } from "../../../contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";

function NoticeListItem({ notice, onClick, onEdit, onDelete }) {
  const { isDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  const styles = {
    noticeCard: {
      backgroundColor: "#ffffff",
      padding: "14px 16px",
      borderRadius: "10px",
      marginBottom: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      border: "1px solid #eee",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
      cursor: "pointer",
    },
    noticeContentBlock: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      overflow: "hidden",
    },
    noticeDate: {
      color: "#999",
      fontSize: "12px",
      marginBottom: "6px",
    },
    noticeTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    menuContainer: {
      position: "relative",
      marginLeft: "12px",
    },
    menuButton: {
      background: "transparent",
      border: "none",
      fontSize: "18px",
      cursor: "pointer",
      color: "#666",
      padding: "4px 8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    menuDropdown: {
      position: "absolute",
      right: 0,
      top: "100%",
      backgroundColor: "#fff",
      border: "1px solid #eee",
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      zIndex: 10,
      minWidth: "120px",
      display: menuOpen ? "block" : "none",
    },
    menuItem: {
      padding: "8px 16px",
      fontSize: "14px",
      color: "#333",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    menuItemDanger: {
      padding: "8px 16px",
      fontSize: "14px",
      color: "#dc3545",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
  };

  // hover 효과를 위한 이벤트 핸들러
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = `var(--hoverBackground)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = `var(--cardBackground)`;
  };

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
      style={styles.noticeCard}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={styles.noticeContentBlock}>
        <div style={styles.noticeDate}>
          게시: {formatDateYMD(notice.noticeCreatedAt)}
        </div>
        <h2 style={styles.noticeTitle}>{notice.noticeTitle}</h2>
      </div>

      <div style={styles.menuContainer} ref={menuRef}>
        <button
          style={styles.menuButton}
          onClick={handleMenuClick}
          aria-label="메뉴 열기"
        >
          ⋮
        </button>

        {/* 드롭다운 메뉴 */}
        <div style={styles.menuDropdown}>
          <div style={styles.menuItem} onClick={handleEdit}>
            수정
          </div>
          <div style={styles.menuItemDanger} onClick={handleDelete}>
            삭제
          </div>
        </div>
      </div>
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
