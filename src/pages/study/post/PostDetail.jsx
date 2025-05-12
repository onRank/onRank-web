import { useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../../../components/common/Button";
import ActionPopup from "../../../components/common/ActionPopup";
import { formatDateYMD } from "../../../utils/dateUtils";
import "../../../styles/post.css";

function PostDetail({ post, onBack, onEdit, onDelete, isLoading }) {
  const { colors } = useTheme();
  const { studyId, postId } = useParams();
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // 게시글 데이터 준비
  const postData = post || {
    postId: parseInt(postId),
    postTitle: "게시글 제목",
    postContent: "게시글 내용이 여기에 표시됩니다.",
    postCreatedAt: new Date().toISOString(),
    postWritenBy: "작성자명"
  };
  
  // ID 필드 - postId 또는 boardId 사용
  const id = postData.postId || postData.boardId || parseInt(postId);
  
  // 제목 필드 - 여러 가능한 필드명 중 존재하는 것 사용
  const title = postData.postTitle || postData.title || postData.boardTitle || "게시글 제목";
  
  // 내용 필드 - 여러 가능한 필드명 중 존재하는 것 사용
  const content = postData.postContent || postData.content || postData.boardContent || "게시글 내용이 여기에 표시됩니다.";
  
  // 작성일 필드 - 여러 가능한 필드명 중 존재하는 것 사용
  const createdAt = postData.postCreatedAt || postData.createdAt || postData.boardCreatedAt || new Date().toISOString();
  
  // 작성자 필드 - 여러 가능한 필드명 중 존재하는 것 사용
  const writer = postData.postWritenBy || postData.writer || "작성자명";
  
  // 첨부 파일 확인
  const files = postData.files || [];
  const hasFiles = Array.isArray(files) && files.length > 0;
  
  // 파일 URL 확인
  const fileUrls = postData.fileUrls || [];
  const hasFileUrls = Array.isArray(fileUrls) && fileUrls.length > 0;
  
  // 작성일 포맷팅
  const formattedDate = formatDateYMD(createdAt);

  // 액션 팝업 표시
  const handleShowActionPopup = (event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY
    });
    setShowActionPopup(true);
  };

  // 액션 팝업 닫기
  const handleCloseActionPopup = () => {
    setShowActionPopup(false);
  };

  // 게시글 수정 처리
  const handleEdit = () => {
    handleCloseActionPopup();
    onEdit(id);
  };

  // 게시글 삭제 처리
  const handleDelete = async () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      const success = await onDelete(id);
      if (success) {
        onBack(); // 삭제 성공 시 목록으로 돌아가기
      }
      handleCloseActionPopup();
    }
  };

  if (isLoading) {
    return (
      <div className="post-detail-container">
        <div className="loading-message">게시글을 불러오는 중입니다...</div>
      </div>
    );
  }

  // 스타일 정의 (NoticeDetailUserPage와 유사하게)
  const styles = {
    container: {
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    date: {
      fontSize: "12px",
      color: "#888",
    },
    contentBox: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      minHeight: "200px",
      padding: "16px",
      background: "#fff",
    },
    headerBox: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "16px",
      background: "#fff",
      marginBottom: "12px",
    },
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    meta: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "12px",
      color: "#888",
    },
    attachmentWrapper: {
      marginTop: "12px",
    },
    attachmentTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    attachmentItem: {
      fontSize: "14px",
      marginBottom: "6px",
      color: "#333",
      cursor: "pointer",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "24px",
    },
    actionButtonsRight: {
      display: "flex",
      gap: "8px",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerBox}>
        <div style={styles.title}>{title}</div>
        <div style={styles.meta}>
          <span>작성자: {writer}</span>
          <span>작성일: {formattedDate}</span>
        </div>
      </div>
      
      <div style={styles.contentBox}>
        {content || <p>내용이 없습니다.</p>}
      </div>
      
      {/* 첨부 파일 목록 - files 배열 사용 */}
      {hasFiles && (
        <div style={styles.attachmentWrapper}>
          <div style={styles.attachmentTitle}>첨부 파일</div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {files.map((file, index) => (
              <li
                key={file.fileId || index}
                style={styles.attachmentItem}
                onClick={() => window.open(file.fileUrl, "_blank")}
              >
                {file.fileName || `첨부파일 ${index + 1}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 첨부 파일 목록 - fileUrls 배열 사용 (대체 방식) */}
      {!hasFiles && hasFileUrls && (
        <div style={styles.attachmentWrapper}>
          <div style={styles.attachmentTitle}>첨부 파일</div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {fileUrls.map((fileUrl, index) => (
              <li
                key={index}
                style={styles.attachmentItem}
                onClick={() => window.open(fileUrl, "_blank")}
              >
                {`첨부파일 ${index + 1}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={styles.buttonContainer}>
        <Button 
          onClick={onBack} 
          variant="back" 
          style={{ width: "84px", height: "36px" }} 
        />
        
        <div style={styles.actionButtonsRight}>
          <Button
            onClick={handleEdit}
            variant="edit"
            style={{ width: "84px", height: "36px" }}
          />
          <Button
            onClick={handleDelete}
            variant="delete"
            style={{ width: "84px", height: "36px" }}
          />
        </div>
      </div>
    </div>
  );
}

PostDetail.propTypes = {
  post: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default PostDetail; 