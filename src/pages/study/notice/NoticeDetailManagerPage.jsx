import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  NoticeProvider,
  useNotice,
} from "../../../components/study/notice/NoticeProvider";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import Button from "../../../components/common/Button";
import { formatDate } from "../../../utils/dateUtils";

function NoticeDetailManagerContent() {
  const { studyId, noticeId } = useParams();
  const navigate = useNavigate();
  const { selectedNotice, isLoading, error, getNoticeById, deleteNotice } =
    useNotice();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (studyId && noticeId) {
      getNoticeById(studyId, parseInt(noticeId, 10));
    }
  }, [studyId, noticeId, getNoticeById]);

  const handleBack = () => {
    navigate(`/studies/${studyId}/notices`);
  };

  const handleEdit = () => {
    navigate(`/studies/${studyId}/notices/${noticeId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("공지사항을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteNotice(studyId, parseInt(noticeId, 10));
      if (result.success) {
        navigate(`/studies/${studyId}/notices`);
      } else {
        alert(result.message || "공지사항 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isDeleting) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Button onClick={handleBack} variant="back" />
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!selectedNotice) {
    return (
      <div className="p-6">
        <Button onClick={handleBack} variant="back" />
        <div className="mt-4">해당 공지사항을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleBack} variant="back" />
        <div className="space-x-2">
          <Button onClick={handleEdit} variant="edit" />
          <Button onClick={handleDelete} variant="delete" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-2">
          {selectedNotice.noticeTitle}
        </h1>
        <div className="text-gray-600 mb-6">
          작성일: {formatDate(selectedNotice.noticeCreatedAt)}
          {selectedNotice.noticeModifiedAt !==
            selectedNotice.noticeCreatedAt && (
            <span className="ml-4">
              수정일: {formatDate(selectedNotice.noticeModifiedAt)}
            </span>
          )}
        </div>

        <div className="prose max-w-none mb-6">
          {selectedNotice.noticeContent || <p>&nbsp;</p>}
        </div>

        {selectedNotice.files && selectedNotice.files.length > 0 && (
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">첨부 파일</h2>
            <ul className="space-y-2">
              {selectedNotice.files.map((file) => (
                <li
                  key={file.fileId}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  onClick={() => window.open(file.fileUrl, "_blank")}
                >
                  {file.fileName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function NoticeDetailManagerPage() {
  return (
    <NoticeProvider>
      <NoticeDetailManagerContent />
    </NoticeProvider>
  );
}

export default NoticeDetailManagerPage;
