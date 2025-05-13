import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { usePost } from "./PostProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";
import FileUploader from "../../common/FileUploader";
import "../../../styles/notice.css";

function PostEditForm({
  studyId,
  postId,
  initialData,
  onCancel,
  onSaveComplete,
  onPermissionError,
}) {
  const { editPost, deletePost } = usePost();
  const navigate = useNavigate();

  // 콘솔에 초기 데이터 기록
  useEffect(() => {
    console.log("[PostEditForm] initialData:", initialData);
  }, [initialData]);

  const [postTitle, setPostTitle] = useState(initialData?.postTitle || "");
  const [postContent, setPostContent] = useState(
    initialData?.postContent || ""
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
        initialData.files.forEach(file => {
          if (file.fileId) {
            fileIds.push(file.fileId);
          }
        });
      }
      
      console.log("[PostEditForm] 초기 파일 IDs:", fileIds);
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
    if (!postTitle.trim()) {
      setSubmitError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedPost = {
        postTitle,
        postContent,
        remainingFileIds: remainingFileIds,
        newFileNames: selectedFiles.map((file) => file.name),
      };
      
      console.log("[PostEditForm] 수정 요청 데이터:", updatedPost);
      console.log("[PostEditForm] 새 파일 수:", selectedFiles.length);

      const result = await editPost(
        studyId,
        parseInt(postId, 10),
        updatedPost,
        selectedFiles
      );

      console.log("[PostEditForm] 수정 응답:", result);

      if (!result.success) {
        if (result.message && result.message.includes("권한이 없습니다")) {
          const errorMsg =
            "게시글 수정 권한이 없습니다. 작성자만 수정할 수 있습니다.";
          setSubmitError(errorMsg);
          // 부모 컴포넌트에 권한 오류 전달
          if (onPermissionError) {
            onPermissionError(errorMsg);
          }
        } else {
          setSubmitError(
            result.message || "게시글 수정 중 오류가 발생했습니다."
          );
        }
        setIsSubmitting(false);
        return;
      }

      // 성공 시 상세 보기 페이지로 리다이렉트
      if (onSaveComplete) {
        onSaveComplete();
      } else {
        // 콜백 없을 경우 직접 이동
        navigate(`/studies/${studyId}/posts/${postId}`);
      }
    } catch (error) {
      console.error("게시글 수정 중 오류:", error);
      setSubmitError("게시글 수정 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner />;
  }

  // 현재 표시할 기존 파일 필터링 - remainingFileIds에 있는 파일만 표시
  const filteredExistingFiles = initialData?.files?.filter(file => 
    remainingFileIds.includes(file.fileId)
  ) || [];
  
  console.log("[PostEditForm] 남은 파일:", filteredExistingFiles);

  return (
    <form onSubmit={handleSave} className="notice-form">
      {submitError && <div className="notice-error-message">{submitError}</div>}

      <div className="notice-input-group">
        <label className="notice-label" htmlFor="title">
          <span style={{color: '#ee0418', marginRight: '4px'}}>*</span>제목
        </label>
        <input
          id="title"
          className="notice-input"
          placeholder="게시판 제목을 입력하세요"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          required
        />
      </div>

      <div className="notice-input-group">
        <label className="notice-label" htmlFor="content">
          <span style={{color: '#ee0418', marginRight: '4px'}}>*</span>내용
        </label>
        <textarea
          id="content"
          className="notice-textarea"
          placeholder="게시판 내용을 입력하세요"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          maxLength={maxLength}
        />
        <div className="notice-char-count">
          {postContent.length}/{maxLength}
        </div>
      </div>

      {/* 공용 파일 업로더 컴포넌트 사용 */}
      <FileUploader
        existingFiles={filteredExistingFiles}
        onFileSelect={handleFileSelect}
        onExistingFileRemove={handleExistingFileRemove}
      />

      <div className="notice-action-buttons">
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

PostEditForm.propTypes = {
  studyId: PropTypes.string.isRequired,
  postId: PropTypes.string.isRequired,
  initialData: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSaveComplete: PropTypes.func,
  onPermissionError: PropTypes.func,
};

PostEditForm.defaultProps = {
  initialData: {},
  onSaveComplete: null,
  onPermissionError: null,
};

export default PostEditForm;
