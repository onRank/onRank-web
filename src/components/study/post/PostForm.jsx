import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { usePost } from "./PostProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";
import { IoAttach } from "react-icons/io5";
import { getFileIcon, formatFileSize, isImageFile, getFilePreviewUrl } from "../../../utils/fileUtils";
import "../../../styles/post.css";

/*
  PostForm – 게시글 작성 공통 컴포넌트
  • NoticeForm 의 구조/스타일/UX 를 그대로 차용하고, 필드명만 post* 로 교체
  • 모든 스터디 참여자가 글 작성 가능하므로 별도 권한 체크는 하지 않는다.
*/

const PostForm = ({ post = null, onSubmit, onCancel, isLoading: propIsLoading }) => {
  const { studyId } = useParams();
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isLoading: contextIsLoading, createPost } = usePost();
  const { colors } = useTheme(); // eslint-disable-line no-unused-vars
  const maxLength = 10000;
  const fileInputRef = useRef(null);

  const isLoading = propIsLoading || contextIsLoading;

  // 수정 모드라면 초기 데이터 세팅
  useEffect(() => {
    if (post) {
      // 필드명 일관성을 위해 가능한 모든 필드명 확인
      setPostTitle(post.postTitle || post.title || "");
      setPostContent(post.postContent || post.content || "");
    }
  }, [post]);

  // 파일 선택 버튼 클릭 핸들러
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 중복 & 용량(10MB) 체크
    const newFiles = files.filter((file) => !selectedFiles.some((f) => f.name === file.name));
    const oversized = newFiles.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversized.length) {
      setError(`다음 파일이 10MB를 초과합니다: ${oversized.map((f) => f.name).join(", ")}`);
      return;
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    // reset input
    e.target.value = "";
  };

  // 첨부 취소
  const handleRemoveFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  // 게시글 생성
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!postTitle.trim()) {
      setError("제목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("[PostForm] 게시글 생성 요청 준비, studyId:", studyId);
      
      const newPost = {
        postTitle,
        postContent,
        fileNames: selectedFiles.map((f) => f.name),
      };

      if (!studyId) {
        console.error("[PostForm] studyId가 없습니다!");
        setError("스터디 ID를 찾을 수 없습니다.");
        setIsSubmitting(false);
        return;
      }

      // 컨테이너가 onSubmit 을 내려줬다면 위임 (테스트/재사용성을 위해)
      if (onSubmit) {
        const ok = await onSubmit(newPost, selectedFiles);
        if (!ok) setIsSubmitting(false);
        return;
      }

      const result = await createPost(studyId, newPost, selectedFiles);

      if (!result.success) {
        setError(result.message || "게시글 저장 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      if (result.warning) {
        setError(result.warning); // 업로드 실패 같은 경고는 에러 영역에 표시
      }

      // 성공 – caller 에게 알림 후 페이지 이동 처리
      if (result.data?.postId) {
        setTimeout(() => {
          if (onCancel) onCancel(result.data.postId);
        }, result.warning ? 1500 : 500);
      } else {
        setTimeout(() => {
          if (onCancel) onCancel();
        }, result.warning ? 1500 : 500);
      }
    } catch (err) {
      console.error("[PostForm] 게시글 처리 오류:", err);
      setError(err.message || "게시글 처리 중 오류 발생");
      setIsSubmitting(false);
    }
  };

  if (isLoading || isSubmitting) return <LoadingSpinner />;

  return (
    <form onSubmit={handleCreatePost} className="post-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="title">제목</label>
        <input
          id="title"
          className="form-control"
          placeholder="게시글 제목을 입력하세요"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="content">내용을 입력해주세요.</label>
        <textarea
          id="content"
          className="form-control textarea"
          placeholder="게시글 내용을 입력하세요"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          maxLength={maxLength}
        />
        <div className="char-count">{postContent.length}/{maxLength}</div>
      </div>

      {/* 첨부파일 목록 - 향상된 UI */}
      {selectedFiles.length > 0 && (
        <div className="file-list">
          <h3 className="file-list-title">첨부 파일</h3>
          <div className="post-files-container">
            {selectedFiles.map((file, index) => (
              <div className="post-file-item" key={index}>
                {isImageFile(file) && (
                  <div className="post-image-preview">
                    <img src={getFilePreviewUrl(file)} alt={file.name} />
                  </div>
                )}
                <div className="post-file-info-row">
                  <div className="post-file-icon">{getFileIcon(file.name)}</div>
                  <div className="post-file-info">
                    <div className="post-file-name">{file.name}</div>
                    <div className="post-file-size">{formatFileSize(file.size)}</div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveFile(file.name)}
                    className="remove-button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 파일 업로드 섹션 */}
      <div className="form-group">
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
          className="attach-button"
        >
          <IoAttach size={24} style={{ marginBottom: "8px" }} />
          파일을 끌어서 놓거나 클릭하여 추가하세요
        </button>
      </div>

      <div className="form-buttons">
        <div>
          <Button type="submit" variant="upload" disabled={isSubmitting} />
        </div>
        <Button type="button" variant="back" onClick={onCancel} disabled={isSubmitting} />
      </div>
    </form>
  );
};

PostForm.propTypes = {
  post: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default PostForm;
