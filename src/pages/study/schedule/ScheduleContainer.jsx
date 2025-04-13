import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studyService } from "../../../services/api";
import { formatDateYMD as formatDate, formatTime, formatDateTime } from '../../../utils/dateUtils';import ScheduleTab from "./ScheduleTab";
import ScheduleDetailView from "./ScheduleDetailView";
import StudySidebarContainer from '../../../components/common/sidebar/StudySidebarContainer';

function ScheduleContainer() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { studyId } = useParams();
  const navigate = useNavigate();

  // 일정 목록 조회
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await studyService.getSchedules(studyId);
        console.log("[ScheduleContainer] 일정 데이터 조회 성공:", response);
        
        // 멤버 컨텍스트 정보 저장 (있는 경우)
        if (response && response.memberContext) {
          console.log("[ScheduleContainer] 멤버 컨텍스트:", response.memberContext);
        }
        
        // data 필드에서 일정 배열을 추출 (없으면 빈 배열)
        const scheduleList = response?.data || [];
        
        // 응답 데이터 변환 (날짜 형식 변환)
        const formattedData = scheduleList.map(schedule => ({
          ...schedule,
          formattedDate: formatDate(schedule.scheduleStartingAt),
          formattedDateTime: formatDateTime(schedule.scheduleStartingAt)
        }));
        
        setSchedules(formattedData);
      } catch (error) {
        console.error("[ScheduleContainer] 일정 데이터 조회 실패:", error);
        setError("일정을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [studyId]);

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
      console.log("[ScheduleContainer] 일정 추가 성공:", result);

      // 성공 시 상태 업데이트
      const addedSchedule = {
        scheduleId: result.scheduleId || Date.now(), // Location 헤더에서 추출한 ID 또는 임시 ID
        scheduleTitle: newSchedule.title,
        scheduleContent: newSchedule.description,
        scheduleStartingAt: `${newSchedule.date}T${newSchedule.time || '00:00:00'}`.replace(/\./g, "-"),
        formattedDate: newSchedule.date,
        formattedDateTime: `${newSchedule.date} ${formatTime(`${newSchedule.date}T${newSchedule.time || '00:00:00'}`)}`,
        // 추가 정보
        studyName: result.studyName,
        memberRole: result.memberRole
      };

      setSchedules((prev) => [...prev, addedSchedule]);
      return true;
    } catch (error) {
      console.error("[ScheduleContainer] 일정 추가 실패:", error);
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
      console.log("[ScheduleContainer] 일정 삭제 성공:", result);

      // 성공 시 상태 업데이트
      setSchedules((prev) =>
        prev.filter((schedule) => schedule.scheduleId !== scheduleId)
      );
      return true;
    } catch (error) {
      console.error("[ScheduleContainer] 일정 삭제 실패:", error);
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
      console.log("[ScheduleContainer] 일정 수정 성공:", result);

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
                formattedDateTime: formatDateTime(updatedSchedule.date.includes('T') 
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
      console.error("[ScheduleContainer] 일정 수정 실패:", error);
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

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: '#F44336' }}>{error}</div>;
  }

  const renderContent = () => {
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
        display: 'flex',
        gap: '2rem',
        width: '100%',
        maxWidth: '1200px',
        position: 'relative',
        padding: '0 1rem',
        marginTop: '1rem'
      }}>
        <StudySidebarContainer activeTab="일정" />
        <div style={{ flex: 1 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default ScheduleContainer;
