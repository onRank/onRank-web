import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ScheduleContainer } from "../../pages/study/schedule";
import { 
  AssignmentList, 
  AssignmentCreate, 
  AssignmentDetail,
  SubmissionList,
  SubmissionDetail
} from "../../pages/study/assignment";
import AssignmentEdit from "../../pages/study/assignment/AssignmentEdit";
import DefaultContent from "./tabs/DefaultContent";
import ManagementContainer from "../../pages/study/management/ManagementContainer";
import NoticeTab from "./tabs/NoticeTab";
import BoardTab from "./tabs/BoardTab";
import RankingTab from "./tabs/RankingTab";
import AttendanceContainer from "../../pages/study/attendance/AttendanceContainer";
import StudySidebarContainer from "../common/sidebar/StudySidebarContainer";

function StudyContent({ activeTab, studyData }) {
  const { studyId, assignmentId } = useParams();
  const location = useLocation();
  const [currentSubPage, setCurrentSubPage] = useState(null);

  useEffect(() => {
    setCurrentSubPage(null);
  }, [activeTab]);

  const handleSubPageChange = (subPageName) => {
    setCurrentSubPage(subPageName);
  };

  // 현재 경로에 따라 과제 관련 컴포넌트 결정
  const renderAssignmentContent = () => {
    const pathParts = location.pathname.split('/');
    const isCreatePath = pathParts.includes('create');
    const isSubmissionsPath = pathParts.includes('submissions');
    const isEditPath = pathParts.includes('edit');
    
    console.log("[StudyContent] 현재 경로:", location.pathname);
    console.log("[StudyContent] 경로 구성요소:", pathParts);
    console.log("[StudyContent] assignmentId 파라미터:", assignmentId);
    
    // /studies/:studyId/assignment/create
    if (isCreatePath) {
      return <AssignmentCreate />;
    }
    
    // /studies/:studyId/assignment/:assignmentId/edit
    if (isEditPath) {
      console.log("[StudyContent] 과제 수정 페이지 렌더링");
      return <AssignmentEdit />;
    }
    
    // /studies/:studyId/assignment/:assignmentId/submissions/:submissionId
    if (isSubmissionsPath && pathParts.length > 6) {
      return <SubmissionDetail />;
    }
    
    // /studies/:studyId/assignment/:assignmentId/submissions
    if (isSubmissionsPath) {
      return <SubmissionList />;
    }
    
    // /studies/:studyId/assignment/:assignmentId
    if (assignmentId) {
      console.log("[StudyContent] 과제 상세 페이지 렌더링, assignmentId:", assignmentId);
      return <AssignmentDetail />;
    }
    
    // /studies/:studyId/assignment
    return <AssignmentList />;
  };

  const renderContent = () => {
    console.log("[StudyContent] renderContent 호출, activeTab:", activeTab);
    
    switch (activeTab) {
      case "일정":
        console.log("[StudyContent] 일정 탭 렌더링");
        return <ScheduleContainer onSubPageChange={handleSubPageChange} />;
      case "과제":
        console.log("[StudyContent] 과제 탭 렌더링");
        return renderAssignmentContent();
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
