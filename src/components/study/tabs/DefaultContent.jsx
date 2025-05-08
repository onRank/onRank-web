import PropTypes from "prop-types";
import StudyContent from "../StudyContent";
import PointContainer from "../ranking/PointContainer";
import Ranking from "../ranking/Ranking";
import RankingList from "../ranking/RankingList";
import MyRank from "../ranking/MyRank";

function DefaultContent({ studyData }) {
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
            <RankingList rankingList={rankingList} />
          </div>
        </div>
      </div>
    </div>
  );
}

DefaultContent.propTypes = {
  studyData: PropTypes.shape({
    studyId: PropTypes.number,
    memberId: PropTypes.number,
    memberSubmissionPoint: PropTypes.number,
    memberPresentPoint: PropTypes.number,
    memberLatePoint: PropTypes.number,
    memberAbsentPoint: PropTypes.number,
    memberPointList: PropTypes.arrayOf(
      PropTypes.shape({
        studentName: PropTypes.string,
        memberId: PropTypes.number,
        totalPoint: PropTypes.number,
      })
    ),
  }),
};

export default DefaultContent;
