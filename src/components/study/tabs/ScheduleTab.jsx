import { useState } from 'react';
import PropTypes from 'prop-types';
import AddScheduleModal from '../modals/AddScheduleModal';

function ScheduleTab({ schedules, setSchedules }) {
  const [showAddSchedulePopup, setShowAddSchedulePopup] = useState(false);

  // 일정 추가 팝업 열기
  const handleOpenAddSchedulePopup = () => {
    setShowAddSchedulePopup(true);
  };

  // 일정 추가 팝업 닫기
  const handleCloseAddSchedulePopup = () => {
    setShowAddSchedulePopup(false);
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
          style={{
            padding: '0.5rem 1rem',
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
      
      {schedules.length === 0 ? (
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
          {schedules.map((schedule) => (
            <div 
              key={schedule.id}
              style={{
                marginBottom: '2rem',
                width: '100%',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                padding: '1.5rem'
              }}
            >
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
          onSubmit={(newSchedule) => {
            setSchedules([...schedules, newSchedule]);
            handleCloseAddSchedulePopup();
          }}
          initialRound={schedules.length > 0 ? schedules[schedules.length - 1].round + 1 : 1}
        />
      )}
    </div>
  );
}

ScheduleTab.propTypes = {
  schedules: PropTypes.array.isRequired,
  setSchedules: PropTypes.func.isRequired
};

export default ScheduleTab; 