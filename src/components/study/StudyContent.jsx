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

// AssignmentContainer 컴포넌트 구현
const AssignmentContainer = ({ onSubPageChange }) => {
  const { studyId, assignmentId, submissionId } = useParams();
  const location = useLocation();
  
  // 현재 경로에 따라 어떤 컴포넌트를 렌더링할지 결정
  const isCreatePage = location.pathname.endsWith('/create');
  const isEditPage = location.pathname.includes('/edit');
  const isSubmissionsPage = location.pathname.includes('/submissions');
  const isSubmissionDetailPage = location.pathname.includes('/submission/');
  const isDetailPage = assignmentId && !isEditPage && !isSubmissionsPage && !isSubmissionDetailPage;
  
  // 서브페이지 상태 관리
  useEffect(() => {
    if (isCreatePage) {
      onSubPageChange("추가");
    } else if (isEditPage) {
      onSubPageChange("수정");
    } else if (isSubmissionsPage) {
      onSubPageChange("제출목록");
    } else if (isSubmissionDetailPage) {
      onSubPageChange("제출상세");
    } else if (isDetailPage) {
      onSubPageChange("상세");
    } else {
      onSubPageChange(null);
    }
    
    // 컴포넌트 언마운트 시 서브페이지 초기화
    return () => {
      onSubPageChange(null);
    };
  }, [isCreatePage, isEditPage, isSubmissionsPage, isSubmissionDetailPage, isDetailPage, onSubPageChange]);
  
  // 컨텐츠 렌더링
  const renderContent = () => {
    if (isCreatePage) {
      return <AssignmentCreate />;
    }
    
    if (isEditPage) {
      return <AssignmentEdit />;
    }
    
    if (isSubmissionsPage) {
      return <SubmissionList />;
    }
    
    if (isSubmissionDetailPage) {
      return <SubmissionDetail />;
    }
    
    if (isDetailPage) {
      return <AssignmentDetail />;
    }
    
    return <AssignmentList />;
  };
  
  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        position: 'relative',
        padding: '0 1rem',
        marginTop: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

AssignmentContainer.propTypes = {
  onSubPageChange: PropTypes.func.isRequired
};

export default function StudyContent({ activeTab, studyData }) {
  const [currentSubPage, setCurrentSubPage] = useState(null);
  const { studyId } = useParams();
  const location = useLocation();
  
  console.log("[StudyContent] 초기화, activeTab:", activeTab);
  
  useEffect(() => {
    console.log("[StudyContent] 현재 위치:", location.pathname);
  }, [location.pathname]);
  
  const handleSubPageChange = (subPage) => {
    console.log("[StudyContent] 서브페이지 변경:", subPage);
    setCurrentSubPage(subPage);
  };
  
  // 과제 탭 컨텐츠 렌더링
  const renderAssignmentContent = () => {
    return <AssignmentContainer onSubPageChange={handleSubPageChange} />;
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
