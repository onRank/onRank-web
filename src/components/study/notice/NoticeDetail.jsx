import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNotice } from "./NoticeProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import ErrorMessage from "../../common/ErrorMessage";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  getFileIcon,
  downloadFile,
  isImageFile,
  formatFileSize,
} from "../../../utils/fileUtils";
import "../../../styles/notice.css";

function NoticeDetail({
  studyId,
  noticeId,
  handleBack,
  handleEdit,
  handleDelete,
}) {
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
    window.open(fileUrl, "_blank");
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
      selectedNotice.files.forEach((file) => {
        allFiles.push({
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize || 0,
          type: "file",
        });
      });
    }

    // 파일 URL 배열 처리
    if (selectedNotice.fileUrls && selectedNotice.fileUrls.length > 0) {
      selectedNotice.fileUrls.forEach((fileUrl, index) => {
        const fileName = fileUrl.split("/").pop() || `file-${index + 1}`;
        allFiles.push({
          fileName: fileName,
          fileUrl: fileUrl,
          fileSize: 0, // 크기 정보 없음
          type: "url",
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
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1rem",
          }}>
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
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1rem",
          }}>
          <Button onClick={handleBack} variant="back" />
        </div>
      </div>
    );
  }

  const files = getAllFiles();
  const hasFiles = files.length > 0;

  // 날짜 포맷 변경 (YYYY.MM.DD)
  const formattedDate = selectedNotice.noticeCreatedAt
    ? new Date(selectedNotice.noticeCreatedAt)
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, ".")
        .replace(/\.$/, "")
    : "";

  console.log("[NoticeDetail] 공지사항 데이터:", selectedNotice);
  console.log("[NoticeDetail] 첨부 파일:", files);

  return (
    <>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          color: `var(--textPrimary)`,
        }}>
        {selectedNotice.noticeTitle}
      </h1>

      <div
        style={{
          fontSize: "14px",
          color: `var(--textSecondary)`,
          marginBottom: "1.5rem",
        }}>
        게시: {formattedDate}
      </div>

      <div
        style={{
          maxWidth: "none",
          color: `var(--textPrimary)`,
          marginBottom: hasFiles ? "1.5rem" : "0",
          border: "1px solid #e4e4e4",
          background: "#fff",
          borderRadius: "12px",
          padding: "15px",
          minHeight: "250px",
        }}>
        {selectedNotice.noticeContent}
      </div>

      {/* 파일 목록 표시 */}
      {hasFiles && (
        <div className="files-container">
          <h3 className="section-subtitle">첨부파일</h3>
          <div className="files-list">
            {files.map((file, index) => (
              <div className="file-download-item" key={index}>
                <div className="file-info-row">
                  <div className="file-icon">{getFileIcon(file.fileName)}</div>
                  <div className="file-details">
                    <div className="file-name">{file.fileName}</div>
                  </div>
                  {isImageFile(file.fileName) && file.fileUrl && (
                    <button
                      className="preview-button"
                      onClick={() => window.open(file.fileUrl, "_blank")}
                      title="이미지 미리보기"
                      type="button">
                      미리보기
                    </button>
                  )}
                  <button
                    className="download-button"
                    onClick={() => downloadFile(file.fileUrl, file.fileName)}
                    type="button">
                    다운로드
                  </button>
                </div>
                {isImageFile(file.fileName) && file.fileUrl && (
                  <div className="image-preview-container">
                    <img
                      className="image-preview-full"
                      src={file.fileUrl}
                      alt={file.fileName}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "1.5rem",
          paddingBottom: "10px",
        }}>
        <Button onClick={handleBack} variant="back" />
      </div>
    </>
  );
}

NoticeDetail.propTypes = {
  studyId: PropTypes.string.isRequired,
  noticeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  handleBack: PropTypes.func.isRequired,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func,
};

export default NoticeDetail;
