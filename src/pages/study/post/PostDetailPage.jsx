import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { usePost } from "../../../components/study/post/PostProvider";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebarContainer from "../../../components/common/sidebar/StudySidebarContainer";
import Button from "../../../components/common/Button";

function PostDetailManagerContent({ handleBack, onTitleLoaded }) {
  const navigate = useNavigate();
  const { studyId, postId } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const { selectedPost, isLoading, error, getPostById, deletePost } = usePost();
  const [permissionError, setPermissionError] = useState("");

  // 페이지 로드 시 게시물 데이터 가져오기
  useEffect(() => {
    if (studyId && postId) {
      getPostById(studyId, parseInt(postId, 10));
    }
  }, [studyId, postId, getPostById]);

  // 게시판 제목이 로드되면 부모 컴포넌트에 알림
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

  // 조회 모드일 때 내용 표시
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
        <Button variant="back" onClick={handleBack} />
      </div>
    </div>
  );
}

PostDetailManagerContent.propTypes = {
  handleBack: PropTypes.func.isRequired,
  onTitleLoaded: PropTypes.func,
};

PostDetailManagerContent.defaultProps = {
  onTitleLoaded: () => {},
};

function PostDetailPage() {
  const { studyId } = useParams();
  const [studyData, setStudyData] = useState({ title: "스터디" });
  const [pageTitle, setPageTitle] = useState("게시판 상세");
  const navigate = useNavigate();

  // 스터디 정보 가져오기
  useEffect(() => {
    if (!studyId) return;

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

  // 목록으로 돌아가기
  const handleBack = () => {
    navigate(`/studies/${studyId}/posts`);
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
            handleBack={handleBack}
            onTitleLoaded={updatePageTitle}
          />
        </main>
      </div>
    </div>
  );
}

export default PostDetailPage;
