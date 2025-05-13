import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { usePost } from "./PostProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";
import FileUploader from "../../common/FileUploader";
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

  const isLoading = propIsLoading || contextIsLoading;

  // 수정 모드라면 초기 데이터 세팅
  useEffect(() => {
    if (post) {
      // 필드명 일관성을 위해 가능한 모든 필드명 확인
      setPostTitle(post.postTitle || post.title || "");
      setPostContent(post.postContent || post.content || "");
    }
  }, [post]);

  // 파일 선택 콜백
  const handleFileSelect = (files) => {
    setSelectedFiles(files);
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

      {/* 공용 파일 업로더 컴포넌트 사용 */}
      <FileUploader
        existingFiles={[]}
        onFileSelect={handleFileSelect}
      />

      <div className="form-buttons">
        <Button type="submit" variant="upload" disabled={isSubmitting} />
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
