import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { noticeService } from "../../../services/api";
import Button from "../../../components/common/Button";
import StudySidebar from "../../../components/study/StudySidebar";
import { studyService } from "../../../services/api";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";

function NoticeFormPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [studyData, setStudyData] = useState({ title: "로딩 중..." });
  const maxLength = 10000;

  // 스터디 정보 가져오기
  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        const data = await studyService.getStudyById(studyId);
        if (data) {
          setStudyData({
            title: data.studyName || "제목 없음",
          });
        }
      } catch (err) {
        console.error("스터디 정보 로드 오류:", err);
      }
    };

    fetchStudyData();
  }, [studyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await noticeService.createNotice(studyId, { title, content });
      navigate(`/studies/${studyId}/notices`);
    } catch (error) {
      console.error("공지사항 작성 실패:", error);
      setError(error.message || "공지사항 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = () => {
    alert("파일 첨부 기능은 아직 개발 중입니다.");
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
    // sidebar: {
    //   width: "220px",
    //   padding: "16px",
    //   borderRight: "1px solid #eee",
    // },
    content: {
      flex: 1,
      padding: "48px 64px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "32px",
    },
    inputGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "14px",
    },
    textarea: {
      width: "100%",
      minHeight: "200px",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      resize: "none",
      fontSize: "14px",
    },
    charCount: {
      textAlign: "right",
      fontSize: "12px",
      color: "#888",
      marginTop: "4px",
    },
    fileUploadRow: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "8px",
      marginBottom: "32px",
    },
    fileUploadButton: {
      backgroundColor: "#e74c3c",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "6px 12px",
      cursor: "pointer",
      fontSize: "14px",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "24px",
    },
    leftButtons: {
      display: "flex",
      gap: "12px",
    },
    rightButton: {
      backgroundColor: "#eee",
      border: "none",
      borderRadius: "6px",
      padding: "8px 16px",
      cursor: "pointer",
    },
    backButton: {
      backgroundColor: "#eee",
      color: "#000",
      border: "none",
      borderRadius: "6px",
      padding: "8px 16px",
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

  return (
    <div style={styles.wrapper}>
      <div style={styles.main}>
        <aside>
          <div>{studyData.title}</div>
          <StudySidebar activeTab="공지사항" />
        </aside>

        <main style={styles.content}>
          <h1 style={styles.title}>공지사항</h1>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                disabled={isSubmitting}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>내용을 입력해주세요.</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={styles.textarea}
                maxLength={maxLength}
                disabled={isSubmitting}
                placeholder="공지사항 내용을 입력하세요"
              />
              <div style={styles.charCount}>
                {content.length}/{maxLength}
              </div>
            </div>

            <div style={styles.fileUploadRow}>
              <button
                type="button"
                style={styles.fileUploadButton}
                onClick={handleFileUpload}
                disabled={isSubmitting}
              >
                파일 첨부
              </button>
            </div>

            <div style={styles.actionButtons}>
              <div style={styles.leftButtons}>
                <Button
                  type="submit"
                  variant="upload"
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="button"
                onClick={() => navigate(`/studies/${studyId}/notices`)}
                style={styles.backButton}
                variant="back"
                disabled={isSubmitting}
              />
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default NoticeFormPage;
