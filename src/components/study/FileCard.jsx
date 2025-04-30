import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const FileCard = ({ file, onDelete, onClick, showPreview = true }) => {
  const [preview, setPreview] = useState(null);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    // 파일이 이미지인지 확인
    if (file && file.type && file.type.startsWith("image/")) {
      setIsImage(true);

      // 이미지 파일이면 미리보기 URL 생성
      if (showPreview) {
        const fileUrl = URL.createObjectURL(file);
        setPreview(fileUrl);

        // 컴포넌트가 언마운트될 때 URL 해제
        return () => URL.revokeObjectURL(fileUrl);
      }
    } else {
      setIsImage(false);
      setPreview(null);
    }
  }, [file, showPreview]);

  // 파일 확장자에 따른 아이콘 결정
  const getFileIcon = () => {
    if (!file) return "📄";

    const fileName = file.name || "";
    const extension = fileName.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return "📕";
      case "doc":
      case "docx":
        return "📘";
      case "xls":
      case "xlsx":
        return "📗";
      case "ppt":
      case "pptx":
        return "📙";
      case "zip":
      case "rar":
        return "🗜️";
      case "txt":
        return "📝";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
        return "🖼️";
      default:
        return "📄";
    }
  };

  const styles = {
    cardContainer: {
      flexShrink: 0,
      width: "270px",
      height: "170px",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      cursor: onClick ? "pointer" : "default",
      position: "relative",
      transition: "all 0.2s ease",
      flexDirection: "column",
      border: "1px solid #e0e0e0",
      margin: "10px",
      display: "inline-flex",
      verticalAlign: "top",
    },
    previewContainer: {
      flex: 1,
      backgroundColor: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
    fileIcon: {
      fontSize: "48px",
      color: "#888",
    },
    fileInfoBar: {
      backgroundColor: "#fff",
      padding: "12px",
      display: "flex",
      alignItems: "center",
      borderTop: "1px solid #e0e0e0",
    },
    downloadIcon: {
      width: "24px",
      height: "24px",
      marginRight: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    fileInfo: {
      flex: 1,
      overflow: "hidden",
    },
    fileName: {
      margin: 0,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontSize: "14px",
      fontWeight: "normal",
      color: "#333",
    },
    deleteButton: {
      position: "absolute",
      top: "8px",
      right: "8px",
      background: "rgba(255, 255, 255, 0.7)",
      border: "none",
      outline: "none",
      color: "#dc3545",
      cursor: "pointer",
      fontSize: "16px",
      padding: "4px 8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      transition: "background-color 0.2s",
      zIndex: 2,
    },
  };

  return (
    <div
      style={styles.cardContainer}
      onClick={onClick ? () => onClick(file) : undefined}
    >
      <div style={styles.previewContainer}>
        {isImage && preview ? (
          <img src={preview} alt={file.name} style={styles.previewImage} />
        ) : (
          <span style={styles.fileIcon}>{getFileIcon()}</span>
        )}
      </div>

      <div style={styles.fileInfoBar}>
        <div style={styles.downloadIcon}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#555">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z" />
          </svg>
        </div>
        <div style={styles.fileInfo}>
          <p style={styles.fileName}>{file.name}</p>
        </div>
      </div>

      {onDelete && (
        <button
          style={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file);
          }}
          title="삭제"
        >
          ✕
        </button>
      )}
    </div>
  );
};

FileCard.propTypes = {
  file: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
  showPreview: PropTypes.bool,
};

export default FileCard;
