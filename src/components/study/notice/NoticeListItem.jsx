import PropTypes from "prop-types";
import { formatDate } from "../../../utils/dateUtils";

function NoticeListItem({ notice, onClick }) {
  const styles = {
    noticeCard: {
      backgroundColor: "#fff",
      border: "1px solid #e5e5e5",
      borderRadius: "6px",
      padding: "15px",
      marginBottom: "12px",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    noticeTitle: {
      fontSize: "15px",
      fontWeight: "500",
      marginBottom: "8px",
    },
    noticeContent: {
      color: "#666",
      fontSize: "14px",
      marginBottom: "10px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
    },
    noticeDate: {
      fontSize: "14px",
      color: "#888",
    },
    noticeInfo: {
      display: "flex",
      alignItems: "center",
    },
    separator: {
      margin: "0 8px",
      color: "#ccc",
    },
  };

  // hover 효과를 위한 이벤트 핸들러
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#f8f9fa";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#fff";
  };

  return (
    <div
      onClick={onClick}
      style={styles.noticeCard}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2 style={styles.noticeTitle}>{notice.noticeTitle}</h2>
      {notice.noticeContent && (
        <p style={styles.noticeContent}>{notice.noticeContent}</p>
      )}
      <div style={styles.noticeInfo}>
        <span style={styles.separator}>•</span>
        <span style={styles.noticeDate}>
          {formatDate(notice.noticeCreatedAt)}
        </span>
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
};

export default NoticeListItem;
