import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { IoHomeOutline } from "react-icons/io5";
import {
  PostProvider,
  usePost,
} from "../../../components/study/post/PostProvider";
import ErrorMessage from "../../../components/common/ErrorMessage";
import StudySidebar from "../../../components/study/StudySidebar";
import Button from "../../../components/common/Button";
import PostEditForm from "../../../components/study/post/PostEditForm";

function PostDetailManagerContent({ onTitleLoaded }) {
  const { studyId, postId } = useParams();
  const navigate = useNavigate();
  const { selectedPost, isLoading, error, getPostById } = usePost();
  const [isEditMode, setIsEditMode] = useState(false);

  // 컴포넌트 마운트 시 게시판 정보 가져오기
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

  // 닫기 버튼 핸들러 - 게시판 목록으로 이동
  const handleClose = () => {
    navigate(`/studies/${studyId}/posts`);
  };

  // 수정 버튼 핸들러 - URL 변경 대신 수정 모드로 전환
  const handleEdit = () => {
    setIsEditMode(true);
    if (onTitleLoaded) {
      onTitleLoaded("게시판");
    }
  };

  // 수정 취소 및 완료 핸들러
  const handleEditCancel = () => {
    setIsEditMode(false);
    if (selectedPost && onTitleLoaded) {
      onTitleLoaded(selectedPost.postTitle);
    }
  };

  const handleEditComplete = () => {
    // 수정 완료 후 GET API를 다시 호출하여 최신 데이터 가져오기
    getPostById(studyId, parseInt(postId, 10));
    setIsEditMode(false);
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
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
    },
  };

  return (
    <div style={styles.container}>
      {isEditMode ? (
        <PostEditForm
          studyId={studyId}
          postId={postId}
          initialData={selectedPost}
          onCancel={handleEditCancel}
          onSaveComplete={handleEditComplete}
        />
      ) : (
        <>
          <div style={styles.date}>
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
            <Button variant="back" onClick={handleClose} />
          </div>
        </>
      )}
    </div>
  );
}

// PropTypes 추가
PostDetailManagerContent.propTypes = {
  onTitleLoaded: PropTypes.func,
};

// 기본 props 설정
PostDetailManagerContent.defaultProps = {
  onTitleLoaded: () => {},
};

function PostMyDetailPage() {
  const { studyId, postId } = useParams();
  const [studyData, setStudyData] = useState({ title: "스터디" });
  const [pageTitle, setPageTitle] = useState("게시판 상세");

  // 스터디 정보 가져오기
  useEffect(() => {
    const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
    if (cachedStudyDataStr) {
      try {
        const cachedStudyData = JSON.parse(cachedStudyDataStr);
        setStudyData(cachedStudyData);
      } catch (err) {
        console.error("[PostDetailManagerPage] 캐시 데이터 파싱 오류:", err);
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
      marginBottom: "10px",
    },
    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "2rem",
      fontSize: "14px",
      color: "#666666",
      width: "100%",
      maxWidth: "1200px",
      padding: "0 1rem",
    },
    breadcrumbLink: {
      display: "flex",
      alignItems: "center",
      color: "#666666",
      textDecoration: "none",
      transition: "color 0.2s ease",
      padding: "4px 8px",
      borderRadius: "4px",
    },
    activeTab: {
      color: "#FF0000",
      fontWeight: "bold",
      padding: "2px 4px",
    },
    sidebar: {
      padding: "0 1rem",
    },
  };

  return (
    <PostProvider>
      <div style={styles.wrapper}>
        {/* 브레드크럼 (경로 표시) */}
        <div style={styles.breadcrumb}>
          <Link
            to="/"
            style={styles.breadcrumbLink}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F8F9FA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <IoHomeOutline size={16} />
          </Link>
          <span>{">"}</span>
          <Link
            to={`/studies/${studyId}`}
            style={styles.breadcrumbLink}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F8F9FA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {studyData?.title || "스터디"}
          </Link>
          <span>{">"}</span>
          <Link
            to={`/studies/${studyId}/posts`}
            style={styles.breadcrumbLink}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F8F9FA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            게시판
          </Link>
          <span>{">"}</span>
          <span style={styles.activeTab}>{pageTitle}</span>
        </div>
        <div style={styles.main}>
          <aside>
            <StudySidebar style={styles.sidebar} activeTab="게시판" />
          </aside>
          <main style={styles.content}>
            <h1 style={styles.title}>{pageTitle}</h1>
            <PostDetailManagerContent onTitleLoaded={updatePageTitle} />
          </main>
        </div>
      </div>
    </PostProvider>
  );
}

export default PostMyDetailPage;
