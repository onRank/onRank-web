import PropTypes from "prop-types";
import { useEffect } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import ErrorMessage from "../../common/ErrorMessage";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";
import { getFileIcon, downloadFile, isImageFile } from "../../../utils/fileUtils";
import "../../../styles/notice.css";

function NoticeDetail({ studyId, noticeId, handleBack, handleEdit, handleDelete }) {
  const { selectedNotice, isLoading, error, getNoticeById } = useNotice();
  const { colors } = useTheme();

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

  // 파일 다운로드 핸들러
  const handleFileDownload = (fileUrl, fileName) => {
    if (!fileUrl) return;
    console.log(`[NoticeDetail] 파일 다운로드 요청: ${fileName} (${fileUrl})`);
    downloadFile(fileUrl, fileName);
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

  // 파일 정보 처리 - API 응답 구조 처리
  const files = selectedNotice.files || [];
  const fileUrls = selectedNotice.fileUrls || [];
  const hasFiles = files.length > 0 || fileUrls.length > 0;

  console.log("[NoticeDetail] 공지사항 데이터:", selectedNotice);
  console.log("[NoticeDetail] 첨부 파일:", { files, fileUrls });

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
        
        {/* 파일 목록 표시 */}
        {hasFiles && (
          <div className="notice-file-list">
            <div className="notice-attachment-title">첨부 파일</div>
            
            {/* 일반 파일 배열 처리 */}
            {files.map((file, index) => (
              <div 
                key={`file-${index}`} 
                className="notice-file-item"
                onClick={() => handleFileDownload(file.fileUrl, file.fileName)}
                style={{ cursor: "pointer" }}
              >
                <span className="notice-file-icon">{getFileIcon(file.fileName)}</span>
                <span>{file.fileName}</span>
              </div>
            ))}
            
            {/* 파일 URL 배열 처리 */}
            {fileUrls.map((fileUrl, index) => {
              const fileName = fileUrl.split('/').pop() || `file-${index + 1}`;
              return (
                <div 
                  key={`url-${index}`} 
                  className="notice-file-item"
                  onClick={() => handleFileDownload(fileUrl, fileName)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="notice-file-icon">{getFileIcon(fileName)}</span>
                  <span>{fileName}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
        {handleEdit && (
          <Button onClick={() => handleEdit(noticeId)} variant="edit" style={{ width: "84px", height: "36px" }} />
        )}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {handleDelete && (
            <Button onClick={() => handleDelete(noticeId)} variant="delete" style={{ width: "84px", height: "36px" }} />
          )}
          <Button onClick={handleBack} variant="back" style={{ width: "84px", height: "36px" }} />
        </div>
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
