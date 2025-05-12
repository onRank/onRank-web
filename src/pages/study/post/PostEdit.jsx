import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../../../components/common/Button";
import FileUpload from "../../../components/common/FileUpload";
import "../../../styles/post.css";

function PostEdit({ post, onSubmit, onCancel, isLoading, error }) {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const formRef = useRef(null);

  // 게시글 데이터 로드
  useEffect(() => {
    if (post) {
      setTitle(post.title || post.postTitle || post.boardTitle || "");
      setContent(post.content || post.postContent || post.boardContent || "");
      
      // 기존 파일 데이터 설정
      if (post.files && Array.isArray(post.files) && post.files.length > 0) {
        setExistingFiles(post.files);
      } else if (post.fileUrls && Array.isArray(post.fileUrls) && post.fileUrls.length > 0) {
        // fileUrls 배열이 있는 경우 가상 파일 객체로 변환
        const virtualFiles = post.fileUrls.map((url, index) => ({
          fileId: `existing-${index}`,
          fileName: `첨부파일 ${index + 1}`,
          fileUrl: url,
          isExisting: true
        }));
        setExistingFiles(virtualFiles);
      }
    }
  }, [post]);

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 폼 유효성 검사
    const errors = {};
    if (!title.trim()) {
      errors.title = "제목을 입력해주세요";
    }
    if (!content.trim()) {
      errors.content = "내용을 입력해주세요";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // 기존 파일과 새 파일 합치기
    const allFiles = [
      ...existingFiles.filter(file => !file.toDelete),
      ...selectedFiles
    ];
    
    // 폼 유효성 검사 성공 시 부모 컴포넌트의 제출 함수 호출
    onSubmit(title, content, allFiles);
  };

  // 파일 선택 처리
  const handleFileSelection = (files) => {
    setSelectedFiles(files);
  };

  // 기존 파일 삭제 처리
  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles(prevFiles => 
      prevFiles.map(file => 
        file.fileId === fileId 
          ? { ...file, toDelete: true } 
          : file
      )
    );
  };

  return (
    <div className="post-edit-container">
      <h2 style={{ color: colors.text, marginBottom: "1.5rem" }}>게시글 수정</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label" style={{ color: colors.text }}>
            제목
          </label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            style={{ 
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: validationErrors.title ? "#e53935" : colors.border
            }}
          />
          {validationErrors.title && (
            <div className="form-error">{validationErrors.title}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="content" className="form-label" style={{ color: colors.text }}>
            내용
          </label>
          <textarea
            id="content"
            className="form-control textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
            style={{ 
              backgroundColor: colors.inputBackground,
              color: colors.text,
              borderColor: validationErrors.content ? "#e53935" : colors.border
            }}
          />
          {validationErrors.content && (
            <div className="form-error">{validationErrors.content}</div>
          )}
        </div>
        
        {/* 기존 첨부 파일 목록 */}
        {existingFiles.length > 0 && (
          <div className="form-group">
            <label className="form-label" style={{ color: colors.text }}>
              기존 첨부 파일
            </label>
            <ul className="post-file-list">
              {existingFiles.map((file) => 
                !file.toDelete && (
                  <li key={file.fileId} className="post-file-item">
                    <span 
                      style={{ cursor: 'pointer', marginRight: '8px' }}
                      onClick={() => window.open(file.fileUrl, '_blank')}
                    >
                      {file.fileName || `첨부파일 ${file.fileId}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingFile(file.fileId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e53935',
                        cursor: 'pointer'
                      }}
                    >
                      삭제
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label" style={{ color: colors.text }}>
            첨부 파일 추가
          </label>
          <FileUpload
            onFileSelect={handleFileSelection}
            maxFiles={5}
            acceptedFileTypes="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-buttons">
          <Button
            onClick={onCancel}
            variant="cancel"
            disabled={isLoading}
            style={{ marginRight: "0.5rem" }}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            loading={isLoading}
          />
        </div>
      </form>
    </div>
  );
}

PostEdit.propTypes = {
  post: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default PostEdit; 