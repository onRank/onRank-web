import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import AddScheduleModal from '../modals/AddScheduleModal';

function ScheduleTab({ schedules, onAddSchedule, onDeleteSchedule, onUpdateSchedule, onViewScheduleDetail, isLoading, error }) {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [showUpdateSchedulePopup, setShowUpdateSchedulePopup] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // ISO 날짜 문자열을 'yyyy.MM.dd' 형식으로 변환하는 함수
  const formatDate = (isoDateString) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 일정 추가 페이지로 이동
  const handleNavigateToAddSchedule = () => {
    navigate(`/studies/${studyId}/schedules/add`);
  };

  // 일정 수정 팝업 열기
  const handleOpenUpdateSchedulePopup = (schedule) => {
    // scheduleStartingAt에서 날짜 부분만 추출
    const dateOnly = schedule.scheduleStartingAt ? 
      schedule.scheduleStartingAt.split('T')[0].replace(/-/g, '.') : 
      formatDate(schedule.scheduleStartingAt);
      
    // 수정을 위한 데이터 준비
    setSelectedSchedule({
      id: schedule.scheduleId,
      title: schedule.scheduleTitle,
      description: schedule.scheduleContent,
      date: dateOnly,
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
      console.error('[ScheduleTab] 일정 수정 실패:', error);
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
        console.error('[ScheduleTab] 일정 삭제 실패:', error);
      }
    }
  };

  // 일정을 날짜순으로 정렬하고 회차 번호 할당
  const sortedSchedules = () => {
    if (!schedules || schedules.length === 0) return [];
    
    // 날짜순으로 정렬 (오래된 일정이 먼저)
    return [...schedules]
      .sort((a, b) => new Date(a.scheduleStartingAt) - new Date(b.scheduleStartingAt))
      .map((schedule, index) => ({
        ...schedule,
        round: index + 1 // 오래된 일정부터 1회차, 2회차로 순차 할당
      }));
  };

  const schedulesWithRounds = sortedSchedules();

  return (
    <div style={{ 
      width: '100%'
    }}>
      {/* 일정 추가 안내 */}
      <div style={{
        border: '1px solid #E5E5E5',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '2rem',
        backgroundColor: '#F8F9FA',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>일정 추가</div>
          <div style={{ color: '#666', fontSize: '14px' }}>다가올 일정을 추가해주세요.</div>
        </div>
        <button
          onClick={handleNavigateToAddSchedule}
          style={{
            padding: '0.5rem 2rem',
            backgroundColor: '#FF0000',
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
      
      {/* 오류 메시지 표시 */}
      {error && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#FFEBEE',
          color: '#D32F2F',
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
          color: '#666666',
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
          color: '#666666',
          border: '1px dashed #E5E5E5',
          borderRadius: '4px',
          width: '100%'
        }}>
          등록된 일정이 없습니다. 일정 추가 버튼을 눌러 새 일정을 추가해보세요.
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          {schedulesWithRounds.map((schedule, index) => (
            <div
              key={schedule.scheduleId}
              onClick={() => onViewScheduleDetail(schedule)}
              style={{
                position: 'relative',
                padding: '1.5rem',
                marginBottom: '1rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#FF0000',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {schedulesWithRounds.length - index}
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  margin: 0,
                  marginRight: '1rem'
                }}>
                  {schedule.scheduleTitle}
                </h3>
                <span style={{
                  color: '#666666',
                  fontSize: '14px'
                }}>
                  {formatDate(schedule.scheduleStartingAt)}
                </span>
              </div>
              <p style={{
                margin: 0,
                color: '#666666',
                fontSize: '14px',
                paddingLeft: '2.5rem'
              }}>
                {schedule.scheduleContent}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {/* 일정 수정 모달 */}
      {showUpdateSchedulePopup && (
        <AddScheduleModal
          onClose={handleCloseUpdateSchedulePopup}
          onSubmit={handleSubmitUpdateSchedule}
          initialRound={selectedSchedule.round}
          initialTitle={selectedSchedule.title}
          initialDescription={selectedSchedule.description}
          initialDate={selectedSchedule.date}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  );
}

ScheduleTab.propTypes = {
  schedules: PropTypes.array.isRequired,
  onAddSchedule: PropTypes.func.isRequired,
  onDeleteSchedule: PropTypes.func.isRequired,
  onUpdateSchedule: PropTypes.func.isRequired,
  onViewScheduleDetail: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

ScheduleTab.defaultProps = {
  isLoading: false,
  error: null
};

export default ScheduleTab; 