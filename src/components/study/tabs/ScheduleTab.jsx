import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import AddScheduleModal from '../modals/AddScheduleModal';

function ScheduleTab({ schedules, onAddSchedule, onDeleteSchedule, onUpdateSchedule, isLoading, error }) {
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
  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      try {
        await onDeleteSchedule(scheduleId);
      } catch (error) {
        console.error('[ScheduleTab] 일정 삭제 실패:', error);
      }
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative', marginTop: '3rem' }}>
      {/* 일정 추가 버튼 */}
      <div style={{
        position: 'absolute',
        top: '-3rem',
        right: 0,
        zIndex: 1
      }}>
        <button
          onClick={handleNavigateToAddSchedule}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isLoading ? '#cccccc' : '#FF0000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '처리중...' : '일정 추가'}
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
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#666666'
        }}>
          일정을 불러오는 중입니다...
        </div>
      )}
      
      {/* 일정 목록 표시 */}
      {!isLoading && schedules.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#666666',
          border: '1px dashed #E5E5E5',
          borderRadius: '4px'
        }}>
          등록된 일정이 없습니다. 일정 추가 버튼을 눌러 새 일정을 추가해보세요.
        </div>
      ) : (
        <>
          {!isLoading && schedules.map((schedule) => (
            <div 
              key={schedule.scheduleId}
              style={{
                marginBottom: '2rem',
                width: '100%',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                padding: '1.5rem',
                position: 'relative'
              }}
            >
              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDeleteSchedule(schedule.scheduleId)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#666666',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '0.25rem 0.5rem'
                }}
              >
                삭제
              </button>
              
              {/* 수정 버튼 */}
              <button
                onClick={() => handleOpenUpdateSchedulePopup(schedule)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '4rem',
                  background: 'none',
                  border: 'none',
                  color: '#666666',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '0.25rem 0.5rem'
                }}
              >
                수정
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '1px',
                  height: '16px',
                  backgroundColor: '#FF0000',
                  marginRight: '0.5rem'
                }} />
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {schedule.round}회차
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#666666',
                  marginLeft: '1rem'
                }}>
                  {schedule.formattedDate || formatDate(schedule.scheduleStartingAt)}
                </span>
                {schedule.scheduleTitle && (
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginLeft: '1rem'
                  }}>
                    - {schedule.scheduleTitle}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#333333',
                whiteSpace: 'pre-line',
                lineHeight: '1.6'
              }}>
                {schedule.scheduleContent}
              </div>
            </div>
          ))}
        </>
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
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

ScheduleTab.defaultProps = {
  isLoading: false,
  error: null
};

export default ScheduleTab; 