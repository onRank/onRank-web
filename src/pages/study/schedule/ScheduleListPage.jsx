import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import AddScheduleModal from '../../../components/study/modals/AddScheduleModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatDateYMD as formatDate, formatTime, formatDateTime } from '../../../utils/dateUtils';

function ScheduleListPage({ schedules, onAddSchedule, onDeleteSchedule, onUpdateSchedule, onViewScheduleDetail, isLoading, error, memberRole }) {
  const { colors } = useTheme();
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [showUpdateSchedulePopup, setShowUpdateSchedulePopup] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 관리자 권한 확인 (HOST, ADMIN, OWNER인 경우)
  const isManager = memberRole === 'HOST' || memberRole === 'CREATOR';
  
  // 일정 추가 페이지로 이동
  const handleNavigateToAddSchedule = () => {
    if (onAddSchedule) {
      onAddSchedule();
    }
  };

  // 일정 수정 팝업 열기
  const handleOpenUpdateSchedulePopup = (schedule) => {
    // scheduleStartingAt에서 날짜와 시간 부분 추출
    let dateOnly = '';
    let timeOnly = '00:00';
    
    if (schedule.scheduleStartingAt) {
      const dateTimeParts = schedule.scheduleStartingAt.split('T');
      if (dateTimeParts.length >= 2) {
        dateOnly = dateTimeParts[0].replace(/-/g, '.');
        // 시간 부분에서 초 제외하고 시:분 만 사용
        timeOnly = dateTimeParts[1].substring(0, 5);
      } else {
        dateOnly = schedule.scheduleStartingAt.replace(/-/g, '.');
      }
    } else {
      dateOnly = formatDate(schedule.scheduleStartingAt);
    }
      
    // 수정을 위한 데이터 준비
    setSelectedSchedule({
      id: schedule.scheduleId,
      title: schedule.scheduleTitle,
      description: schedule.scheduleContent,
      date: dateOnly,
      time: timeOnly,
      round: schedule.round || 1
    });
    setShowUpdateSchedulePopup(true);
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
        date: updatedSchedule.date
      });
      
      if (success) {
        // 성공 시 모달 닫기
        handleCloseUpdateSchedulePopup();
      }
    } catch (error) {
      console.error('[ScheduleListPage] 일정 수정 실패:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // 일정 삭제 처리
  const handleDeleteSchedule = async (scheduleId, event) => {
    // 이벤트 버블링 방지
    event.stopPropagation();
    
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      try {
        await onDeleteSchedule(scheduleId);
      } catch (error) {
        console.error('[ScheduleListPage] 일정 삭제 실패:', error);
      }
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
      .sort((a, b) => new Date(a.scheduleStartingAt) - new Date(b.scheduleStartingAt))
      .map((schedule, index) => ({
        ...schedule,
        round: index + 1 // 오래된 일정부터 1회차, 2회차로 순차 할당
      }));
    
    // 2. 다시 최신순으로 정렬하여 표시
    return withRounds.sort((a, b) => new Date(b.scheduleStartingAt) - new Date(a.scheduleStartingAt));
  };

  const schedulesWithRounds = sortedSchedules();

  return (
    <div style={{ 
      width: '100%'
    }}>
      {/* 일정 추가 안내 - 관리자 권한이 있을 때만 표시 */}
      {isManager && (
        <div style={{
          border: `1px solid ${colors.border}`,
          borderRadius: '4px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backgroundColor: colors.cardBackground,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: colors.text }}>일정 추가</div>
            <div style={{ color: colors.textSecondary, fontSize: '14px' }}>다가올 일정을 추가해주세요.</div>
          </div>
          <button
            onClick={handleNavigateToAddSchedule}
            style={{
              padding: '0.5rem 2rem',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            일정 추가
          </button>
        </div>
      )}
      
      {/* 오류 메시지 표시 */}
      {error && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: `${colors.error}20`, // 20% 투명도
          color: colors.error,
          borderRadius: '4px',
          fontSize: '14px',
          width: '100%'
        }}>
          {error}
        </div>
      )}
      
      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: colors.textSecondary,
          width: '100%'
        }}>
          일정을 불러오는 중입니다...
        </div>
      )}
      
      {/* 일정 타임라인 */}
      {!isLoading && schedulesWithRounds.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: colors.textSecondary,
          border: `1px dashed ${colors.border}`,
          borderRadius: '4px',
          width: '100%',
          backgroundColor: colors.cardBackground
        }}>
          등록된 일정이 없습니다. {isManager && "일정 추가 버튼을 눌러 새 일정을 추가해보세요."}
        </div>
      ) : (
        <div style={{ 
          width: '100%',
          position: 'relative'
        }}>
          {/* 타임라인 세로선 */}
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: colors.border
          }}></div>
          
          {/* 일정 아이템 목록 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            paddingLeft: '30px',
            width: '100%'
          }}>
            {schedulesWithRounds.map((schedule) => (
              <div 
                key={schedule.scheduleId} 
                onClick={() => onViewScheduleDetail(schedule)}
                style={{
                  position: 'relative',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  backgroundColor: colors.cardBackground,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* 타임라인 원 */}
                <div style={{
                  position: 'absolute',
                  left: '-38px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {schedule.round}
                </div>
                
                {/* 일정 제목과 날짜 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: colors.textPrimary }}>
                      {schedule.scheduleTitle}
                    </div>
                    <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
                      {schedule.formattedDateTime || schedule.formattedDate}
                    </div>
                  </div>
                  
                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => handleDeleteSchedule(schedule.scheduleId, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.error,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${colors.error}10`; // 10% 투명도
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    삭제
                  </button>
                </div>
                
                {/* 일정 내용 */}
                {schedule.scheduleContent && (
                  <div style={{ 
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: colors.surfaceHover,
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: colors.text,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {schedule.scheduleContent}
                  </div>
                )}
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
            time: selectedSchedule.time
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
  memberRole: PropTypes.string
};

ScheduleListPage.defaultProps = {
  schedules: [],
  isLoading: false,
  error: null,
  memberRole: ''
};

export default ScheduleListPage; 