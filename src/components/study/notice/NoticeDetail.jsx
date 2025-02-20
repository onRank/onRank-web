import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { studyService } from '../../../services/api';
import LoadingSpinner from '../../common/LoadingSpinner';
import { formatDate } from '../../../utils/dateUtils';
import ErrorMessage from '../../common/ErrorMessage';
import BackButton from './BackButton';

function NoticeDetail({ studyId, noticeId, onBack }) {
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNoticeDetail = async () => {
      try {
        const data = await studyService.getNoticeDetail(studyId, noticeId);
        setNotice(data);
      } catch (error) {
        console.error('공지사항 상세 조회 실패:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoticeDetail();
  }, [studyId, noticeId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <BackButton onClick={onBack} className="mb-4" />
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!notice || !notice.title || !notice.content) {
    return (
      <div className="p-6">
        <BackButton onClick={onBack} className="mb-4" />
        <ErrorMessage 
          message="잘못된 공지사항 데이터입니다." 
          type="warning" 
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <BackButton onClick={onBack} className="mb-4" />
      <div className="border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{notice.title}</h1>
        <div className="flex items-center text-gray-600 mb-6">
          <span>{notice.writer}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(notice.createdAt)}</span>
        </div>
        <div className="prose max-w-none">
          {notice.content}
        </div>
      </div>
    </div>
  );
}

NoticeDetail.propTypes = {
  studyId: PropTypes.string.isRequired,
  noticeId: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default NoticeDetail;