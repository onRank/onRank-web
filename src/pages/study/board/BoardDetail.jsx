import { useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../../../components/common/Button";
import ActionPopup from "../../../components/common/ActionPopup";
import { formatDateYMD } from "../../../utils/dateUtils";
import "../../../styles/board.css";

function BoardDetail({ board, onBack, onEdit, onDelete, isLoading }) {
  const { colors } = useTheme();
  const { studyId, boardId } = useParams();
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // 게시글 데이터 준비
  const boardData = board || {
    postId: parseInt(boardId),
    postTitle: "게시글 제목",
    postContent: "게시글 내용이 여기에 표시됩니다.",
    postCreatedAt: new Date().toISOString(),
    postWritenBy: "작성자명"
  };
  
  // ID 필드 - postId 또는 boardId 사용
  const id = boardData.postId || boardData.boardId || parseInt(boardId);
  
  // 제목 필드 - 여러 가능한 필드명 중 존재하는 것 사용
  const title = boardData.postTitle || boardData.title || boardData.boardTitle || "게시글 제목";
  
  // 내용 필드 - 여러 가능한 필드명 중 존재하는 것 사용
  const content = boardData.postContent || boardData.content || boardData.boardContent || "게시글 내용이 여기에 표시됩니다.";
  
  // 작성일 필드 - 여러 가능한 필드명 중 존재하는 것 사용
  const createdAt = boardData.postCreatedAt || boardData.createdAt || boardData.boardCreatedAt || new Date().toISOString();
  
  // 작성자 필드 - 여러 가능한 필드명 중 존재하는 것 사용
  const writer = boardData.postWritenBy || boardData.writer || "작성자명";
  
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
      <div className="board-detail-container">
        <div className="loading-message">게시글을 불러오는 중입니다...</div>
      </div>
    );
  }

  // 첨부 파일 확인
  const files = boardData.files || boardData.fileUrls || [];
  const hasFiles = Array.isArray(files) && files.length > 0;

  return (
    <div className="board-detail-container">
      <div className="board-detail-actions">
        <Button
          onClick={onBack}
          variant="secondary"
          style={{ marginRight: "10px" }}
        >
          목록으로
        </Button>
        <Button
          onClick={handleShowActionPopup}
          variant="secondary"
        >
          • • •
        </Button>
      </div>

      <div className="board-detail-content-container" style={{ 
        backgroundColor: colors.cardBackground,
        borderRadius: '8px',
        padding: '1.5rem',
        marginTop: '1rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="board-detail-header">
          <h2 className="board-detail-title" style={{ color: colors.textPrimary }}>
            {title}
          </h2>
          <div className="board-detail-meta">
            <span>작성자: {writer}</span>
            <span>작성일: {formattedDate}</span>
          </div>
        </div>
        
        <div className="board-detail-content" style={{ color: colors.text }}>
          {content}
        </div>
        
        {/* 첨부 파일 목록 */}
        {hasFiles && (
          <div className="board-detail-files" style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>첨부 파일</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {files.map((file, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  <a 
                    href={file.fileUrl || file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: colors.primary, textDecoration: 'none' }}
                  >
                    {file.fileName || `첨부파일 ${index + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 액션 팝업 */}
      {showActionPopup && (
        <ActionPopup
          position={popupPosition}
          onClose={handleCloseActionPopup}
          actions={[
            { label: "수정", onClick: handleEdit },
            { label: "삭제", onClick: handleDelete },
          ]}
        />
      )}
    </div>
  );
}

BoardDetail.propTypes = {
  board: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default BoardDetail; 