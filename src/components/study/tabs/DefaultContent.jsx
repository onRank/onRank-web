import PropTypes from "prop-types";
import StudyContent from "../StudyContent";
import PointContainer from "../ranking/PointContainer";
import Ranking from "../ranking/Ranking";
import RankingList from "../ranking/RankingList";
import MyRank from "../ranking/MyRank";
import { FaCheck } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";

function DefaultContent({ studyData }) {
  const data = studyData.data || studyData;

  const points = [
    {
      title: "과제",
      icon: <FaFileAlt color="#fff" />,
      point: data.memberSubmissionPoint || 0,
    },
    {
      title: "출석",
      icon: <FaCheck color="#fff" />,
      point: data.memberPresentPoint || 0,
      details: {
        출석: data.memberPresentPoint || 0,
        지각: data.memberLatePoint || 0,
        결석: data.memberAbsentPoint || 0,
      },
    },
  ];

  // totalPoint 기준으로 정렬된 랭킹 리스트
  const sortedRankingList = [...(data.memberPointList || [])].sort(
    (a, b) => b.totalPoint - a.totalPoint
  );

  // 내 랭킹 정보 계산
  const myRank = {
    rank:
      sortedRankingList.findIndex(
        (member) => member.memberId === data.memberId
      ) + 1 || 0,
    name:
      sortedRankingList.find((member) => member.memberId === data.memberId)
        ?.studentName || "사용자 정보 없음",
    point:
      sortedRankingList.find((member) => member.memberId === data.memberId)
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
      backgroundColor: "none",
      display: "flex",
      flexDirection: "column",
    },
    main: {
      display: "flex",
      flex: 1,
    },
    content: {
      flex: 1,
      background: "none",
      minHeight: "100vh",
      padding: "40px 0px",
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
                  details={p.details}
                />
              ))}
            </div>

            {/* ② MyRank */}
            <div style={styles.topRight}>
              <MyRank {...myRank} />
            </div>

            {/* ③ Ranking */}
            <div style={styles.bottomLeft}>
              <Ranking
                rankingData={[
                  rankingData.find((r) => r.rank === 2),
                  rankingData.find((r) => r.rank === 1),
                  rankingData.find((r) => r.rank === 3),
                ].filter(Boolean)}
              />
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
  studyData: PropTypes.oneOfType([
    // data 객체 안에 있는 경우
    PropTypes.shape({
      data: PropTypes.shape({
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
    }),
    // 직접 데이터가 있는 경우
    PropTypes.shape({
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
  ]),
};

export default DefaultContent;
