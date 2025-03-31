import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ScheduleTab from "./tabs/ScheduleTab";
import AssignmentTab from "./tabs/AssignmentTab";
import DefaultContent from "./tabs/DefaultContent";
import ManagementTab from "./tabs/ManagementTab";
import AttendanceTab from "./tabs/AttendanceTab";
import { studyService } from "../../services/api";
import NoticeList from "./notice/NoticeList";

function StudyContent({ activeTab, studyData }) {
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { studyId } = useParams();

  // 일정 목록 조회
  useEffect(() => {
    if (activeTab === "일정") {
      const fetchSchedules = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const data = await studyService.getSchedules(studyId);
          console.log("[StudyContent] 일정 데이터 조회 성공:", data);
          setSchedules(data);
        } catch (error) {
          console.error("[StudyContent] 일정 데이터 조회 실패:", error);
          setError("일정을 불러오는 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchSchedules();
    }
  }, [activeTab, studyId]);

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

  // 일정 추가 핸들러
  const handleAddSchedule = async (newSchedule) => {
    try {
      setIsLoading(true);

      // API 요청 데이터 형식으로 변환
      const scheduleData = {
        round: newSchedule.round,
        title: newSchedule.title,
        content: newSchedule.description,
        date: newSchedule.date,
      };

      // API 호출
      const result = await studyService.addSchedule(studyId, scheduleData);
      console.log("[StudyContent] 일정 추가 성공:", result);

      // 성공 시 상태 업데이트
      const addedSchedule = {
        scheduleId: result.scheduleId || Date.now(),
        round: newSchedule.round,
        title: newSchedule.title,
        content: `${newSchedule.title}\n${newSchedule.description}`,
        date: newSchedule.date,
      };

      setSchedules((prev) => [...prev, addedSchedule]);
      return true;
    } catch (error) {
      console.error("[StudyContent] 일정 추가 실패:", error);
      setError("일정 추가에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 일정 삭제 핸들러
  const handleDeleteSchedule = async (scheduleId) => {
    try {
      setIsLoading(true);

      // API 호출
      await studyService.deleteSchedule(studyId, scheduleId);
      console.log("[StudyContent] 일정 삭제 성공:", scheduleId);

      // 성공 시 상태 업데이트
      setSchedules((prev) =>
        prev.filter((schedule) => schedule.scheduleId !== scheduleId)
      );
      return true;
    } catch (error) {
      console.error("[StudyContent] 일정 삭제 실패:", error);
      setError("일정 삭제에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    console.log("StudyContent - activeTab:", activeTab);

    switch (activeTab) {
      case "일정":
        return (
          <ScheduleTab
            schedules={schedules}
            onAddSchedule={handleAddSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            isLoading={isLoading}
            error={error}
          />
        );
      case "과제":
        return <AssignmentTab assignments={assignments} />;
      case "관리":
        console.log("Rendering management content");
        return <ManagementTab studyData={studyData} />;
      case "출석":
        console.log("Rendering attendance content");
        return <AttendanceTab />;
      case "공지사항":
        return <NoticeList />;
      case "게시판":
      case "랭킹":
        return (
          <div
            style={{ padding: "2rem", textAlign: "center", color: "#666666" }}
          >
            {activeTab} 탭 컨텐츠가 준비중입니다.
          </div>
        );
      default:
        console.log("Rendering default content");
        return <DefaultContent studyData={studyData} />;
    }
  };

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        paddingRight: "1rem",
      }}
    >
      {renderContent()}
    </div>
  );
}

StudyContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  studyData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default StudyContent;
