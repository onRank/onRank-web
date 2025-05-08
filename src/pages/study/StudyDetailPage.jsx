import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
// import StudySidebarContainer from "../../components/common/sidebar/StudySidebarContainer";
import StudyContent from "../../components/study/StudyContent";
import { studyService } from "../../services/api";
import studyContextService from "../../services/studyContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import Ranking from "../../components/study/ranking/Ranking";
import RankingList from "../../components/study/ranking/RankingList";
import PointContainer from "../../components/study/ranking/PointContainer";
import MyRank from "../../components/study/ranking/MyRank";

function StudyDetailPage({ activeTab: propActiveTab }) {
  const { studyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(propActiveTab || "");
  const [studyData, setStudyData] = useState({
    studyId: null,
    memberId: null,
    memberSubmissionPoint: 0,
    memberPresentPoint: 0,
    memberLatePoint: 0,
    memberAbsentPoint: 0,
    memberPointList: [],
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
            console.log(
              "[디버깅] StudyDetailPage에서 memberContext 확인:",
              data.memberContext
            );
            studyContextService.setStudyContext(studyId, data.memberContext);
          } else if (data.title) {
            // memberContext가 없는 경우 최소한의 정보 저장
            console.log("[디버깅] memberContext 없음, 기본 정보만 저장");
            studyContextService.setStudyContext(studyId, {
              studyName: data.title,
              file: null,
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
    // props로 activeTab이 전달된 경우 사용
    if (propActiveTab) {
      setActiveTab(propActiveTab);
      return;
    }

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
  }, [location.pathname, studyId, propActiveTab]);

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

  const points = [
    {
      title: "과제",
      icon: "📝",
      point: studyData.memberSubmissionPoint || 0,
    },
    {
      title: "출석",
      icon: "✅",
      point: studyData.memberPresentPoint || 0,
    },
    {
      title: "지각",
      icon: "⏰",
      point: studyData.memberLatePoint || 0,
    },
    {
      title: "결석",
      icon: "❌",
      point: studyData.memberAbsentPoint || 0,
    },
  ];

  // totalPoint 기준으로 정렬된 랭킹 리스트
  const sortedRankingList = [...(studyData.memberPointList || [])].sort(
    (a, b) => b.totalPoint - a.totalPoint
  );

  // 내 랭킹 정보 계산
  const myRank = {
    rank:
      sortedRankingList.findIndex(
        (member) => member.memberId === studyData.memberId
      ) + 1 || 0,
    name:
      sortedRankingList.find((member) => member.memberId === studyData.memberId)
        ?.studentName || "나",
    point:
      sortedRankingList.find((member) => member.memberId === studyData.memberId)
        ?.totalPoint || 0,
  };

  // 상위 3명의 랭킹 데이터
  const rankingData = sortedRankingList.slice(0, 3).map((member, index) => ({
    rank: index + 1,
    name: member.studentName,
    point: member.totalPoint,
  }));

  // 전체 랭킹 리스트
  const rankingList = sortedRankingList.map((member, index) => ({
    rank: index + 1,
    name: member.studentName,
    point: member.totalPoint,
  }));

  const styles = {
    wrapper: {
      minHeight: "100vh",
      fontFamily: "sans-serif",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
    },
    main: {
      display: "flex",
      flex: 1,
    },
    sidebar: {
      width: "200px",
      padding: "16px",
      borderRight: "1px solid #e5e5e5",
    },
    content: {
      flex: 1,
      background: "none",
      minHeight: "100vh",
      padding: "40px 60px",
      boxSizing: "border-box",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "auto auto",
      gap: "32px 40px",
    },
    topLeft: {
      display: "flex",
      gap: "20px",
      justifyContent: "center",
    },
    topRight: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    bottomLeft: {
      display: "flex",
      justifyContent: "center",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.main}>
        <div style={styles.content}>
          <div style={styles.grid}>
            {/* ① PointContainer */}
            <div style={styles.topLeft}>
              {points.map((p, i) => (
                <PointContainer
                  key={i}
                  title={p.title}
                  icon={p.icon}
                  point={p.point}
                />
              ))}
            </div>

            {/* ② MyRank */}
            <div style={styles.topRight}>
              <MyRank {...myRank} />
            </div>

            {/* ③ Ranking */}
            <div style={styles.bottomLeft}>
              <Ranking rankingData={rankingData} />
            </div>

            {/* ④ RankingList */}
            <div style={styles.bottomRight}>
              <RankingList rankingList={rankingList} />
            </div>
          </div>
        </div>
        <StudyContent activeTab={activeTab} studyData={studyData} />
      </div>
    </div>
  );
}

export default StudyDetailPage;
