import PropTypes from "prop-types";
import LoadingSpinner from "../../common/LoadingSpinner";
import NoticeListItem from "./NoticeListItem";
import { useTheme } from "../../../contexts/ThemeContext";

function NoticeList({ notices, onNoticeClick, handleCreate, isLoading }) {
  const { colors } = useTheme();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div
        style={{
          backgroundColor: `var(--cardBackground)`,
          border: `1px solid var(--border)`,
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        {notices.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              color: `var(--textSecondary)`,
            }}
          >
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {notices.map((notice) => (
              <div key={notice.noticeId}>
                <NoticeListItem
                  notice={notice}
                  onClick={() => onNoticeClick(notice.noticeId)}
                />
              </div>
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
  handleCreate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default NoticeList;
