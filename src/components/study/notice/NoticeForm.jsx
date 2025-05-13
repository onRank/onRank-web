//공지사항 추가

import { useState, useEffect } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";
import { useParams } from "react-router-dom";
import FileUploader from "../../common/FileUploader";
import "../../../styles/notice.css";

const NoticeForm = ({
  notice = null,
  onSubmit,
  onCancel,
  isLoading: propIsLoading,
}) => {
  const { studyId } = useParams(); // Get studyId from URL params
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isLoading: contextIsLoading, createNotice } = useNotice();
  const { colors } = useTheme();
  const maxLength = 10000;

  // Use loading state from props or context
  const isLoading = propIsLoading || contextIsLoading;

  useEffect(() => {
    if (notice) {
      setNoticeTitle(notice.noticeTitle);
      setNoticeContent(notice.noticeContent);
    }
  }, [notice]);

  // 파일 선택 콜백
  const handleFileSelect = (files) => {
    setSelectedFiles(files);
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // 입력 검증
    if (!noticeTitle.trim()) {
      setError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 생성 모드
      const newNotice = {
        noticeTitle,
        noticeContent,
        fileNames: selectedFiles.map((file) => file.name),
      };

      console.log("[NoticeForm] 공지사항 생성 요청, studyId:", studyId);

      if (!studyId) {
        console.error("[NoticeForm] studyId가 없습니다!");
        setError("스터디 ID를 찾을 수 없습니다.");
        setIsSubmitting(false);
        return;
      }

      // onSubmit prop을 사용하여 상위 컴포넌트에서 처리
      if (onSubmit) {
        const success = await onSubmit(newNotice, selectedFiles);
        if (!success) {
          setIsSubmitting(false);
        }
        return;
      }

      // 직접 createNotice 호출 (기존 코드 유지)
      const result = await createNotice(studyId, newNotice, selectedFiles);

      // 성공 여부 확인 (성공이지만 파일 업로드 실패 경고가 있는 경우 포함)
      if (!result.success) {
        setError(result.message || "공지사항 저장 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      // 경고 메시지 표시 (파일 업로드 실패)
      if (result.warning) {
        console.warn("[NoticeForm] 공지사항 생성 경고:", result.warning);
        setError(result.warning);
      } else {
        // 순수한 성공 메시지
        console.log("[NoticeForm] 공지사항 생성 성공:", result.message);
      }

      // 성공 시 콜백 호출 - 생성된 공지사항의 ID를 전달
      if (result.data?.noticeId) {
        setTimeout(
          () => {
            if (onCancel) onCancel(result.data.noticeId);
          },
          result.warning ? 1500 : 500
        );
      } else {
        setTimeout(
          () => {
            if (onCancel) onCancel();
          },
          result.warning ? 1500 : 500
        );
      }
    } catch (err) {
      console.error("[NoticeForm] 공지사항 처리 오류:", err);
      setError(err.message || "공지사항 처리 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleCreateNotice} className="notice-form">
      {error && <div className="notice-error-message">{error}</div>}

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
          내용
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
      <FileUploader existingFiles={[]} onFileSelect={handleFileSelect} />

      <div className="notice-action-buttons">
        <Button type="submit" variant="upload" disabled={isSubmitting} />
        <Button
          type="button"
          variant="back"
          onClick={onCancel}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default NoticeForm;
