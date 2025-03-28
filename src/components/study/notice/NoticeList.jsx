import PropTypes from "prop-types";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "./Button";
import NoticeListItem from "./NoticeListItem";

function NoticeList({ notices, onNoticeClick, handleCreate, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">공지사항</h2>
        <Button onClick={handleCreate} variant="create" />
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        {notices.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <ul className="space-y-2">
            {notices.map((notice) => (
              <li key={notice.noticeId}>
                <NoticeListItem
                  notice={notice}
                  onClick={() => onNoticeClick(notice.noticeId)}
                />
              </li>
            ))}
          </ul>
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
  handleCreate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default NoticeList;
