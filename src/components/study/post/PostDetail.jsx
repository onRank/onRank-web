import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { usePost } from "./PostProvider";
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

function PostDetail({ studyId, postId, handleBack }) {
  const { selectedPost, isLoading, error, getPostById } = usePost();
  const { colors } = useTheme(); // eslint-disable-line no-unused-vars
  const [expandedImageIndex, setExpandedImageIndex] = useState(null);

  useEffect(() => {
    if (!selectedPost || selectedPost.postId !== parseInt(postId, 10)) {
      console.log("[PostDetail] 게시글 상세 요청:", postId);
      getPostById(studyId, postId);
    } else {
      console.log(
        "[PostDetail] 이미 선택된 게시글과 동일하여 요청 생략:",
        postId
      );
    }
  }, [studyId, postId, getPostById, selectedPost]);

  // 이미지 미리보기 핸들러
  const handleImagePreview = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  // 이미지 확장/축소 핸들러
  const toggleImageExpand = (index) => {
    setExpandedImageIndex(expandedImageIndex === index ? null : index);
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

  if (!selectedPost) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <ErrorMessage
          message="게시글 데이터를 찾을 수 없습니다."
          type="warning"
        />
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

  // 필드명 일관성을 위해 가져올 수 있는 모든 필드를 확인
  const title = selectedPost.postTitle || selectedPost.title || "제목 없음";
  const content =
    selectedPost.postContent || selectedPost.content || "내용 없음";
  const createdAt =
    selectedPost.postCreatedAt ||
    selectedPost.createdAt ||
    new Date().toISOString();

  // 날짜 포맷 변경 (YYYY.MM.DD)
  const formattedDate = createdAt
    ? new Date(createdAt)
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, ".")
        .replace(/\.$/, "")
    : "";

  // 파일 정보 확인 - API 응답 구조 처리
  const files = selectedPost.files || [];
  const fileUrls = selectedPost.fileUrls || [];

  // memberContext에서 파일 정보 확인
  const memberContext = selectedPost.memberContext || {};
  const memberContextFile = memberContext.file || null;

  // 파일 다운로드 핸들러
  const handleFileDownload = (fileUrl, fileName) => {
    if (!fileUrl) return;
    console.log(`[PostDetail] 파일 다운로드 요청: ${fileName} (${fileUrl})`);
    downloadFile(fileUrl, fileName);
  };

  console.log("[PostDetail] 게시글 데이터:", selectedPost);

  // 모든 파일들을 통합하여 처리
  const getAllFiles = () => {
    const allFiles = [];

    // 일반 파일 배열 처리
    if (selectedPost.files && selectedPost.files.length > 0) {
      selectedPost.files.forEach((file) => {
        allFiles.push({
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize || 0,
          type: "file",
        });
      });
    }

    // 파일 URL 배열 처리
    if (selectedPost.fileUrls && selectedPost.fileUrls.length > 0) {
      selectedPost.fileUrls.forEach((fileUrl, index) => {
        const fileName = fileUrl.split("/").pop() || `file-${index + 1}`;
        allFiles.push({
          fileName: fileName,
          fileUrl: fileUrl,
          fileSize: 0, // 크기 정보 없음
          type: "url",
        });
      });
    }

    // memberContext 파일 처리
    if (selectedPost.memberContext && selectedPost.memberContext.file) {
      const memberFile = selectedPost.memberContext.file;
      allFiles.push({
        fileName: memberFile.fileName,
        fileUrl: memberFile.fileUrl,
        fileSize: memberFile.fileSize || 0,
        type: "member",
      });
    }

    return allFiles;
  };

  const allFiles = getAllFiles();
  const hasFiles = allFiles.length > 0;

  return (
    <>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          color: `var(--textPrimary)`,
        }}>
        {title}
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
        {content}
      </div>

      {/* 파일 목록 표시 */}
      {hasFiles && (
        <div className="files-container">
          <h3 className="section-subtitle">첨부파일</h3>
          <div className="files-list">
            {allFiles.map((file, index) => (
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

PostDetail.propTypes = {
  studyId: PropTypes.string.isRequired,
  postId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default PostDetail;
