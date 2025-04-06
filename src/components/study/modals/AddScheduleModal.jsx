import { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { useTheme } from '../../../contexts/ThemeContext';

function AddScheduleModal({ onClose, onSubmit, initialRound, initialTitle, initialDescription, initialDate, initialTime, isSubmitting }) {
  const { colors } = useTheme();
  const [scheduleTitle, setScheduleTitle] = useState(initialTitle || '');
  const [scheduleDescription, setScheduleDescription] = useState(initialDescription || '');
  const [scheduleRound, setScheduleRound] = useState(initialRound || 1);
  const [scheduleDate] = useState(initialDate || format(new Date(), 'yyyy.MM.dd'));
  const [scheduleTime, setScheduleTime] = useState(initialTime || '00:00');
  
  // 폼 유효성 검증 - 제목과 시간은 필수
  const isFormValid = scheduleTitle.trim() !== '' && scheduleTime !== '';

  // 일정 추가 제출
  const handleSubmitSchedule = () => {
    if (!isFormValid) return;
    
    // 새 일정 객체 생성
    const newSchedule = {
      round: scheduleRound,
      title: scheduleTitle.trim(),
      description: scheduleDescription.trim(),
      date: scheduleDate,
      time: scheduleTime // 시간 정보 추가
    };

    // 부모 컴포넌트에 전달
    onSubmit(newSchedule);
  };

  // 모달 제목 설정 (추가 또는 수정)
  const modalTitle = initialTitle ? '일정 수정' : '일정 추가';
  const submitButtonText = initialTitle ? '수정하기' : '추가하기';

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
        backgroundColor: colors.cardBackground,
        borderRadius: '8px',
        padding: '2rem',
        width: '500px',
        maxWidth: '90%',
        boxShadow: `0 4px 6px ${colors.shadowColor}`,
        border: `1px solid ${colors.border}`
      }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: '1.5rem',
          fontSize: '18px',
          fontWeight: 'bold',
          color: colors.textPrimary
        }}>
          {modalTitle}
        </h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '14px',
            color: colors.textPrimary
          }}>
            일정 제목 <span style={{ color: colors.primary }}>*</span>
          </label>
          <input
            type="text"
            value={scheduleTitle}
            onChange={(e) => setScheduleTitle(e.target.value)}
            placeholder="일정 제목을 입력하세요"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: isSubmitting ? colors.hoverBackground : colors.inputBackground,
              color: colors.textPrimary
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '14px',
            color: colors.textPrimary
          }}>
            일정 설명
          </label>
          <textarea
            value={scheduleDescription}
            onChange={(e) => setScheduleDescription(e.target.value)}
            placeholder="일정에 대한 설명을 입력하세요"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '100px',
              resize: 'vertical',
              backgroundColor: isSubmitting ? colors.hoverBackground : colors.inputBackground,
              color: colors.textPrimary
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '14px',
            color: colors.textPrimary
          }}>
            날짜
          </label>
          <input
            type="text"
            value={scheduleDate}
            disabled
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: colors.hoverBackground,
              color: colors.textSecondary
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '14px',
            color: colors.textPrimary
          }}>
            시간 <span style={{ color: colors.primary }}>*</span>
          </label>
          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: isSubmitting ? colors.hoverBackground : colors.inputBackground,
              color: colors.textPrimary
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '14px',
            color: colors.textPrimary
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
              disabled={isSubmitting || scheduleRound <= 1}
              style={{
                padding: '0.75rem 1.5rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                backgroundColor: isSubmitting || scheduleRound <= 1 ? colors.hoverBackground : colors.buttonBackground,
                cursor: isSubmitting || scheduleRound <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                width: '120px',
                color: colors.buttonText
              }}
            >
              - 이전 회차
            </button>
            <div style={{
              padding: '0.75rem',
              fontSize: '16px',
              fontWeight: 'bold',
              color: colors.textPrimary
            }}>
              {scheduleRound} 회차
            </div>
            <button
              onClick={() => setScheduleRound(scheduleRound + 1)}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                backgroundColor: isSubmitting ? colors.hoverBackground : colors.buttonBackground,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                width: '120px',
                color: colors.buttonText
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
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              backgroundColor: colors.buttonBackground,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              color: colors.buttonText
            }}
          >
            취소하기
          </button>
          <button
            onClick={handleSubmitSchedule}
            disabled={isSubmitting || !isFormValid}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: isSubmitting || !isFormValid ? '#cccccc' : colors.primary,
              color: 'white',
              cursor: isSubmitting || !isFormValid ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isSubmitting ? '처리 중...' : submitButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

AddScheduleModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialRound: PropTypes.number,
  initialTitle: PropTypes.string,
  initialDescription: PropTypes.string,
  initialDate: PropTypes.string,
  initialTime: PropTypes.string,
  isSubmitting: PropTypes.bool
};

AddScheduleModal.defaultProps = {
  initialRound: 1,
  initialTitle: '',
  initialDescription: '',
  initialDate: '',
  initialTime: '',
  isSubmitting: false
};

export default AddScheduleModal; 