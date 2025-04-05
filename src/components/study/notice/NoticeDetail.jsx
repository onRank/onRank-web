import PropTypes from "prop-types";
import { useEffect } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import ErrorMessage from "../../common/ErrorMessage";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";

function NoticeDetail({ studyId, noticeId, handleBack, handleEdit }) {
  const { selectedNotice, isLoading, error, getNoticeById } = useNotice();
  const { colors } = useTheme();

  useEffect(() => {
    getNoticeById(studyId, noticeId);
  }, [studyId, noticeId, getNoticeById]);

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (
    !selectedNotice ||
    !selectedNotice.noticeTitle ||
    !selectedNotice.noticeContent
  ) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message="잘못된 공지사항 데이터입니다." type="warning" />
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem' 
      }}>
        <Button onClick={handleBack} variant="back" />
        <Button onClick={() => handleEdit(noticeId)} variant="edit" />
      </div>
      <div style={{ 
        border: `1px solid var(--border)`, 
        borderRadius: '0.5rem', 
        padding: '1.5rem',
        backgroundColor: `var(--cardBackground)`
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: `var(--textPrimary)`
        }}>
          {selectedNotice.noticeTitle}
        </h1>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: `var(--textSecondary)`, 
          marginBottom: '1.5rem' 
        }}>
          <span style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>•</span>
          <span>{formatDate(selectedNotice.noticeCreatedAt)}</span>
        </div>
        <div style={{ 
          maxWidth: 'none',
          color: `var(--textPrimary)`
        }}>
          {selectedNotice.noticeContent}
        </div>
      </div>
    </div>
  );
}

NoticeDetail.propTypes = {
  studyId: PropTypes.string.isRequired,
  noticeId: PropTypes.number.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
};

export default NoticeDetail;
