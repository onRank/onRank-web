import PropTypes from "prop-types";
import { useEffect } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import ErrorMessage from "../../common/ErrorMessage";
import Button from "../../common/Button";

function NoticeDetail({ studyId, noticeId, handleBack }) {
  const { selectedNotice, isLoading, error, getNoticeById } = useNotice();

  useEffect(() => {
    getNoticeById(studyId, noticeId);
  }, [studyId, noticeId, getNoticeById]);

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6">
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
      <div className="p-6">
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message="잘못된 공지사항 데이터입니다." type="warning" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button onClick={handleBack} variant="back" />
      <div className="border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">
          {selectedNotice.noticeTitle}
        </h1>
        <div className="flex items-center text-gray-600 mb-6">
          <span className="mx-2">•</span>
          <span>{formatDate(selectedNotice.noticeCreatedAt)}</span>
        </div>
        <div className="prose max-w-none">{selectedNotice.noticeContent}</div>
      </div>
    </div>
  );
}

NoticeDetail.propTypes = {
  studyId: PropTypes.string.isRequired,
  noticeId: PropTypes.number.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default NoticeDetail;
