import { useParams, useNavigate, Link } from "react-router-dom";
import { PostProvider } from "../../../components/study/post/PostProvider";
import PostForm from "../../../components/study/post/PostForm";
import StudySidebarContainer from "../../../components/common/sidebar/StudySidebarContainer";
import { IoHomeOutline } from "react-icons/io5";
import { useEffect, useState } from "react";

function PostFormPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [studyData, setStudyData] = useState({ title: "스터디" });

  // 스터디 정보 가져오기
  useEffect(() => {
    const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
    if (cachedStudyDataStr) {
      try {
        const cachedStudyData = JSON.parse(cachedStudyDataStr);
        setStudyData(cachedStudyData);
      } catch (err) {
        console.error("[PostFormPage] 캐시 데이터 파싱 오류:", err);
      }
    }
  }, [studyId]);

  // 공지사항 생성/수정 완료 후 호출될 콜백
  const handleFinish = (postId) => {
    // postId가 있으면 상세 페이지로, 없으면 목록 페이지로 이동
    if (postId) {
      console.log(`[PostFormPage] 공지사항 생성 완료, ID=${postId}로 이동`);
      navigate(`/studies/${studyId}/posts/${postId}`);
    } else {
      console.log(`[PostFormPage] 공지사항 ID 없음, 목록으로 이동`);
      navigate(`/studies/${studyId}/posts`);
    }
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
      flex: 1,
    },
    content: {
      flex: 1,
      padding: "20px 40px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    container: {
      display: "flex",
      maxHeight: "100vh",
      overflow: "hidden",
      height: "fit-content",
    },
    activeTab: {
      color: "#FF0000",
      fontWeight: "bold",
      padding: "2px 4px",
    },
    contentArea: {
      display: "flex",
    },
  };

  return (
    <PostProvider>
      <div style={styles.wrapper}>
        <div style={styles.main}>
          <aside>
            <StudySidebarContainer activeTab="게시판" />
          </aside>

          <main style={styles.content}>
            <h1 style={styles.title}>게시판</h1>

            <PostForm
              studyId={studyId}
              post={null}
              mode="create"
              onFinish={handleFinish}
            />
          </main>
        </div>
      </div>
    </PostProvider>
  );
}

export default PostFormPage;
