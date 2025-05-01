import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { formatDateYMD } from "../../../utils/dateUtils";

function PostCard({ post, onClick, onEdit, onDelete }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const styles = {
    postCard: {
      backgroundColor: "#ffffff",
      padding: "12px 16px",
      borderRadius: "10px",
      marginBottom: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      border: "1px solid #eee",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
      cursor: "pointer",
      gap: "10px",
      hover: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        transform: "translateY(-2px)",
      },
    },
    postContentBlock: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      flex: 1,
    },
    postLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      overflow: "hidden",
    },
    postTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    postDate: {
      color: "#999",
      fontSize: "12px",
      marginBottom: "6px",
    },
    postText: {
      fontSize: "12px",
      color: "#666",
      marginTop: "4px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
    },
    menuButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px",
      marginLeft: "8px",
      borderRadius: "50%",
      width: "30px",
      height: "30px",
    },
    menuButtonIcon: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "3px",
    },
    menuDot: {
      width: "4px",
      height: "4px",
      backgroundColor: "#888",
      borderRadius: "50%",
    },
    dropdownContainer: {
      position: "relative",
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      right: "0",
      backgroundColor: "#fff",
      borderRadius: "6px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      padding: "8px 0",
      zIndex: 10,
      minWidth: "120px",
      marginTop: "4px",
      border: "1px solid #eee",
    },
    dropdownItem: {
      padding: "8px 16px",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    editIcon: {
      width: "14px",
      height: "14px",
      color: "#555",
    },
    deleteIcon: {
      width: "14px",
      height: "14px",
      color: "#dd4444",
    },
  };

  // 호버 효과를 위한 이벤트 핸들러
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#f8f9fa";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#fff";
  };

  // 드롭다운 토글
  const handleToggleDropdown = (e) => {
    e.stopPropagation(); // 부모 요소로 이벤트 전파 방지
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 수정 버튼 클릭
  const handleEdit = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    if (onEdit) onEdit(post.postId);
  };

  // 삭제 버튼 클릭
  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    if (onDelete && window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      onDelete(post.postId);
    }
  };

  return (
    <div
      onClick={onClick}
      style={styles.postCard}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={styles.postContentBlock}>
        <div style={styles.postDate}>
          게시: {formatDateYMD(post.postCreatedAt)} 작성자: {post.postWritenBy}
        </div>
        <h2 style={styles.postTitle}>{post.postTitle}</h2>
      </div>

      <div style={styles.dropdownContainer} ref={dropdownRef}>
        <button
          style={styles.menuButton}
          onClick={handleToggleDropdown}
          aria-label="게시물 메뉴"
        >
          <div style={styles.menuButtonIcon}>
            <div style={styles.menuDot}></div>
            <div style={styles.menuDot}></div>
            <div style={styles.menuDot}></div>
          </div>
        </button>

        {isDropdownOpen && (
          <div style={styles.dropdown}>
            <div
              style={{
                ...styles.dropdownItem,
                color: "#333",
              }}
              onClick={handleEdit}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#fff")
              }
            >
              <span style={styles.editIcon}>✎</span>
              수정
            </div>
            <div
              style={{
                ...styles.dropdownItem,
                color: "#dd4444",
              }}
              onClick={handleDelete}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#fff")
              }
            >
              <span style={styles.deleteIcon}>✕</span>
              삭제
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    postId: PropTypes.number.isRequired,
    postTitle: PropTypes.string.isRequired,
    postContent: PropTypes.string,
    postCreatedAt: PropTypes.string.isRequired,
    postModifiedAt: PropTypes.string.isRequired,
    postWritenBy: PropTypes.string.isRequired,
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

export default PostCard;
