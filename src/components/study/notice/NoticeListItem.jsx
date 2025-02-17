import PropTypes from 'prop-types';

function NoticeListItem({ notice, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
    >
      <h2 className="text-lg font-semibold">{notice.title}</h2>
      <div className="mt-2 text-sm text-gray-600">
        <span>{notice.writer}</span>
        <span className="mx-2">•</span>
        <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

NoticeListItem.propTypes = {
  notice: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    writer: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default NoticeListItem;