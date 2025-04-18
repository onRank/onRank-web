import PropTypes from "prop-types";
import { formatDateYMD } from "../../../utils/dateUtils";

function PostListItem({ post, onClick }) {
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
      style={styles.postCard}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={styles.postContentBlock}>
        <div style={styles.postDate}>
          게시: {formatDateYMD(post.postCreatedAt)}
        </div>
        <h2 style={styles.postTitle}>{post.postTitle}</h2>
      </div>
    </div>
  );
}

PostListItem.propTypes = {
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
};

export default PostListItem;
