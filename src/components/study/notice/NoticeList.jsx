import PropTypes from 'prop-types';
import LoadingSpinner from '../../common/LoadingSpinner';

function NoticeList({ notices, onNoticeClick, onCreateClick, isLoading }) {
  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          공지사항
        </h2>
        <button
          onClick={onCreateClick}
          style={{
            backgroundColor: '#2563EB',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        >
          새 공지사항
        </button>
      </div>

      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
      }}>
        {notices.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <ul>
            {notices.map((notice) => (
              <li
                key={notice.noticeId}
                onClick={() => onNoticeClick(notice.noticeId)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: 'var(--button-hover-bg)'
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    {notice.title}
                  </h3>
                  <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  작성자: {notice.writer}
                </div>
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
      title: PropTypes.string.isRequired,
      writer: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ).isRequired,
  onNoticeClick: PropTypes.func.isRequired,
  onCreateClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default NoticeList;