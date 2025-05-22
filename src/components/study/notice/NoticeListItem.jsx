import PropTypes from "prop-types";
import { formatDateYMD } from "../../../utils/dateUtils";
import { useTheme } from "../../../contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { useNotice } from "./NoticeProvider";
import ActionPopup from "../../../components/common/ActionPopup";

function NoticeListItem({
  notice,
  onClick,
  onEdit,
  onDelete,
  index,
  totalItems,
}) {
  const { isDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState("bottom-right");
  const menuRef = useRef(null);
  const { memberRole } = useNotice();

  // 관리자 권한 확인 (CREATOR 또는 HOST인 경우)
  const isManager = memberRole === "CREATOR" || memberRole === "HOST";

  // 공지사항의 경우 관리자만 메뉴를 보여줌 (수정/삭제 권한)
  const showMenu = isManager;

  // 파일 첨부 여부 확인
  const hasFiles =
    (notice.files && notice.files.length > 0) ||
    (notice.fileUrls && notice.fileUrls.length > 0);

  // 아이템 위치에 따라 팝업 위치 결정
  useEffect(() => {
    if (index !== undefined && totalItems !== undefined) {
      // 마지막 3개 아이템은 팝업이 위로 나타나도록 설정
      if (index >= totalItems - 3) {
        setPopupPosition("top-right");
      } else {
        setPopupPosition("bottom-right");
      }
    }
  }, [index, totalItems]);

  // 토글 메뉴 클릭 처리
  const handleMenuClick = (e) => {
    e.stopPropagation(); // 클릭 이벤트가 카드까지 전파되지 않도록 방지
    setMenuOpen(!menuOpen);
  };

  // 수정 처리
  const handleEdit = () => {
    if (onEdit) onEdit(notice.noticeId);
  };

  // 삭제 처리
  const handleDelete = () => {
    if (onDelete) {
      onDelete(notice.noticeId);
    }
  };

  // 메뉴 닫기
  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div onClick={onClick} className="notice-item">
      <div className="notice-content-block">
        <div className="notice-date">
          게시: {formatDateYMD(notice.noticeCreatedAt)}
        </div>
        <h2 className="notice-title">{notice.noticeTitle}</h2>
      </div>

      {showMenu && (
        <div className="notice-menu-container" ref={menuRef}>
          <button
            className="notice-menu-button"
            onClick={handleMenuClick}
            aria-label="메뉴 열기"
            style={{ outline: "none" }}>
            ⋮
          </button>

          {/* 액션 팝업 */}
          <ActionPopup
            show={menuOpen}
            onClose={handleCloseMenu}
            onEdit={handleEdit}
            onDelete={handleDelete}
            position={popupPosition}
            skipConfirm={false}
          />
        </div>
      )}
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
    fileUrls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  index: PropTypes.number,
  totalItems: PropTypes.number,
};

export default NoticeListItem;
