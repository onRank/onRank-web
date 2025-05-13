import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";
import FileUploader from "../../common/FileUploader";

function NoticeEditForm({
  studyId,
  noticeId,
  initialData,
  onCancel,
  onSaveComplete,
}) {
  const { editNotice, deleteNotice } = useNotice();
  const navigate = useNavigate();

  // 콘솔에 초기 데이터 기록
  useEffect(() => {
    console.log("[NoticeEditForm] initialData:", initialData);
  }, [initialData]);

  const [noticeTitle, setNoticeTitle] = useState(
    initialData?.noticeTitle || ""
  );
  const [noticeContent, setNoticeContent] = useState(
    initialData?.noticeContent || ""
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  // 남겨둘 파일 ID 배열 상태 처리 개선
  const [remainingFileIds, setRemainingFileIds] = useState([]);

  // 초기 파일 데이터 설정
  useEffect(() => {
    if (initialData) {
      // API 응답 구조에 맞게 파일 ID 추출
      const fileIds = [];

      // files 배열이 있는 경우
      if (initialData.files && Array.isArray(initialData.files)) {
        initialData.files.forEach((file) => {
          if (file.fileId) {
            fileIds.push(file.fileId);
          }
        });
      }

      console.log("[NoticeEditForm] 초기 파일 IDs:", fileIds);
      setRemainingFileIds(fileIds);
    }
  }, [initialData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const maxLength = 10000;

  // 파일 선택 콜백
  const handleFileSelect = (files) => {
    setSelectedFiles(files);
  };

  // 기존 파일 제거 콜백
  const handleExistingFileRemove = (fileId) => {
    setRemainingFileIds((prev) => prev.filter((id) => id !== fileId));
  };

  // 저장 핸들러
  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    // 입력 검증
    if (!noticeTitle.trim()) {
      setSubmitError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedNotice = {
        noticeTitle,
        noticeContent,
        remainingFileIds: remainingFileIds,
        newFileNames: selectedFiles.map((file) => file.name),
      };

      console.log("[NoticeEditForm] 수정 요청 데이터:", updatedNotice);
      console.log("[NoticeEditForm] 새 파일 수:", selectedFiles.length);

      const result = await editNotice(
        studyId,
        parseInt(noticeId, 10),
        updatedNotice,
        selectedFiles
      );

      if (!result.success) {
        setSubmitError(
          result.message || "공지사항 수정 중 오류가 발생했습니다."
        );
        setIsSubmitting(false);
        return;
      }

      // 성공 시 상세 보기 페이지로 리다이렉트
      if (onSaveComplete) {
        onSaveComplete();
      } else {
        // 콜백 없을 경우 직접 이동
        navigate(`/studies/${studyId}/notices/${noticeId}`);
      }
    } catch (error) {
      console.error("공지사항 수정 중 오류:", error);
      setSubmitError("공지사항 수정 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deleteNotice(studyId, parseInt(noticeId, 10));
      if (result.success) {
        navigate(`/studies/${studyId}/notices`);
      } else {
        setSubmitError(
          result.message || "공지사항 삭제 중 오류가 발생했습니다."
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      setSubmitError("공지사항 삭제 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner />;
  }

  // 현재 표시할 기존 파일 필터링 - remainingFileIds에 있는 파일만 표시
  const filteredExistingFiles =
    initialData?.files?.filter((file) =>
      remainingFileIds.includes(file.fileId)
    ) || [];

  console.log("[NoticeEditForm] 남은 파일:", filteredExistingFiles);

  return (
    <form onSubmit={handleSave} className="notice-form">
      {submitError && <div className="form-error">{submitError}</div>}

      <div className="notice-input-group">
        <label className="notice-label" htmlFor="title">
          제목
        </label>
        <input
          id="title"
          className="notice-input"
          placeholder="공지사항 제목을 입력하세요"
          value={noticeTitle}
          onChange={(e) => setNoticeTitle(e.target.value)}
          required
        />
      </div>

      <div className="notice-input-group">
        <label className="notice-label" htmlFor="content">
          내용을 입력해주세요.
        </label>
        <textarea
          id="content"
          className="notice-textarea"
          placeholder="공지사항 내용을 입력하세요"
          value={noticeContent}
          onChange={(e) => setNoticeContent(e.target.value)}
          maxLength={maxLength}
        />
        <div className="notice-char-count">
          {noticeContent.length}/{maxLength}
        </div>
      </div>

      {/* 공용 파일 업로더 컴포넌트 사용 */}
      <FileUploader
        existingFiles={filteredExistingFiles}
        onFileSelect={handleFileSelect}
        onExistingFileRemove={handleExistingFileRemove}
      />

      <div
        className="notice-form-buttons"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button type="submit" variant="store" disabled={isSubmitting} />
        <Button
          type="button"
          variant="back"
          onClick={() => onCancel()}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}

NoticeEditForm.propTypes = {
  studyId: PropTypes.string.isRequired,
  noticeId: PropTypes.string.isRequired,
  initialData: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSaveComplete: PropTypes.func,
};

NoticeEditForm.defaultProps = {
  initialData: {},
  onSaveComplete: null,
};

export default NoticeEditForm;
