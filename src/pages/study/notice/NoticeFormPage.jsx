import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { noticeService } from "../../../services/api";
import Button from "../../../components/common/Button";
import StudySidebar from "../../../components/study/StudySidebar";

function NoticeFormPage(onSuccess, onError) {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [studyData, setStudyData] = useState({ title: " " });
  const [fileNames, setFileNames] = useState([]); // 파일 이름 배열 (실제 파일 업로드는 아직 구현하지 않음)
  const maxLength = 10000;

  // 컴포넌트 마운트 시 스터디 정보 가져오기 - API 요청 부분 주석 처리
  /* 
  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        console.log(`[NoticeFormPage] 스터디 정보 조회 요청: ${studyId}`);
        const response = await studyService.getStudyById(studyId);

        // 응답에서 스터디 이름 추출
        if (response && response.studyName) {
          setStudyData({
            title: response.studyName,
            content: response.studyContent || "",
            id: response.studyId,
          });
          console.log(`[NoticeFormPage] 스터디 정보 조회 성공:`, response);
        } else {
          console.warn(`[NoticeFormPage] 스터디 정보가 비어있음`);
          setStudyData({ title: "스터디 정보 없음" });
        }
      } catch (error) {
        console.error(`[NoticeFormPage] 스터디 정보 조회 오류:`, error);
        setStudyData({ title: "정보 조회 실패" });
      }
    };

    if (studyId) {
      fetchStudyData();
    }
  }, [studyId]);
  */

  const handleCreateNotice = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!noticeTitle.trim()) {
      setError("공지사항 제목을 입력해주세요.");
      if (onError) onError("공지사항 제목을 입력해주세요.");
      return;
    }
    if (!noticeContent.trim()) {
      setError("공지사항 내용을 입력해주세요.");
      if (onError) onError("공지사항 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 공지사항 생성 요청 데이터
      const noticeData = {
        noticeTitle,
        noticeContent,
        fileNames: fileNames, // 파일 이름 배열 (실제 파일 업로드는 구현하지 않음)
      };

      console.log(`[NoticeFormPage] 공지사항 생성 요청:`, noticeData);

      // API 호출
      const response = await noticeService.createNotice(studyId, noticeData);

      console.log(`[NoticeFormPage] 공지사항 생성 응답:`, response);

      if (response.success) {
        // 성공 시 공지사항 목록 페이지로 이동
        navigate(`/studies/${studyId}/notices`);
        if (onSuccess) onSuccess(response.data);
      } else {
        // 오류 발생 시 오류 메시지 표시
        setError(response.message || "공지사항 작성에 실패했습니다.");
        if (onError)
          onError(response.message || "공지사항 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 작성 실패:", error);
      setError(error.message || "공지사항 작성에 실패했습니다.");
      if (onError) onError(error.message || "공지사항 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = () => {
    alert("파일 첨부 기능은 아직 개발 중입니다.");
    // 실제 파일 업로드는 구현하지 않고, 가상의 파일명만 추가
    const mockFileName = `파일${fileNames.length + 1}.pdf`;
    setFileNames([...fileNames, mockFileName]);
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
    fileList: {
      marginTop: "8px",
      padding: "8px 12px",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      fontSize: "14px",
    },
    fileItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "4px",
    },
    fileIcon: {
      marginRight: "8px",
      color: "#666",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.main}>
        <aside>
          <StudySidebar activeTab="공지사항" />
        </aside>

        <main style={styles.content}>
          <h1 style={styles.title}>공지사항</h1>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleCreateNotice}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>제목</label>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                style={styles.input}
                disabled={isSubmitting}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>내용을 입력해주세요.</label>
              <textarea
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                style={styles.textarea}
                maxLength={maxLength}
                disabled={isSubmitting}
                placeholder="공지사항 내용을 입력하세요"
              />
              <div style={styles.charCount}>
                {noticeContent.length}/{maxLength}
              </div>
            </div>

            {/* 가상의 파일 목록 표시 (실제 파일 업로드는 구현하지 않음) */}
            {fileNames.length > 0 && (
              <div style={styles.fileList}>
                {fileNames.map((fileName, index) => (
                  <div key={index} style={styles.fileItem}>
                    <span style={styles.fileIcon}>📎</span>
                    {fileName}
                  </div>
                ))}
              </div>
            )}

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
