import PropTypes from "prop-types";
import NoticeListItem from "./NoticeListItem";
import { useTheme } from "../../../contexts/ThemeContext";

function NoticeList({ notices, onNoticeClick, handleCreate, isLoading }) {
  const { colors } = useTheme();

  if (isLoading) return <div>로딩중...</div>;

  return (
    <div>
      <div className="bg-white border rounded-lg overflow-hidden">
        {notices.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div>
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
        )}
      </div>
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
