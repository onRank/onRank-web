import PropTypes from 'prop-types';
import { formatDate } from '../../../utils/dateUtils';

function NoticeListItem({ notice, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="p-6 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <h2 className="text-xl font-semibold mb-2">{notice.title}</h2>
      {notice.content && (
        <p className="text-gray-600 mb-3 line-clamp-2">
          {notice.content}
        </p>
      )}
      <div className="text-sm text-gray-500">
        <span>{notice.writer}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(notice.createdAt)}</span>
      </div>
    </div>
  );
}

NoticeListItem.propTypes = {
  notice: PropTypes.shape({
    noticeId: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    writer: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    content: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default NoticeListItem;