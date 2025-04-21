import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { usePost } from "../../../components/study/post/PostProvider";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebarContainer from "../../../components/common/sidebar/StudySidebarContainer";
import Button from "../../../components/common/Button";
import PostEditForm from "../../../components/study/post/PostEditForm";

function PostDetailManagerContent({ handleBack, onTitleLoaded }) {
  const navigate = useNavigate();
  const { studyId, postId } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const { selectedPost, isLoading, error, getPostById } = usePost();
  const [permissionError, setPermissionError] = useState("");

  // 페이지 로드 시 게시물 데이터 가져오기
  useEffect(() => {
    if (studyId && postId) {
      getPostById(studyId, parseInt(postId, 10));
    }
  }, [studyId, postId, getPostById]);

  // 게시판 제목이 로드되면 부모 컴포넌트에 알림 (편집 모드가 아닐 때만)
  useEffect(() => {
    if (
      selectedPost &&
      selectedPost.postTitle &&
      onTitleLoaded &&
      !isEditMode
    ) {
      onTitleLoaded(selectedPost.postTitle);
    }
  }, [selectedPost, onTitleLoaded, isEditMode]);

  // 편집 모드 전환
  const handleEdit = () => {
    setIsEditMode(true);
    if (selectedPost && onTitleLoaded) {
      onTitleLoaded(`${selectedPost.postTitle} 수정`);
    }
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setPermissionError("");
    if (selectedPost && onTitleLoaded) {
      onTitleLoaded(selectedPost.postTitle);
    }
  };

  // 편집 완료 후 처리 (추가된 함수)
  const handleEditComplete = () => {
    setIsEditMode(false);
    setPermissionError("");
    // 데이터 새로 가져오기
    getPostById(studyId, parseInt(postId, 10));
  };

  // 권한 오류 발생 처리
  const handlePermissionError = (message) => {
    setPermissionError(message);
  };

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!selectedPost) {
    return (
      <div style={{ padding: "24px" }}>
        <div style={{ marginTop: "16px" }}>해당 게시판을 찾을 수 없습니다.</div>
      </div>
    );
  }

  // 스타일 정의
  const styles = {
    container: {
      padding: "0 16px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    date: {
      fontSize: "12px",
      color: "#888",
    },
    contentBox: {
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      minHeight: "313px",
      padding: "16px",
      background: "#fff",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
    },
    attachmentWrapper: {
      marginTop: "12px",
    },
    attachmentTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    attachmentItem: {
      fontSize: "14px",
      marginBottom: "6px",
      color: "#333",
      cursor: "pointer",
    },
    errorMessage: {
      backgroundColor: "#fdecea",
      color: "#e74c3c",
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "16px",
    },
  };

  // 편집 모드일 때 편집 폼 표시
  if (isEditMode) {
    return (
      <>
        {permissionError && (
          <div style={styles.errorMessage}>
            {permissionError}
            <div style={{ marginTop: "8px" }}>
              <Button
                variant="back"
                onClick={handleCancelEdit}
                text="돌아가기"
              />
            </div>
          </div>
        )}
        <PostEditForm
          studyId={studyId}
          postId={postId}
          initialData={selectedPost}
          onCancel={handleCancelEdit}
          onSaveComplete={handleEditComplete}
          onPermissionError={handlePermissionError}
        />
      </>
    );
  }

  // 조회 모드일 때 내용 표시 (이 부분은 원래 코드 유지)
  return (
    <div style={styles.container}>
      <div style={{ fontSize: "12px", color: "#888" }}>
        {new Date(selectedPost.postCreatedAt).toLocaleDateString()}
      </div>
      <div style={styles.contentBox}>
        {selectedPost.postContent || <p>내용이 없습니다.</p>}
      </div>
      {selectedPost.files?.length > 0 && (
        <div style={styles.attachmentWrapper}>
          <div style={styles.attachmentTitle}>첨부 파일</div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {selectedPost.files.map((file) => (
              <li
                key={file.fileId}
                style={styles.attachmentItem}
                onClick={() => window.open(file.fileUrl, "_blank")}
              >
                {file.fileName}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div style={styles.buttonContainer}>
        <Button variant="edit" onClick={handleEdit} />
        <Button variant="back" onClick={handleBack} />
      </div>
    </div>
  );
}

// PropTypes 추가
PostDetailManagerContent.propTypes = {
  handleBack: PropTypes.func.isRequired,
  onTitleLoaded: PropTypes.func,
};

// 기본 props 설정
PostDetailManagerContent.defaultProps = {
  onTitleLoaded: () => {},
};

function PostDetailPage() {
  // 이 부분은 원래 코드 유지
  const { studyId } = useParams();
  const [studyData, setStudyData] = useState({ title: "스터디" });
  const [pageTitle, setPageTitle] = useState("게시판 상세");

  // 스터디 정보 가져오기
  useEffect(() => {
    if (!studyId) return; // studyId가 없으면 실행하지 않음

    const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
    if (cachedStudyDataStr) {
      try {
        const cachedStudyData = JSON.parse(cachedStudyDataStr);
        setStudyData(cachedStudyData);
      } catch (err) {
        console.error("[PostDetailPage] 캐시 데이터 파싱 오류:", err);
      }
    }
  }, [studyId]);

  // 자식 컴포넌트에서 제목을 받아오는 함수
  const updatePageTitle = (title) => {
    setPageTitle(title);
  };

  const styles = {
    wrapper: {
      maxHeight: "100vh",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
      padding: "0 1rem",
    },
    main: {
      display: "flex",
    },
    content: {
      flex: 1,
      padding: "20px 40px",
      maxHeight: "100vh",
      margin: "0 auto",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "24px",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.main}>
        <aside>
          <StudySidebarContainer activeTab="게시판" />
        </aside>
        <main style={styles.content}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <PostDetailManagerContent
            handleBack={() => window.history.back()}
            onTitleLoaded={updatePageTitle}
          />
        </main>
      </div>
    </div>
  );
}

export default PostDetailPage;
