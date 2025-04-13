import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ScheduleContainer } from "../../pages/study/schedule";
import AssignmentTab from "./tabs/AssignmentTab";
import DefaultContent from "./tabs/DefaultContent";
import ManagementContainer from "../../pages/study/management/ManagementContainer";
import NoticeTab from "./tabs/NoticeTab";
import BoardTab from "./tabs/BoardTab";
import RankingTab from "./tabs/RankingTab";
import AttendanceContainer from "../../pages/study/attendance/AttendanceContainer";
import StudySidebarContainer from "../common/sidebar/StudySidebarContainer";

function StudyContent({ activeTab, studyData }) {
  const [assignments, setAssignments] = useState([]);
  const { studyId } = useParams();
  const location = useLocation();
  const [currentSubPage, setCurrentSubPage] = useState(null);

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

  useEffect(() => {
    setCurrentSubPage(null);
  }, [activeTab]);

  const handleSubPageChange = (subPageName) => {
    setCurrentSubPage(subPageName);
  };

  const renderContent = () => {
    console.log("[StudyContent] renderContent 호출, activeTab:", activeTab);
    
    switch (activeTab) {
      case "일정":
        console.log("[StudyContent] 일정 탭 렌더링");
        return <ScheduleContainer onSubPageChange={handleSubPageChange} />;
      case "과제":
        console.log("[StudyContent] 과제 탭 렌더링");
        return <AssignmentTab assignments={assignments} studyId={studyId} />;
      case "공지사항":
        console.log("[StudyContent] 공지사항 탭 렌더링");
        return <NoticeTab />;
      case "게시판":
        console.log("[StudyContent] 게시판 탭 렌더링");
        return <BoardTab />;
      case "출석":
        console.log("[StudyContent] 출석 탭 렌더링, AttendanceContainer 반환");
        return <AttendanceContainer />;
      case "관리":
        console.log("[StudyContent] 관리 탭 렌더링");
        return <ManagementContainer />;
      case "랭킹":
        console.log("[StudyContent] 랭킹 탭 렌더링");
        return <RankingTab />;
      default:
        console.log("[StudyContent] 기본 컨텐츠 렌더링");
        return <DefaultContent studyData={studyData} />;
    }
  };

  return (
    <div
      className="study-content-wrapper"
      style={{
        display: "flex",
        gap: "2rem",
        width: "100%",
        maxWidth: "1200px",
        position: "relative",
        padding: "0 1rem",
        minHeight: "calc(100vh - 120px)",
        alignItems: "flex-start"
      }}
    >
      <StudySidebarContainer activeTab={activeTab} subPage={currentSubPage} />
      <div
        className="study-main-content"
        style={{
          flex: 1,
          padding: '0',
          minHeight: "500px"
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

StudyContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  studyData: PropTypes.object,
};

export default StudyContent;
