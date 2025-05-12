import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../../contexts/ThemeContext";
import Button from "../../../components/common/Button";
import FileUpload from "../../../components/common/FileUpload";
import "../../../styles/post.css";

function PostCreate({ onSubmit, onCancel, isLoading, error }) {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const formRef = useRef(null);

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
    
    // 폼 유효성 검사 성공 시 부모 컴포넌트의 제출 함수 호출
    onSubmit(title, content, selectedFiles);
  };

  // 파일 선택 처리
  const handleFileSelection = (files) => {
    setSelectedFiles(files);
  };

  return (
    <div className="post-create-container">
      <h2 style={{ color: colors.text, marginBottom: "1.5rem" }}>게시글 작성</h2>
      
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
        
        <div className="form-group">
          <label className="form-label" style={{ color: colors.text }}>
            첨부 파일
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

PostCreate.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default PostCreate; 