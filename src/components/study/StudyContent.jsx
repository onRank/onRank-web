import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScheduleContainer } from "../../pages/study/schedule";
import AssignmentTab from "./tabs/AssignmentTab";
import DefaultContent from "./tabs/DefaultContent";
import ManagementTab from "./tabs/ManagementTab";
import AttendanceTab from "./tabs/AttendanceTab";
import NoticeTab from "./tabs/NoticeTab";
import BoardTab from "./tabs/BoardTab";
import RankingTab from "./tabs/RankingTab";

function StudyContent({ activeTab, studyData }) {
  const [assignments, setAssignments] = useState([]);
  const { studyId } = useParams();

  useEffect(() => {
    if (activeTab === "과제") {
      // TODO: API 연동 후 과제 목록 불러오기
      setAssignments([
        {
          id: 1,
          title: "[기말 프로젝트]",
          dueDate: "2025.3.2",
          status: "진행중",
        },
        {
          id: 2,
          title: "[중간 프로젝트]",
          dueDate: "2025.2.1",
          status: "완료",
          score: "10/10",
        },
      ]);
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "일정":
        return <ScheduleContainer />;
      case "과제":
        return <AssignmentTab assignments={assignments} studyId={studyId} />;
      case "공지사항":
        return <NoticeTab />;
      case "게시판":
        return <BoardTab />;
      case "출석":
        return <AttendanceContainer />;
      case "관리":
        return <ManagementTab studyData={studyData} />;
      case "랭킹":
        return <RankingTab />;
      default:
        return <DefaultContent studyData={studyData} />;
    }
  };

  return (
    <div 
      className="study-content" 
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0'
      }}
    >
      {renderContent()}
    </div>
  );
}

StudyContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  studyData: PropTypes.object,
};

export default StudyContent;
