import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { formatFileSize, getFileIcon, isImageFile } from "../../utils/fileUtils";
import Button from "./Button";
import "../../styles/fileUploader.css";

/**
 * 간단한 파일 업로드 컴포넌트
 * Chakra UI 의존성 제거하고 기본 React와 HTML5 API만 사용
 */
function FileUploader({
  existingFiles,
  onFileSelect,
  onFileRemove,
  onExistingFileRemove
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (onFileSelect) {
      onFileSelect(selectedFiles);
    }
  }, [selectedFiles, onFileSelect]);

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 이미 선택된 파일과 중복 확인
    const newFiles = files.filter(
      (file) => !selectedFiles.some((f) => f.name === file.name)
    );

    // 파일 크기 제한 (10MB)
    const oversizedFiles = newFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setErrorMessage(
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

  // 기존 파일 제거 핸들러
  const handleRemoveExistingFile = (fileId) => {
    if (onExistingFileRemove) {
      onExistingFileRemove(fileId);
    }
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // 이미 선택된 파일과 중복 확인
    const newFiles = files.filter(
      (file) => !selectedFiles.some((f) => f.name === file.name)
    );

    // 파일 크기 제한 (10MB)
    const oversizedFiles = newFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setErrorMessage(
        `다음 파일이 10MB를 초과합니다: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    // 선택된 파일 추가
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  // 이미지 미리보기 핸들러
  const handleImagePreview = (fileUrl) => {
    window.open(fileUrl);
  };

  // 통합된 파일 목록
  const hasFiles = existingFiles.length > 0 || selectedFiles.length > 0;

  return (
    <div className="file-uploader-container">
      {errorMessage && <div className="file-uploader-error">{errorMessage}</div>}

      <h3 className="section-subtitle">첨부파일</h3>
      
      <div className="file-upload-container">
        {hasFiles ? (
          <div className="file-list">
            {/* 기존 파일 표시 */}
            {existingFiles.map((file) => (
              <div className="file-item" key={file.fileId}>
                <div className="file-info-container">
                  {isImageFile(file.fileName) && file.fileUrl && (
                    <div className="image-preview">
                      <img src={file.fileUrl} alt={file.fileName} />
                    </div>
                  )}
                  <div className="file-info">
                    <div className="file-name">{file.fileName}</div>
                  </div>
                </div>
                <div className="file-actions">
                  <Button 
                    variant="delete" 
                    onClick={() => handleRemoveExistingFile(file.fileId)}
                    label="✕" 
                    style={{ width: 'auto', padding: '0 8px', height: 'auto', boxShadow: 'none', background: 'none', color: '#e74c3c' }}
                  />
                  {isImageFile(file.fileName) && file.fileUrl && (
                    <Button
                      variant="default"
                      onClick={() => handleImagePreview(file.fileUrl)}
                      label="👁️"
                      title="이미지 미리보기"
                      style={{ width: 'auto', padding: '0 8px', height: 'auto', boxShadow: 'none', background: 'none', color: '#17a2b8' }}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* 새 파일 표시 */}
            {selectedFiles.map((file, index) => (
              <div className="file-item" key={`new-${index}`}>
                <div className="file-info-container">
                  {isImageFile(file.name) && (
                    <div className="image-preview">
                      <img src={URL.createObjectURL(file)} alt={file.name} />
                    </div>
                  )}
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <div className="file-actions">
                  <Button 
                    variant="delete" 
                    onClick={() => handleRemoveFile(file.name)}
                    label="✕" 
                    style={{ width: 'auto', padding: '0 8px', height: 'auto', boxShadow: 'none', background: 'none', color: '#e74c3c' }}
                  />
                  {isImageFile(file.name) && (
                    <Button
                      variant="default"
                      onClick={() => handleImagePreview(URL.createObjectURL(file))}
                      label="👁️"
                      title="이미지 미리보기"
                      style={{ width: 'auto', padding: '0 8px', height: 'auto', boxShadow: 'none', background: 'none', color: '#17a2b8' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            className={`file-upload-box ${isDragging ? 'file-upload-dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className="file-input-label">
              <input
                ref={fileInputRef}
                className="file-input"
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
              />
              <div className="upload-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 18V6"
                    stroke="#6c757d"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 11L12 6L17 11"
                    stroke="#6c757d"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 18H4"
                    stroke="#6c757d"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="upload-text">
                파일을 클릭하여 추가하거나
                <br />
                여기에 드래그하세요
              </div>
            </label>
          </div>
        )}

        {hasFiles && (
          <div className="add-more-files-button">
            <label className="file-input-label">
              <input
                className="file-input"
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
              />
              <span>+ 파일 추가</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

FileUploader.propTypes = {
  existingFiles: PropTypes.arrayOf(
    PropTypes.shape({
      fileId: PropTypes.number.isRequired,
      fileName: PropTypes.string.isRequired,
      fileUrl: PropTypes.string
    })
  ),
  onFileSelect: PropTypes.func,
  onFileRemove: PropTypes.func,
  onExistingFileRemove: PropTypes.func
};

FileUploader.defaultProps = {
  existingFiles: [],
  onFileSelect: () => {},
  onFileRemove: () => {},
  onExistingFileRemove: () => {}
};

export default FileUploader; 