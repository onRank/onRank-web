import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import ErrorMessage from "../../common/ErrorMessage";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";
import { getFileIcon, downloadFile, isImageFile, formatFileSize } from "../../../utils/fileUtils";
import "../../../styles/notice.css";

function NoticeDetail({ studyId, noticeId, handleBack, handleEdit, handleDelete }) {
  const { selectedNotice, isLoading, error, getNoticeById } = useNotice();
  const { colors } = useTheme();
  const [expandedImageIndex, setExpandedImageIndex] = useState(null);

  useEffect(() => {
    if (!selectedNotice || selectedNotice.noticeId !== parseInt(noticeId, 10)) {
      console.log("[NoticeDetail] 공지사항 상세 요청:", noticeId);
      getNoticeById(studyId, noticeId);
    } else {
      console.log(
        "[NoticeDetail] 이미 선택된 공지사항과 동일하여 요청 생략:",
        noticeId
      );
    }
  }, [studyId, noticeId, getNoticeById, selectedNotice]);

  // 이미지 미리보기 핸들러
  const handleImagePreview = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  // 이미지 확장/축소 핸들러
  const toggleImageExpand = (index) => {
    setExpandedImageIndex(expandedImageIndex === index ? null : index);
  };

  // 파일 다운로드 핸들러
  const handleFileDownload = (fileUrl, fileName) => {
    if (!fileUrl) return;
    console.log(`[NoticeDetail] 파일 다운로드 요청: ${fileName} (${fileUrl})`);
    downloadFile(fileUrl, fileName);
  };

  // 모든 파일들을 통합하여 처리
  const getAllFiles = () => {
    if (!selectedNotice) return [];
    
    const allFiles = [];
    
    // 일반 파일 배열 처리
    if (selectedNotice.files && selectedNotice.files.length > 0) {
      selectedNotice.files.forEach(file => {
        allFiles.push({
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize || 0,
          type: 'file'
        });
      });
    }
    
    // 파일 URL 배열 처리
    if (selectedNotice.fileUrls && selectedNotice.fileUrls.length > 0) {
      selectedNotice.fileUrls.forEach((fileUrl, index) => {
        const fileName = fileUrl.split('/').pop() || `file-${index + 1}`;
        allFiles.push({
          fileName: fileName,
          fileUrl: fileUrl,
          fileSize: 0, // 크기 정보 없음
          type: 'url'
        });
      });
    }
    
    return allFiles;
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <ErrorMessage message={error} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Button onClick={handleBack} variant="back" />
        </div>
      </div>
    );
  }

  if (
    !selectedNotice ||
    !selectedNotice.noticeTitle ||
    !selectedNotice.noticeContent
  ) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <ErrorMessage message="잘못된 공지사항 데이터입니다." type="warning" />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Button onClick={handleBack} variant="back" />
        </div>
      </div>
    );
  }

  const files = getAllFiles();
  const hasFiles = files.length > 0;

  console.log("[NoticeDetail] 공지사항 데이터:", selectedNotice);
  console.log("[NoticeDetail] 첨부 파일:", files);

  return (
    <div style={{ padding: "1.5rem" }}>
      <div
        style={{
          border: `1px solid var(--border)`,
          borderRadius: "0.5rem",
          padding: "1.5rem",
          backgroundColor: `var(--cardBackground)`,
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: `var(--textPrimary)`,
          }}
        >
          {selectedNotice.noticeTitle}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: `var(--textSecondary)`,
            marginBottom: "1.5rem",
          }}
        >
          <span style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>•</span>
          <span>{formatDate(selectedNotice.noticeCreatedAt)}</span>
        </div>
        <div
          style={{
            maxWidth: "none",
            color: `var(--textPrimary)`,
            marginBottom: hasFiles ? "1.5rem" : "0"
          }}
        >
          {selectedNotice.noticeContent}
        </div>
        
        {/* 파일 목록 표시 - 향상된 UI */}
        {hasFiles && (
          <div className="notice-file-list">
            <div className="notice-attachment-title">첨부 파일</div>
            
            {files.map((file, index) => (
              <div key={`file-${index}`} className="notice-file-item">
                <div className="notice-file-info-row">
                  {isImageFile(file.fileName) && (
                    <div className="notice-image-preview">
                      <img src={file.fileUrl} alt={file.fileName} />
                    </div>
                  )}
                  <div className="notice-file-icon">{getFileIcon(file.fileName)}</div>
                  <div className="notice-file-info">
                    <div className="notice-file-name">{file.fileName}</div>
                    {file.fileSize > 0 && (
                      <div className="notice-file-size">{formatFileSize(file.fileSize)}</div>
                    )}
                  </div>
                  
                  <div className="notice-file-actions">
                    {isImageFile(file.fileName) && (
                      <button 
                        className="notice-preview-button"
                        onClick={() => handleImagePreview(file.fileUrl)}
                        type="button"
                      >
                        미리보기
                      </button>
                    )}
                    <button
                      className="notice-download-button"
                      onClick={() => handleFileDownload(file.fileUrl, file.fileName)}
                      type="button"
                    >
                      다운로드
                    </button>
                  </div>
                </div>
                
                {/* 확장된 이미지 미리보기 */}
                {isImageFile(file.fileName) && expandedImageIndex === index && (
                  <div className="notice-image-preview-container">
                    <img 
                      className="notice-image-preview-full" 
                      src={file.fileUrl} 
                      alt={file.fileName} 
                      onClick={() => toggleImageExpand(index)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
        <Button onClick={handleBack} variant="back" style={{ width: "84px", height: "36px" }} />
      </div>
    </div>
  );
}

NoticeDetail.propTypes = {
  studyId: PropTypes.string.isRequired,
  noticeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  handleBack: PropTypes.func.isRequired,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func
};

export default NoticeDetail;
