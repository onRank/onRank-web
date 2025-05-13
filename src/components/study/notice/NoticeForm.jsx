import { useState, useEffect, useRef } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";
import { useParams } from "react-router-dom";
import { IoAttach } from "react-icons/io5";
import { getFileIcon, formatFileSize, isImageFile, getFilePreviewUrl } from "../../../utils/fileUtils";
import "../../../styles/notice.css";

const NoticeForm = ({ notice = null, onSubmit, onCancel, isLoading: propIsLoading }) => {
  const { studyId } = useParams(); // Get studyId from URL params
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isLoading: contextIsLoading, createNotice } = useNotice();
  const { colors } = useTheme();
  const maxLength = 10000;
  const fileInputRef = useRef(null);

  // Use loading state from props or context
  const isLoading = propIsLoading || contextIsLoading;

  useEffect(() => {
    if (notice) {
      setNoticeTitle(notice.noticeTitle);
      setNoticeContent(notice.noticeContent);
    }
  }, [notice]);

  // 파일 선택 버튼 클릭 핸들러
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 이미 선택된 파일과 중복 확인 (새로 추가하는 파일)
    const newFiles = files.filter(
      (file) => !selectedFiles.some((f) => f.name === file.name)
    );

    // 파일 크기 제한 (10MB)
    const oversizedFiles = newFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError(
        `다음 파일이 10MB를 초과합니다: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    // 선택된 파일 추가
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    // 파일 선택 후 input 초기화
    e.target.value = "";
  };

  // 선택된 파일 제거 핸들러
  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  // 공지사항 생성 핸들러
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
      if (result.data && result.data.noticeId) {
        console.log("[NoticeForm] 생성된 공지사항 ID:", result.data.noticeId);
        // 약간 지연 후 콜백 호출 (사용자가 성공/경고 메시지를 볼 수 있도록)
        setTimeout(
          () => {
            if (onCancel) onCancel(result.data.noticeId);
          },
          result.warning ? 1500 : 500
        ); // 경고가 있으면 더 오래 표시
      } else {
        console.warn(
          "[NoticeForm] 생성된 공지사항에 ID가 없습니다:",
          result.data
        );
        setTimeout(
          () => {
            if (onCancel) onCancel();
          },
          result.warning ? 1500 : 500
        );
      }
    } catch (error) {
      console.error("[NoticeForm] 공지사항 처리 중 오류:", error);
      setError(
        "공지사항 처리 중 오류 발생: " + (error.message || "알 수 없는 오류")
      );
      setIsSubmitting(false);
    } finally {
      // 오류가 있거나 경고가 있는 경우에는 isSubmitting 상태를 변경하지 않음
      // 성공 콜백에서 페이지 이동 처리
    }
  };

  if (isLoading || isSubmitting) return <LoadingSpinner />;

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

      {/* 첨부파일 목록 - 향상된 UI */}
      {selectedFiles.length > 0 && (
        <div className="notice-form-file-list">
          <h3 className="notice-form-file-title">첨부 파일</h3>
          <div className="notice-files-container">
            {selectedFiles.map((file, index) => (
              <div className="notice-file-item" key={index}>
                {isImageFile(file) && (
                  <div className="notice-image-preview">
                    <img src={getFilePreviewUrl(file)} alt={file.name} />
                  </div>
                )}
                <div className="notice-file-info-row">
                  <div className="notice-file-icon">{getFileIcon(file.name)}</div>
                  <div className="notice-file-info">
                    <div className="notice-file-name">{file.name}</div>
                    <div className="notice-file-size">{formatFileSize(file.size)}</div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveFile(file.name)}
                    className="notice-remove-button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 파일 업로드 버튼 */}
      <div className="notice-input-group">
        <input 
          ref={fileInputRef}
          type="file" 
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        
        <button 
          type="button" 
          onClick={handleAttachClick}
          className="notice-attach-button"
        >
          <IoAttach size={24} style={{ marginBottom: "8px" }} />
          파일을 끌어서 놓거나 클릭하여 추가하세요
        </button>
      </div>

      <div className="notice-action-buttons">
        <div className="notice-left-buttons">
          <Button type="submit" variant="upload" disabled={isSubmitting} />
        </div>
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