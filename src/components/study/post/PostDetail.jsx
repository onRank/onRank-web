import PropTypes from "prop-types";
import { useEffect } from "react";
import { usePost } from "./PostProvider";
import LoadingSpinner from "../../common/LoadingSpinner";
import { formatDate } from "../../../utils/dateUtils";
import ErrorMessage from "../../common/ErrorMessage";
import Button from "../../common/Button";
import { useTheme } from "../../../contexts/ThemeContext";
import { getFileIcon, downloadFile, isImageFile } from "../../../utils/fileUtils";

function PostDetail({ studyId, postId, handleBack, handleEdit, handleDelete }) {
  const { selectedPost, isLoading, error, getPostById } = usePost();
  const { colors } = useTheme(); // eslint-disable-line no-unused-vars

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

  if (!selectedPost) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <ErrorMessage message="게시글 데이터를 찾을 수 없습니다." type="warning" />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Button onClick={handleBack} variant="back" />
        </div>
      </div>
    );
  }

  // 필드명 일관성을 위해 가져올 수 있는 모든 필드를 확인
  const title = selectedPost.postTitle || selectedPost.title || "제목 없음";
  const content = selectedPost.postContent || selectedPost.content || "내용 없음";
  const createdAt = selectedPost.postCreatedAt || selectedPost.createdAt || new Date().toISOString();
  
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
          {title}
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
          <span>{formatDate(createdAt)}</span>
        </div>
        <div
          style={{
            maxWidth: "none",
            color: `var(--textPrimary)`,
            marginBottom: "1.5rem",
          }}
        >
          {content}
        </div>
        
        {/* 파일 목록 표시 */}
        {(files.length > 0 || fileUrls.length > 0 || memberContextFile) && (
          <div className="post-file-list">
            <div className="post-attachment-title">첨부 파일</div>
            
            {/* 일반 파일 배열 처리 */}
            {files.map((file, index) => (
              <div 
                key={`file-${index}`} 
                className="post-file-item"
                onClick={() => handleFileDownload(file.fileUrl, file.fileName)}
                style={{ cursor: "pointer" }}
              >
                <span className="post-file-icon">{getFileIcon(file.fileName)}</span>
                <span>{file.fileName}</span>
              </div>
            ))}
            
            {/* 파일 URL 배열 처리 */}
            {fileUrls.map((fileUrl, index) => {
              const fileName = fileUrl.split('/').pop() || `file-${index + 1}`;
              return (
                <div 
                  key={`url-${index}`} 
                  className="post-file-item"
                  onClick={() => handleFileDownload(fileUrl, fileName)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="post-file-icon">{getFileIcon(fileName)}</span>
                  <span>{fileName}</span>
                </div>
              );
            })}
            
            {/* memberContext 파일 처리 */}
            {memberContextFile && memberContextFile.fileUrl && (
              <div 
                className="post-file-item"
                onClick={() => handleFileDownload(memberContextFile.fileUrl, memberContextFile.fileName)}
                style={{ cursor: "pointer" }}
              >
                <span className="post-file-icon">{getFileIcon(memberContextFile.fileName)}</span>
                <span>{memberContextFile.fileName}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
        {handleEdit && (
          <Button onClick={() => handleEdit(postId)} variant="edit" style={{ width: "84px", height: "36px" }} />
        )}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {handleDelete && (
            <Button onClick={() => handleDelete(postId)} variant="delete" style={{ width: "84px", height: "36px" }} />
          )}
          <Button onClick={handleBack} variant="back" style={{ width: "84px", height: "36px" }} />
        </div>
      </div>
    </div>
  );
}

PostDetail.propTypes = {
  studyId: PropTypes.string.isRequired,
  postId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  handleBack: PropTypes.func.isRequired,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func
};

export default PostDetail;
