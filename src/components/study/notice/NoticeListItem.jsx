import PropTypes from "prop-types";
import { formatDate } from "../../../utils/dateUtils";

function NoticeListItem({ notice, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-6 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <h2 className="text-xl font-semibold mb-2">{notice.noticeTitle}</h2>
      {notice.noticeContent && (
        <p className="text-gray-600 mb-3 line-clamp-2">
          {notice.noticeContent}
        </p>
      )}
      <div className="text-sm text-gray-500">
        <span className="mx-2">•</span>
        <span>{formatDate(notice.noticeCreatedAt)}</span>
      </div>
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
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default NoticeListItem;
