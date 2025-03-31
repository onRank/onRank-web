import { useParams, useNavigate } from "react-router-dom";
import { NoticeProvider } from "../../../components/study/notice/NoticeProvider";
import NoticeForm from "../../../components/study/notice/NoticeForm";
import StudySidebar from "../../../components/study/StudySidebar";

function NoticeFormPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  // 공지사항 생성/수정 완료 후 호출될 콜백
  const handleFinish = (noticeId) => {
    // noticeId가 있으면 상세 페이지로, 없으면 목록 페이지로 이동
    if (noticeId) {
      console.log(`[NoticeFormPage] 공지사항 생성 완료, ID=${noticeId}로 이동`);
      navigate(`/studies/${studyId}/notices/${noticeId}`);
    } else {
      console.log(`[NoticeFormPage] 공지사항 ID 없음, 목록으로 이동`);
      navigate(`/studies/${studyId}/notices`);
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
    <NoticeProvider>
      <div style={styles.wrapper}>
        <div style={styles.main}>
          <aside>
            <StudySidebar activeTab="공지사항" />
          </aside>

          <main style={styles.content}>
            <h1 style={styles.title}>공지사항</h1>

            {/* NoticeForm 컴포넌트 사용 */}
            <NoticeForm
              studyId={studyId}
              mode="create"
              onFinish={handleFinish}
            />
          </main>
        </div>
      </div>
    </NoticeProvider>
  );
}

export default NoticeFormPage;
