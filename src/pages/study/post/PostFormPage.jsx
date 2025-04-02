import { useParams, useNavigate } from "react-router-dom";
import { PostProvider } from "../../../components/study/post/PostProvider";
import PostForm from "../../../components/study/post/PostForm";
import StudySidebar from "../../../components/study/StudySidebar";

function PostFormPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();

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
      minHeight: "100vh",
      fontFamily: "sans-serif",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
    },
    main: {
      display: "flex",
      flex: 1,
    },
    content: {
      flex: 1,
      padding: "48px 64px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "32px",
    },
  };

  return (
    <PostProvider>
      <div style={styles.wrapper}>
        <div style={styles.main}>
          <aside>
            <StudySidebar activeTab="게시판" />
          </aside>

          <main style={styles.content}>
            <h1 style={styles.title}>게시판</h1>

            <PostForm studyId={studyId} mode="create" onFinish={handleFinish} />
          </main>
        </div>
      </div>
    </PostProvider>
  );
}

export default PostFormPage;
