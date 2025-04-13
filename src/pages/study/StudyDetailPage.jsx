import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
// import StudySidebarContainer from "../../components/common/sidebar/StudySidebarContainer";
import StudyContent from "../../components/study/StudyContent";
import { studyService } from "../../services/api";
import studyContextService from "../../services/studyContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

function StudyDetailPage() {
  const { studyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("");
  const [studyData, setStudyData] = useState({
    title: "로딩 중...",
    description: "스터디 정보를 불러오는 중입니다.",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 로드 상태 추적을 위한 ref
  const dataLoadAttempted = useRef(false);

  // 스터디 데이터 가져오기
  useEffect(() => {
    const fetchStudyData = async () => {
      if (dataLoadAttempted.current) return;
      dataLoadAttempted.current = true;
      
      setIsLoading(true);
      
      try {
        const data = await studyService.getStudyById(studyId);
        console.log("Fetched study data:", data);
        
        if (data) {
          setStudyData(data);
          
          // 스터디 컨텍스트 정보 업데이트 (없는 경우)
          if (data.memberContext) {
            studyContextService.setStudyContext(studyId, data.memberContext);
          } else if (data.title) {
            // memberContext가 없는 경우 최소한의 정보 저장
            studyContextService.setStudyContext(studyId, {
              studyName: data.title,
              file: null
            });
          }
        }
      } catch (err) {
        console.error("Error fetching study data:", err);
        // 오류 메시지를 표시하지 않고 기본값 유지
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudyData();
  }, [studyId]);

  // URL에서 현재 섹션 가져오기
  useEffect(() => {
    const path = location.pathname;
    const section = path.split("/").pop();

    console.log("Current path:", path);
    console.log("Section:", section);

    // studyId로 끝나는 경우 (기본 화면)
    if (section === studyId) {
      setActiveTab("");
      return;
    }

    const tabMap = {
      notices: "공지사항",
      schedules: "일정",
      assignment: "과제",
      posts: "게시판",
      attendances: "출석",
      management: "관리",
      ranking: "랭킹",
    };

    console.log("Tab mapping:", tabMap[section]);

    if (tabMap[section]) {
      setActiveTab(tabMap[section]);
      console.log("Active tab set to:", tabMap[section]);
    } else {
      console.log("No matching tab for section:", section);
    }
  }, [location.pathname, studyId]);

  // 컴포넌트 언마운트시 데이터 로드 상태 초기화
  useEffect(() => {
    return () => {
      dataLoadAttempted.current = false;
    };
  }, []);

  // 로딩 중 표시
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* 경로 표시 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "2rem",
          fontSize: "14px",
          color: "#666666",
          width: "100%",
          maxWidth: "1200px",
          padding: "0 1rem",
        }}
      >
        <Link
          to="/studies"
          style={{
            display: "flex",
            alignItems: "center",
            color: "#666666",
            textDecoration: "none",
            transition: "color 0.2s ease",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
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
          style={{
            color: activeTab ? "#666666" : "#FF0000",
            textDecoration: "none",
            transition: "color 0.2s ease",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: activeTab ? "normal" : "bold",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F8F9FA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {studyData.title}
        </Link>
        {activeTab && (
          <>
            <span>{">"}</span>
            <span
              style={{
                color: "#FF0000",
                fontWeight: "bold",
                padding: "2px 4px",
              }}
            >
              {activeTab}
            </span>
          </>
        )}
      </div>

      {/* 오류 메시지 표시 - 숨김 처리 */}
      {error && false && <ErrorMessage message={error} />}

      {/* 메인 컨텐츠 */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          width: "100%",
          maxWidth: "1200px",
          position: "relative",
          padding: "0 1rem",
        }}
      >
        <StudySidebarContainer activeTab={activeTab} />
        <StudyContent activeTab={activeTab} studyData={studyData} />
      </div>
    </div>
  );
}

export default StudyDetailPage;
