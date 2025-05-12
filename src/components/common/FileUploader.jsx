import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import '../../styles/common.css';

/**
 * 간단한 파일 업로드 컴포넌트
 * Chakra UI 의존성 제거하고 기본 React와 HTML5 API만 사용
 */
const FileUploader = ({
  onFileSelect,
  maxFiles = 5,
  acceptedFileTypes = '*',
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // 파일 유효성 검사
  const validateFiles = (files) => {
    if (files.length > maxFiles) {
      setError(`최대 ${maxFiles}개까지 업로드할 수 있습니다.`);
      return false;
    }

    // 여기에 추가적인 유효성 검사를 추가할 수 있습니다 (파일 크기, 타입 등)
    
    setError('');
    return true;
  };

  // 드래그 이벤트 핸들러
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // 파일 드롭 핸들러
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (validateFiles(files)) {
      onFileSelect(files);
    }
  };

  // 파일 선택 버튼 클릭 핸들러
  const handleButtonClick = () => {
    if (!disabled) {
      fileInputRef.current.click();
    }
  };

  // 파일 입력 변경 핸들러
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (validateFiles(files)) {
      onFileSelect(files);
    }
    // 파일 입력 필드 초기화 (같은 파일을 다시 선택할 수 있도록)
    e.target.value = null;
  };

  return (
    <div className="file-uploader-container">
      <div 
        className={`file-uploader-dropzone ${dragActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-uploader-input"
          multiple
          accept={acceptedFileTypes}
          onChange={handleFileInputChange}
          disabled={disabled}
        />
        <div className="file-uploader-label">
          <div className="file-uploader-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <p>클릭하거나 파일을 여기에 드래그하세요</p>
          <span className="file-uploader-hint">최대 {maxFiles}개 파일</span>
        </div>
      </div>
      
      {error && <div className="file-uploader-error">{error}</div>}
    </div>
  );
};

FileUploader.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  acceptedFileTypes: PropTypes.string,
  disabled: PropTypes.bool
};

export default FileUploader; 