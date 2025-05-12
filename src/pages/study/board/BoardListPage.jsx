import { useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../../../components/common/Button";
import ActionPopup from "../../../components/common/ActionPopup";
import "../../../styles/board.css";

function BoardListPage({
  boards,
  onAddBoard,
  onDeleteBoard,
  onViewBoardDetail,
  isLoading,
  error,
  memberRole,
}) {
  const { colors } = useTheme();
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // 관리자 권한 확인
  const isManager = memberRole === "HOST" || memberRole === "CREATOR";

  // 게시글 액션 팝업 표시
  const handleShowActionPopup = (event, boardId) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY
    });
    setSelectedBoardId(boardId);
    setShowActionPopup(true);
  };

  // 게시글 액션 팝업 닫기
  const handleCloseActionPopup = () => {
    setShowActionPopup(false);
    setSelectedBoardId(null);
  };

  // 게시글 삭제 처리
  const handleDelete = async () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      await onDeleteBoard(selectedBoardId);
      handleCloseActionPopup();
    }
  };

  // 임시 개발 중 메시지
  if (!error) {
    return (
      <div className="board-list-container">
        {/* 게시글 추가 안내 - 관리자 권한이 있을 때만 표시 */}
        {isManager && (
          <div
            className="add-section-box"
            style={{ backgroundColor: colors.cardBackground }}>
            <div>
              <div className="add-section-title" style={{ color: colors.text }}>
                게시글 추가
              </div>
              <div
                className="add-section-description"
                style={{ color: colors.textSecondary }}>
                새로운 게시글을 추가해주세요.
              </div>
            </div>
            <Button onClick={onAddBoard} variant="add" />
          </div>
        )}

        {/* 개발 중 메시지 */}
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginTop: '1rem' 
        }}>
          게시판 기능 개발 중입니다.
        </div>

        {/* 액션 팝업 */}
        {showActionPopup && (
          <ActionPopup
            position={popupPosition}
            onClose={handleCloseActionPopup}
            actions={[
              { label: "삭제", onClick: handleDelete },
            ]}
          />
        )}
      </div>
    );
  }

  return (
    <div className="board-list-container">
      {/* 게시글 추가 안내 - 관리자 권한이 있을 때만 표시 */}
      {isManager && (
        <div
          className="add-section-box"
          style={{ backgroundColor: colors.cardBackground }}>
          <div>
            <div className="add-section-title" style={{ color: colors.text }}>
              게시글 추가
            </div>
            <div
              className="add-section-description"
              style={{ color: colors.textSecondary }}>
              새로운 게시글을 추가해주세요.
            </div>
          </div>
          <Button onClick={onAddBoard} variant="add" />
        </div>
      )}

      {/* 오류 메시지 표시 */}
      {error && <div className="error-message">{error}</div>}

      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div className="loading-message">게시글을 불러오는 중입니다...</div>
      )}

      {/* 게시글 목록 */}
      {!isLoading && boards.length === 0 ? (
        <div className="empty-message">
          등록된 게시글이 없습니다.{" "}
          {isManager && "게시글 추가 버튼을 눌러 새 게시글을 추가해보세요."}
        </div>
      ) : (
        <div className="board-items">
          {boards.map((board) => (
            <div
              key={board.boardId}
              className="board-item"
              onClick={() => onViewBoardDetail(board)}
              style={{ backgroundColor: colors.cardBackground }}
            >
              <div className="board-item-header">
                <h3 className="board-title" style={{ color: colors.textPrimary }}>
                  {board.boardTitle}
                </h3>
                {isManager && (
                  <button
                    className="more-options-button"
                    onClick={(e) => handleShowActionPopup(e, board.boardId)}
                  >
                    <span className="more-options-icon">⋮</span>
                  </button>
                )}
              </div>
              <div className="board-item-content" style={{ color: colors.text }}>
                {board.boardContent}
              </div>
              <div className="board-item-footer">
                <span className="board-date">
                  {new Date(board.boardCreatedAt).toLocaleDateString()}
                </span>
                <span className="board-writer">{board.writer}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 액션 팝업 */}
      {showActionPopup && (
        <ActionPopup
          position={popupPosition}
          onClose={handleCloseActionPopup}
          actions={[
            { label: "삭제", onClick: handleDelete },
          ]}
        />
      )}
    </div>
  );
}

BoardListPage.propTypes = {
  boards: PropTypes.array.isRequired,
  onAddBoard: PropTypes.func.isRequired,
  onDeleteBoard: PropTypes.func.isRequired,
  onViewBoardDetail: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  memberRole: PropTypes.string,
};

export default BoardListPage; 