import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import AddScheduleModal from "../../../components/study/modals/AddScheduleModal";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  formatDateYMD as formatDate,
  formatTime,
  formatDateTime,
} from "../../../utils/dateUtils";
import Button from "../../../components/common/Button";
import ScheduleMenu from "../../../components/study/schedule/ScheduleMenu";
import "./ScheduleListPage.css";

function ScheduleListPage({
  schedules,
  onAddSchedule,
  onDeleteSchedule,
  onUpdateSchedule,
  onViewScheduleDetail,
  isLoading,
  error,
  memberRole,
}) {
  const { colors } = useTheme();
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [showUpdateSchedulePopup, setShowUpdateSchedulePopup] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 관리자 권한 확인
  const isManager = memberRole === "HOST" || memberRole === "CREATOR";
  
  // Debug admin role
  useEffect(() => {
    console.log("[ScheduleListPage] isManager:", isManager, "memberRole:", memberRole);
  }, [isManager, memberRole]);

  // 일정 추가 페이지로 이동
  const handleNavigateToAddSchedule = () => {
    if (onAddSchedule) {
      onAddSchedule();
    }
  };

  // 일정 수정 페이지로 이동
  const handleNavigateToEditSchedule = (schedule) => {
    navigate(`/studies/${studyId}/schedules/${schedule.scheduleId}`, { 
      state: { 
        schedule, 
        breadcrumb: "일정 > 수정"
      } 
    });
    
    // 상세 보기 호출
    if (onViewScheduleDetail) {
      onViewScheduleDetail(schedule);
    }
  };



  // 일정 수정 팝업 닫기
  const handleCloseUpdateSchedulePopup = () => {
    setSelectedSchedule(null);
    setShowUpdateSchedulePopup(false);
  };

  // 일정 수정 처리
  const handleSubmitUpdateSchedule = async (updatedSchedule) => {
    if (!selectedSchedule) return;

    setIsUpdating(true);

    try {
      // API 요청을 통한 일정 수정
      const success = await onUpdateSchedule(selectedSchedule.id, {
        title: updatedSchedule.title,
        content: updatedSchedule.description,
        date: updatedSchedule.date,
      });

      if (success) {
        // 성공 시 모달 닫기
        handleCloseUpdateSchedulePopup();
      }
    } catch (error) {
      console.error("[ScheduleListPage] 일정 수정 실패:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 일정 삭제 처리
  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await onDeleteSchedule(scheduleId);
    } catch (error) {
      console.error("[ScheduleListPage] 일정 삭제 실패:", error);
    }
  };

  // 일정을 날짜순으로 정렬하고 회차 번호 할당
  const sortedSchedules = () => {
    // schedules가 없거나 빈 배열이면 빈 배열 반환
    if (!schedules || schedules.length === 0) return [];

    // 일정 데이터 배열 추출
    const scheduleData = schedules;

    // 1. 먼저 날짜순으로 정렬 (오래된 순)하여 회차 부여
    const withRounds = [...scheduleData]
      .sort(
        (a, b) =>
          new Date(a.scheduleStartingAt) - new Date(b.scheduleStartingAt)
      )
      .map((schedule, index) => ({
        ...schedule,
        round: index + 1, // 오래된 일정부터 1회차, 2회차로 순차 할당
      }));

    // 2. 최신순으로 정렬하여 표시
    return withRounds.sort(
      (a, b) => new Date(b.scheduleStartingAt) - new Date(a.scheduleStartingAt)
    );
  };

  const schedulesWithRounds = sortedSchedules();

  return (
    <div className="schedule-list-container">
      {/* 일정 추가 안내 - 관리자 권한이 있을 때만 표시 */}
      {isManager && (
        <div 
          className="schedule-add-box"
          style={{ backgroundColor: colors.cardBackground }}
        >
          <div>
            <div className="schedule-add-title" style={{ color: colors.text }}>
              일정 추가
            </div>
            <div className="schedule-add-description" style={{ color: colors.textSecondary }}>
              다가올 일정을 추가해주세요.
            </div>
          </div>
          <Button 
            onClick={handleNavigateToAddSchedule} 
            variant="add" 
            style={{ 
              width: '60px', 
              height: '32px',
              fontSize: '12px'
            }}
            label="+추가" 
          />
        </div>
      )}

      {/* 오류 메시지 표시 */}
      {error && (
        <div
          className="schedule-error"
          style={{
            backgroundColor: `${colors.error}20`,
            color: colors.error,
          }}
        >
          {error}
        </div>
      )}

      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div
          className="schedule-loading"
          style={{ color: colors.textSecondary }}
        >
          일정을 불러오는 중입니다...
        </div>
      )}

      {/* 일정 타임라인 */}
      {!isLoading && schedulesWithRounds.length === 0 ? (
        <div
          className="schedule-empty"
          style={{
            color: colors.textSecondary,
            border: `1px dashed ${colors.border}`,
            backgroundColor: colors.cardBackground,
          }}
        >
          등록된 일정이 없습니다.{" "}
          {isManager && "일정 추가 버튼을 눌러 새 일정을 추가해보세요."}
        </div>
      ) : (
        <div className="timeline-container">
          {/* 타임라인 세로선 - CSS로 자동 생성됨 */}

          {/* 일정 아이템 목록 */}
          <div className="schedule-items">
            {schedulesWithRounds.map((schedule) => (
              <div key={schedule.scheduleId} className="schedule-item-wrapper">
                {/* 회차 및 제목 정보 (박스 위) */}
                <div className="schedule-item-header">
                  <h3 className="schedule-title" style={{ color: colors.textPrimary }}>
                    {schedule.scheduleTitle}
                  </h3>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                    {schedule.round}회차(일시: {formatDateTime(schedule.scheduleStartingAt)})
                  </p>
                </div>
                
                {/* 일정 내용 박스 */}
                <div
                  className="schedule-item"
                  style={{
                    backgroundColor: colors.cardBackground,
                    border: '1px solid black',
                    borderRadius: '8px',
                  }}
                >
                  {/* 일정 제목과 메뉴 */}
                  <div className="schedule-header">
                    <div className="schedule-info-wrapper">
                      {/* N회차 모임 텍스트 제거 */}
                    </div>
                    
                    {isManager && (
                      <ScheduleMenu 
                        onEdit={() => handleNavigateToEditSchedule(schedule)}
                        onDelete={() => handleDeleteSchedule(schedule.scheduleId)}
                      />
                    )}
                  </div>

                  {/* 일정 내용 */}
                  <div 
                    className="schedule-content"
                    style={{ color: colors.text }}
                  >
                    {schedule.scheduleContent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 업데이트 모달 */}
      {showUpdateSchedulePopup && selectedSchedule && (
        <AddScheduleModal
          isOpen={showUpdateSchedulePopup}
          onClose={handleCloseUpdateSchedulePopup}
          onSubmit={handleSubmitUpdateSchedule}
          initialValues={{
            title: selectedSchedule.title,
            description: selectedSchedule.description,
            date: selectedSchedule.date,
            time: selectedSchedule.time,
          }}
          isSubmitting={isUpdating}
          title="일정 수정"
          submitButtonText="수정하기"
        />
      )}
    </div>
  );
}

ScheduleListPage.propTypes = {
  schedules: PropTypes.array.isRequired,
  onAddSchedule: PropTypes.func.isRequired,
  onDeleteSchedule: PropTypes.func.isRequired,
  onUpdateSchedule: PropTypes.func.isRequired,
  onViewScheduleDetail: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  memberRole: PropTypes.string,
};

ScheduleListPage.defaultProps = {
  schedules: [],
  isLoading: false,
  error: null,
  memberRole: "",
};

export default ScheduleListPage;
