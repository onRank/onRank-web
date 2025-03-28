import { useState } from 'react';
import PropTypes from 'prop-types';
import AddScheduleModal from '../modals/AddScheduleModal';

function ScheduleTab({ schedules, onAddSchedule, onDeleteSchedule, isLoading, error }) {
  const [showAddSchedulePopup, setShowAddSchedulePopup] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // 일정 추가 팝업 열기
  const handleOpenAddSchedulePopup = () => {
    setShowAddSchedulePopup(true);
  };

  // 일정 추가 팝업 닫기
  const handleCloseAddSchedulePopup = () => {
    setShowAddSchedulePopup(false);
  };
  
  // 일정 추가 처리
  const handleSubmitSchedule = async (newSchedule) => {
    setIsAdding(true);
    
    try {
      // API 요청을 통한 일정 추가
      const success = await onAddSchedule(newSchedule);
      
      if (success) {
        // 성공 시 모달 닫기
        handleCloseAddSchedulePopup();
      }
    } catch (error) {
      console.error('[ScheduleTab] 일정 추가 실패:', error);
    } finally {
      setIsAdding(false);
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
          onClick={handleOpenAddSchedulePopup}
          disabled={isLoading || isAdding}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isLoading || isAdding ? '#cccccc' : '#FF0000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || isAdding ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isLoading || isAdding ? '처리중...' : '일정 추가'}
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
              key={schedule.scheduleId || schedule.id}
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
                onClick={() => handleDeleteSchedule(schedule.scheduleId || schedule.id)}
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
                  {schedule.date}
                </span>
                {schedule.title && (
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginLeft: '1rem'
                  }}>
                    - {schedule.title}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#333333',
                whiteSpace: 'pre-line',
                lineHeight: '1.6'
              }}>
                {schedule.content}
              </div>
            </div>
          ))}
        </>
      )}
      
      {/* 일정 추가 모달 */}
      {showAddSchedulePopup && (
        <AddScheduleModal
          onClose={handleCloseAddSchedulePopup}
          onSubmit={handleSubmitSchedule}
          initialRound={schedules.length > 0 ? Math.max(...schedules.map(s => s.round)) + 1 : 1}
          isSubmitting={isAdding}
        />
      )}
    </div>
  );
}

ScheduleTab.propTypes = {
  schedules: PropTypes.array.isRequired,
  onAddSchedule: PropTypes.func.isRequired,
  onDeleteSchedule: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

ScheduleTab.defaultProps = {
  isLoading: false,
  error: null
};

export default ScheduleTab; 