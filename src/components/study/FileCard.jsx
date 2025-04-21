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

  // 파일 크기를 읽기 쉬운 형식으로 변환
  const formatFileSize = (size) => {
    if (!size) return "";

    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    } else {
      const mb = kb / 1024;
      return `${mb.toFixed(1)} MB`;
    }
  };

  const styles = {
    cardContainer: {
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      cursor: onClick ? "pointer" : "default",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.2s ease",
      border: "1px solid #e0e0e0",
    },
    previewContainer: {
      width: "50px",
      height: "50px",
      borderRadius: "4px",
      overflow: "hidden",
      backgroundColor: "#e9ecef",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    fileIcon: {
      fontSize: "24px",
      color: "#495057",
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
      fontWeight: "bold",
      color: "#212529",
    },
    fileSize: {
      margin: 0,
      fontSize: "12px",
      color: "#6c757d",
    },
    deleteButton: {
      background: "none",
      border: "none",
      outline: "none",
      color: "#dc3545",
      cursor: "pointer",
      fontSize: "16px",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      transition: "background-color 0.2s",
      marginLeft: "auto",
    },
    downloadIcon: {
      width: "24px",
      height: "24px",
      marginRight: "5px",
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

      <div style={styles.fileInfo}>
        <p style={styles.fileName}>{file.name}</p>
        {file.size && (
          <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
        )}
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
