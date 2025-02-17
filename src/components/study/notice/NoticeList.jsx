import NoticeListItem from "./NoticeListItem";
import PropTypes from "prop-types";
import LoadingSpinner from "../../common/LoadingSpinner";

export default function NoticeList({ notices, onNoticeClick, isLoading = false }){
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!notices) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        데이터를 불러오는데 실패했습니다.
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        등록된 공지사항이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notices.map((notice) => (
        <NoticeListItem
          key={notice.noticeId}
          notice={notice}
          onClick={() => onNoticeClick(notice.noticeId)}
        />
      ))}
    </div>
  );
}

NoticeList.propTypes = {
  notices: PropTypes.arrayOf(
    PropTypes.shape({
      noticeId: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      writer: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      content: PropTypes.string,
    })
  ).isRequired,
  onNoticeClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

NoticeList.defaultProps = {
  isLoading: false
};