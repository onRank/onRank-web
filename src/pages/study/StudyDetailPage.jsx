import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import StudySidebar from "../../components/study/StudySidebar";
import StudyContent from "../../components/study/StudyContent";
import { studyService } from "../../services/api";
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

  // 스터디 데이터 로드
  useEffect(() => {
    // 이미 한 번 데이터 로드를 시도한 경우 중복 실행 방지
    if (dataLoadAttempted.current) return;
    dataLoadAttempted.current = true;

    const fetchStudyData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. localStorage에서 캐시된 스터디 데이터 확인
        const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
        let cachedStudyData = null;

        if (cachedStudyDataStr) {
          try {
            cachedStudyData = JSON.parse(cachedStudyDataStr);
            console.log(
              "[StudyDetailPage] localStorage에서 스터디 데이터 로드:",
              cachedStudyData
            );

            // 캐시된 데이터가 있으면 먼저 화면에 표시
            setStudyData(cachedStudyData);
            setIsLoading(false);
          } catch (err) {
            console.error("[StudyDetailPage] 캐시 데이터 파싱 오류:", err);
            // 캐시 데이터 파싱 실패 시 무시하고 계속 진행
          }
        }

        // 2. 이전 페이지에서 전달받은 스터디 데이터 확인
        const passedStudyData = location.state?.studyData;

        console.log(
          "[StudyDetailPage] 전달받은 스터디 데이터:",
          passedStudyData
        );
        console.log("[StudyDetailPage] URL에서 추출한 studyId:", studyId);

        if (passedStudyData) {
          // 전달받은 데이터가 있으면 사용하고 localStorage에 저장
          setStudyData(passedStudyData);
          localStorage.setItem(
            `study_${studyId}`,
            JSON.stringify(passedStudyData)
          );
          setIsLoading(false);
        }

        // 3. 항상 최신 데이터를 API에서 가져옴 (백그라운드 업데이트)
        try {
          console.log("[StudyDetailPage] API를 통해 최신 스터디 데이터 조회");
          const data = await studyService.getStudyById(studyId);

          if (data) {
            // 백엔드 필드명을 프론트엔드 필드명으로 매핑
            const mappedData = {
              id: data.studyId,
              title: data.studyName || "제목 없음",
              description: data.studyContent || "설명 없음",
              currentMembers: data.members?.length || 0,
              maxMembers: 10,
              status: "모집중",
              imageUrl: data.file && data.file.fileUrl ? data.file.fileUrl : "",
            };

            // localStorage에 최신 데이터 저장
            localStorage.setItem(
              `study_${studyId}`,
              JSON.stringify(mappedData)
            );

            // 이미 표시된 데이터가 없는 경우에만 화면 업데이트
            if (!cachedStudyData && !passedStudyData) {
              setStudyData(mappedData);
            } else {
              // 이미 데이터가 표시된 상태라면 조용히 업데이트
              setStudyData((prev) => ({ ...prev, ...mappedData }));
            }

            setIsLoading(false);
          } else if (!cachedStudyData && !passedStudyData) {
            // 데이터가 없고 캐시된 데이터도 없으면 기본값 설정
            setStudyData({
              title: `스터디 (ID: ${studyId})`,
              description: "스터디 정보를 찾을 수 없습니다.",
            });

            setError("스터디 정보를 찾을 수 없습니다.");
            setIsLoading(false);
          }
        } catch (apiError) {
          console.error("[StudyDetailPage] API 호출 중 오류:", apiError);

          if (!cachedStudyData && !passedStudyData) {
            // 캐시된 데이터가 없는 경우에만 에러 표시
            setStudyData({
              title: `스터디 (ID: ${studyId})`,
              description: "스터디 정보를 불러오는 중 오류가 발생했습니다.",
            });

            setError(
              `스터디 정보를 불러오는 중 오류가 발생했습니다: ${
                apiError.message || "알 수 없는 오류"
              }`
            );
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("[StudyDetailPage] 데이터 로드 중 오류:", error);
        setIsLoading(false);
        setError(
          `데이터 로드 중 오류가 발생했습니다: ${
            error.message || "알 수 없는 오류"
          }`
        );
      }
    };

    fetchStudyData();
  }, [studyId, location.state]);

  // 탭 변경 시에도 스터디 데이터 확인 (새로고침 등으로 초기화 방지)
  useEffect(() => {
    // 탭 변경 시에도 스터디 데이터 확인
    if (activeTab && studyData.title === "로딩 중...") {
      const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
      if (cachedStudyDataStr) {
        try {
          const cachedStudyData = JSON.parse(cachedStudyDataStr);
          setStudyData(cachedStudyData);
        } catch (err) {
          console.error(
            "[StudyDetailPage] 탭 변경 시 캐시 데이터 파싱 오류:",
            err
          );
        }
      }
    }
  }, [activeTab, studyId, studyData.title]);

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
      post: "게시판",
      attendance: "출석",
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

      {/* 오류 메시지 표시 */}
      {error && <ErrorMessage message={error} />}

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
        <StudySidebar activeTab={activeTab} />
        <StudyContent activeTab={activeTab} studyData={studyData} />
      </div>
    </div>
  );
}

export default StudyDetailPage;
