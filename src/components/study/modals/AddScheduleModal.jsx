import { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

function AddScheduleModal({ onClose, onSubmit, initialRound }) {
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleRound, setScheduleRound] = useState(initialRound || 1);

  // 일정 추가 제출
  const handleSubmitSchedule = () => {
    // 새 일정 객체 생성
    const newSchedule = {
      id: Date.now(), // 임시 ID 생성
      round: scheduleRound,
      date: format(new Date(), 'yyyy.MM.dd'),
      content: `${scheduleRound}회차 - ${scheduleTitle}\n${scheduleDescription}`
    };

    // 부모 컴포넌트에 전달
    onSubmit(newSchedule);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        width: '500px',
        maxWidth: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: '1.5rem',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          일정 추가
        </h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            일정 제목
          </label>
          <input
            type="text"
            value={scheduleTitle}
            onChange={(e) => setScheduleTitle(e.target.value)}
            placeholder="일정 제목을 입력하세요"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            일정 설명
          </label>
          <textarea
            value={scheduleDescription}
            onChange={(e) => setScheduleDescription(e.target.value)}
            placeholder="일정에 대한 설명을 입력하세요"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            날짜
          </label>
          <input
            type="text"
            value={format(new Date(), 'yyyy.MM.dd')}
            disabled
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#f5f5f5',
              color: '#666'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            회차
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={() => setScheduleRound(Math.max(1, scheduleRound - 1))}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                width: '120px'
              }}
            >
              - 이전 회차
            </button>
            <div style={{
              padding: '0.75rem',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {scheduleRound} 회차
            </div>
            <button
              onClick={() => setScheduleRound(scheduleRound + 1)}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                width: '120px'
              }}
            >
              다음 회차 +
            </button>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            취소하기
          </button>
          <button
            onClick={handleSubmitSchedule}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#FF0000',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}

AddScheduleModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialRound: PropTypes.number
};

export default AddScheduleModal; 