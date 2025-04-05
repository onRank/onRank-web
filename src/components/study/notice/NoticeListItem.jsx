import PropTypes from "prop-types";
import { formatDate } from "../../../utils/dateUtils";
import { useTheme } from "../../../contexts/ThemeContext";

function NoticeListItem({ notice, onClick }) {
  const { colors, isDarkMode } = useTheme();
  
  const styles = {
    noticeCard: {
      backgroundColor: colors.cardBackground,
      padding: "12px 16px",
      borderRadius: "10px",
      marginBottom: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      border: `1px solid ${colors.border}`,
      boxShadow: `0 1px 4px ${isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
      transition: "box-shadow 0.2s ease, transform 0.2s ease",
      cursor: "pointer",
      gap: "10px",
      hover: {
        boxShadow: `0 4px 12px ${isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
        transform: "translateY(-2px)",
      },
    },
    noticeContentBlock: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    noticeLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      overflow: "hidden",
    },
    noticeTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: colors.textPrimary,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    noticeIcon: {
      flexShrink: 0,
      width: "28px",
      height: "28px",
      backgroundColor: colors.buttonBackground,
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
    },
    noticeDate: {
      fontSize: "13px",
      color: colors.textSecondary,
      marginLeft: "20px",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    noticeText: {
      fontSize: "12px",
      color: colors.textSecondary,
      marginTop: "4px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
    },
  };

  // hover 효과를 위한 이벤트 핸들러
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = colors.hoverBackground;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = colors.cardBackground;
  };

  return (
    <div
      onClick={onClick}
      style={styles.noticeCard}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={styles.noticeLeft}>
        <div style={styles.noticeIcon}>📢</div>
        <div style={styles.noticeContentBlock}>
          <h2 style={styles.noticeTitle}>{notice.noticeTitle}</h2>
          <div style={styles.noticeText}>{notice.noticeContent}</div>
        </div>
      </div>
      <div style={styles.noticeDate}>{formatDate(notice.noticeCreatedAt)}</div>
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
