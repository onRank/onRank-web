import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import { studyService } from "../../../services/api";
import { formatDateYMD as formatDate, formatTime, formatDateTime } from '../../../utils/dateUtils';
import useStudyRole from "../../../hooks/useStudyRole";
import ScheduleListPage from "./ScheduleListPage";
import ScheduleDetailView from "./ScheduleDetailView";
import ScheduleAddPage from "./ScheduleAddPage";

function ScheduleContainer({ onSubPageChange }) {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { studyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // useStudyRole 훅 사용
  const { memberRole, updateMemberRole, updateMemberRoleFromResponse } = useStudyRole();
  
  console.log("[ScheduleContainer] 초기화, studyId:", studyId, "memberRole:", memberRole);
  
  // 현재 경로를 확인하여 어떤 컴포넌트를 표시할지 결정
  const isAddPage = location.pathname.endsWith('/add');
  
  // 일정 목록 조회
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await studyService.getSchedules(studyId);
        console.log("[ScheduleContainer] 일정 데이터 조회 성공:", response);
        
        // 멤버 컨텍스트 정보 처리 - MemberRoleContext 업데이트 (studyId 명시적 전달)
        console.log("[ScheduleContainer] 멤버 역할 업데이트 시도, studyId:", studyId);
        updateMemberRoleFromResponse(response, studyId);
        
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

    if (!isAddPage) {
      fetchSchedules();
    }
  }, [studyId, isAddPage, updateMemberRole, updateMemberRoleFromResponse]);

  // subPage 상태 관리 및 콜백 호출
  useEffect(() => {
    if (isAddPage) {
      onSubPageChange("일정 추가");
    } else if (showScheduleDetail) {
      onSubPageChange("일정 상세");
    } else {
      onSubPageChange(null); // 목록 페이지에서는 null 전달
    }
    // 컴포넌트 언마운트 시 subPage 초기화
    return () => {
      onSubPageChange(null);
    };
  }, [isAddPage, showScheduleDetail, onSubPageChange]);

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
      
      // API 응답에서 멤버 역할 정보 추출 및 업데이트 (studyId 명시적 전달)
      updateMemberRoleFromResponse(result, studyId);

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
      
      // API 응답에서 멤버 역할 정보 추출 및 업데이트 (studyId 명시적 전달)
      updateMemberRoleFromResponse(result, studyId);

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
      
      // API 응답에서 멤버 역할 정보 추출 및 업데이트 (studyId 명시적 전달)
      updateMemberRoleFromResponse(result, studyId);

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
  
  // 일정 추가 페이지로 이동
  const handleNavigateToAddPage = () => {
    navigate(`/studies/${studyId}/schedules/add`);
  };
  
  // 일정 목록 페이지로 이동
  const handleNavigateToListPage = () => {
    navigate(`/studies/${studyId}/schedules`);
  };

  // 컨텐츠 렌더링
  const renderContent = () => {
    if (isAddPage) {
      return <ScheduleAddPage onCancel={handleNavigateToListPage} />;
    }
    
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
      <ScheduleListPage
        schedules={schedules}
        onAddSchedule={handleNavigateToAddPage}
        onDeleteSchedule={handleDeleteSchedule}
        onUpdateSchedule={handleUpdateSchedule}
        onViewScheduleDetail={handleViewScheduleDetail}
        isLoading={isLoading}
        error={error}
        memberRole={memberRole}
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
}

ScheduleContainer.propTypes = {
  onSubPageChange: PropTypes.func.isRequired,
};

export default ScheduleContainer;
