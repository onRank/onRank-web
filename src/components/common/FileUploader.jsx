import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { formatFileSize, getFileIcon, isImageFile, getFilePreviewUrl } from "../../utils/fileUtils";
import Button from "./Button";
import { IoAttach } from "react-icons/io5";
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

  // 파일 첨부 버튼 클릭
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  // 파일 목록 표시
  const renderFileList = () => {
    const allFiles = [
      // 기존 파일 목록
      ...existingFiles.map(file => ({
        id: file.fileId,
        name: file.fileName,
        size: 0, // 기존 파일은 size 정보가 없을 수 있음
        isExisting: true,
        url: file.fileUrl
      })),
      // 새로 선택된 파일 목록
      ...selectedFiles.map(file => ({
        id: null,
        name: file.name,
        size: file.size,
        isExisting: false,
        file: file,
        url: getFilePreviewUrl(file)
      }))
    ];

    if (allFiles.length === 0) return null;

    return (
      <div className="file-list">
        {allFiles.map((file, index) => (
          <div className="file-item" key={index}>
            {isImageFile(file.name) && (
              <div className="image-preview">
                <img src={file.url} alt={file.name} />
              </div>
            )}
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              {file.size > 0 && (
                <span className="file-size">({formatFileSize(file.size)})</span>
              )}
            </div>
            <button 
              className="remove-file-button" 
              onClick={() => file.isExisting 
                ? handleRemoveExistingFile(file.id) 
                : handleRemoveFile(file.name)} 
              type="button"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="file-uploader-container">
      {errorMessage && <div className="file-uploader-error">{errorMessage}</div>}

      <h3 className="section-subtitle">첨부파일</h3>
      
      {/* 파일 목록 */}
      {renderFileList()}
      
      {/* 파일 첨부 버튼 영역 */}
      <div 
        className={`attach-button-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          className="hidden-file-input"
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
        />
        
        <button className="attach-button" type="button" onClick={handleAttachClick}>
          <IoAttach size={18} />
          파일을 끌어서 놓거나
          클릭하여 추가하세요
        </button>
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