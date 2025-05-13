import PropTypes from "prop-types";
import NoticeListItem from "./NoticeListItem";
import { useTheme } from "../../../contexts/ThemeContext";
import "../../../styles/notice.css";

function NoticeList({ notices, onNoticeClick, onEdit, onDelete, isLoading }) {
  const { colors } = useTheme();

  if (isLoading) {
    return <div className="notice-loading">공지사항 목록을 불러오는 중...</div>;
  }

  if (!notices || notices.length === 0) {
    return <div className="notice-empty">등록된 공지사항이 없습니다.</div>;
  }

  return (
    <div className="notice-list-container">
      {notices.map((notice) => (
        <NoticeListItem
          key={notice.noticeId}
          notice={notice}
          onClick={() => onNoticeClick(notice.noticeId)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

NoticeList.propTypes = {
  notices: PropTypes.arrayOf(
    PropTypes.shape({
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
    })
  ).isRequired,
  onNoticeClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default NoticeList;
