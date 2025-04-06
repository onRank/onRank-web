import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScheduleTab from "./tabs/ScheduleTab";
import ScheduleDetailView from "./tabs/ScheduleDetailView";
import AssignmentTab from "./tabs/AssignmentTab";
import DefaultContent from "./tabs/DefaultContent";
import ManagementTab from "./tabs/ManagementTab";
import AttendanceTab from "./tabs/AttendanceTab";
import NoticeTab from "./tabs/NoticeTab";
import BoardTab from "./tabs/BoardTab";
import RankingTab from "./tabs/RankingTab";
import { studyService } from "../../services/api";

function StudyContent({ activeTab, studyData }) {
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { studyId } = useParams();
  const navigate = useNavigate();

  // ISO 날짜 문자열을 'yyyy.MM.dd' 형식으로 변환하는 함수
  const formatDate = (isoDateString) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 일정 목록 조회
  useEffect(() => {
    if (activeTab === "일정") {
      const fetchSchedules = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const response = await studyService.getSchedules(studyId);
          console.log("[StudyContent] 일정 데이터 조회 성공:", response);
          
          // 멤버 컨텍스트 정보 저장 (있는 경우)
          if (response && response.memberContext) {
            console.log("[StudyContent] 멤버 컨텍스트:", response.memberContext);
            // 필요한 경우 여기서 memberContext 정보 활용
          }
          
          // data 필드에서 일정 배열을 추출 (없으면 빈 배열)
          const scheduleList = response?.data || [];
          
          // 응답 데이터 변환 (날짜 형식 변환)
          const formattedData = scheduleList.map(schedule => ({
            ...schedule,
            formattedDate: formatDate(schedule.scheduleStartingAt)
          }));
          
          setSchedules(formattedData);
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
        title: newSchedule.title,
        content: newSchedule.description,
        date: newSchedule.date,
      };

      // API 호출
      const result = await studyService.addSchedule(studyId, scheduleData);
      console.log("[StudyContent] 일정 추가 성공:", result);

      // 성공 시 상태 업데이트
      const addedSchedule = {
        scheduleId: result.scheduleId || Date.now(), // Location 헤더에서 추출한 ID 또는 임시 ID
        scheduleTitle: newSchedule.title,
        scheduleContent: newSchedule.description,
        scheduleStartingAt: `${newSchedule.date}T00:00:00`.replace(/\./g, "-"),
        formattedDate: newSchedule.date,
        // 추가 정보
        studyName: result.studyName,
        memberRole: result.memberRole
      };

      setSchedules((prev) => [...prev, addedSchedule]);
      return true;
    } catch (error) {
      console.error("[StudyContent] 일정 추가 실패:", error);
      setError(`일정 추가에 실패했습니다: ${error.message}`);
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
      const result = await studyService.deleteSchedule(studyId, scheduleId);
      console.log("[StudyContent] 일정 삭제 성공:", result);

      // 성공 시 상태 업데이트
      setSchedules((prev) =>
        prev.filter((schedule) => schedule.scheduleId !== scheduleId)
      );
      return true;
    } catch (error) {
      console.error("[StudyContent] 일정 삭제 실패:", error);
      setError(`일정 삭제에 실패했습니다: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 일정 수정 핸들러
  const handleUpdateSchedule = async (scheduleId, updatedSchedule) => {
    try {
      setIsLoading(true);

      // API 요청 데이터 형식으로 변환
      const scheduleData = {
        title: updatedSchedule.title,
        content: updatedSchedule.content,
        date: updatedSchedule.date,
        time: updatedSchedule.time // 시간 정보 추가
      };

      // API 호출
      const result = await studyService.updateSchedule(studyId, scheduleId, scheduleData);
      console.log("[StudyContent] 일정 수정 성공:", result);

      // 성공 시 상태 업데이트
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.scheduleId === scheduleId
            ? {
                ...schedule,
                scheduleTitle: updatedSchedule.title,
                scheduleContent: updatedSchedule.content,
                // 날짜와 시간 정보를 합쳐서 저장
                scheduleStartingAt: updatedSchedule.date.includes('T') 
                  ? updatedSchedule.date.replace(/\./g, "-") 
                  : `${updatedSchedule.date.replace(/\./g, "-")}T${updatedSchedule.time || '00:00:00'}`,
                formattedDate: formatDate(updatedSchedule.date.includes('T') 
                  ? updatedSchedule.date 
                  : `${updatedSchedule.date}T${updatedSchedule.time || '00:00:00'}`),
                // 멤버 컨텍스트 정보 업데이트
                studyName: result.studyName || schedule.studyName,
                memberRole: result.memberRole || schedule.memberRole
              }
            : schedule
        )
      );
      return true;
    } catch (error) {
      console.error("[StudyContent] 일정 수정 실패:", error);
      setError(`일정 수정에 실패했습니다: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // 일정 상세 보기로 전환
  const handleViewScheduleDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setShowScheduleDetail(true);
  };
  
  // 일정 목록 보기로 돌아가기
  const handleBackToScheduleList = () => {
    setShowScheduleDetail(false);
    setSelectedSchedule(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div>로딩 중...</div>;
    }

    if (error) {
      return <div style={{ color: '#F44336' }}>{error}</div>;
    }

    switch (activeTab) {
      case "일정":
        if (showScheduleDetail) {
          return (
            <ScheduleDetailView
              schedule={selectedSchedule}
              onBack={handleBackToScheduleList}
              onUpdate={handleUpdateSchedule}
              onDelete={handleDeleteSchedule}
              isLoading={isLoading}
            />
          );
        }
        return (
          <ScheduleTab
            schedules={schedules}
            onAddSchedule={() => navigate(`/studies/${studyId}/schedules/add`)}
            onDeleteSchedule={handleDeleteSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onViewScheduleDetail={handleViewScheduleDetail}
            isLoading={isLoading}
            error={error}
          />
        );
      case "과제":
        return (
          <AssignmentTab
            assignments={assignments}
            studyId={studyId}
          />
        );
      case "공지사항":
        return <NoticeTab />;
      case "게시판":
        return <BoardTab />;
      case "출석":
        return <AttendanceTab />;
      case "관리":
        return <ManagementTab studyData={studyData} />;
      case "랭킹":
        return <RankingTab />;
      default:
        return (
          <DefaultContent studyData={studyData} />
        );
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
