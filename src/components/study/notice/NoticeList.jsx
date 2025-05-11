import PropTypes from "prop-types";
import NoticeListItem from "./NoticeListItem";
import { useTheme } from "../../../contexts/ThemeContext";
import useStudyRole from "../../../hooks/useStudyRole";

function NoticeList({ notices, onNoticeClick, onEdit, onDelete, isLoading, onCreateClick }) {
  const { colors } = useTheme();
  const { isManager } = useStudyRole();

  if (isLoading) return <div>로딩중...</div>;

  return (
    <div>
      {isManager && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={onCreateClick}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            공지사항 추가
          </button>
        </div>
      )}
      
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
  onCreateClick: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default NoticeList;
