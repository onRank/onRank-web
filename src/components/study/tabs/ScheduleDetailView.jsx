import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IoChevronBackOutline } from "react-icons/io5";
import { useTheme } from '../../../contexts/ThemeContext';

const ScheduleDetailView = ({ 
  schedule, 
  onBack, 
  onUpdate, 
  onDelete, 
  isLoading 
}) => {
  const { colors } = useTheme();
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleContent, setScheduleContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('00:00');
  const [scheduleRound, setScheduleRound] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 컴포넌트 마운트 시 schedule 데이터로 폼 초기화
  useEffect(() => {
    if (schedule) {
      // 날짜 형식 변환 (ISO 날짜에서 yyyy-MM-dd 형식으로)
      let dateString = '';
      let timeString = '00:00';
      
      if (schedule.scheduleStartingAt) {
        const dateTimeParts = schedule.scheduleStartingAt.split('T');
        if (dateTimeParts.length >= 2) {
          dateString = dateTimeParts[0];
          // 시간 부분에서 초 제외하고 시:분 만 사용
          timeString = dateTimeParts[1].substring(0, 5);
        } else {
          dateString = schedule.scheduleStartingAt;
        }
      }
      
      setScheduleTitle(schedule.scheduleTitle || '');
      setScheduleContent(schedule.scheduleContent || '');
      setScheduleDate(dateString);
      setScheduleTime(timeString);
      setScheduleRound(schedule.round || 1);
    }
  }, [schedule]);
  
  // 폼 유효성 검증
  const isFormValid = scheduleTitle.trim() !== '' && scheduleDate !== '' && scheduleTime !== '';

  // 일정 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError('제목, 날짜, 시간은 필수입니다.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // API 요청 데이터 형식으로 변환
      const scheduleData = {
        title: scheduleTitle.trim(),
        content: scheduleContent.trim(),
        date: scheduleDate,
        time: scheduleTime
      };
      
      // 부모 컴포넌트의 수정 핸들러 호출
      const success = await onUpdate(schedule.scheduleId, scheduleData);
      
      if (success) {
        // 성공 시 목록 화면으로 돌아가기
        onBack();
      }
    } catch (error) {
      console.error("[ScheduleDetailView] 일정 수정 실패:", error);
      setError(`일정 수정에 실패했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 일정 삭제 처리
  const handleDeleteSchedule = async () => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      try {
        setIsSubmitting(true);
        
        // 부모 컴포넌트의 삭제 핸들러 호출
        const success = await onDelete(schedule.scheduleId);
        
        if (success) {
          // 성공 시 목록 화면으로 돌아가기
          onBack();
        }
      } catch (error) {
        console.error("[ScheduleDetailView] 일정 삭제 실패:", error);
        setError(`일정 삭제에 실패했습니다: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: '#333',
            marginRight: '1rem',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <IoChevronBackOutline size={20} />
        </button>
        <h1 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0
        }}>
          일정
        </h1>
      </div>
      
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#F8F9FA',
        borderRadius: '8px',
        width: '100%'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginTop: 0,
          marginBottom: '1rem'
        }}>
          일정 상세
        </h2>
        <div style={{
          color: '#666',
          fontSize: '14px'
        }}>
          일정을 조회하고 수정할 수 있습니다.
        </div>
      </div>
      
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FFEBEE',
          color: '#D32F2F',
          borderRadius: '4px',
          marginBottom: '1rem',
          width: '100%'
        }}>
          {error}
        </div>
      )}
      
      <div style={{
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem',
        width: '100%',
        backgroundColor: colors.cardBackground,
        borderColor: colors.border
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            marginBottom: '1rem',
            fontSize: '16px',
            fontWeight: 'bold',
            color: colors.textPrimary
          }}>
            {scheduleTitle || '제목 없음'}
          </div>
          
          <div style={{
            display: 'flex',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontWeight: 'bold',
              marginRight: '0.5rem',
              color: colors.textPrimary
            }}>
              {scheduleRound}회차
            </div>
            <div style={{
              color: colors.textSecondary,
              fontSize: '14px',
              marginRight: '0.5rem'
            }}>
              ({scheduleDate || '날짜 선택'} {scheduleTime})
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              id="scheduleTitle"
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
            <label 
              htmlFor="scheduleDate"
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: colors.textPrimary
              }}
            >
              날짜 <span style={{ color: colors.primary }}>*</span>
            </label>
            <div 
              style={{ 
                position: 'relative', 
                width: '100%',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onClick={() => !isSubmitting && document.getElementById('scheduleDate').showPicker()}
            >
              <input
                id="scheduleDate"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: isSubmitting ? colors.hoverBackground : colors.inputBackground,
                  color: colors.textPrimary,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="scheduleTime"
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: colors.textPrimary
              }}
            >
              시간 <span style={{ color: colors.primary }}>*</span>
            </label>
            <div 
              style={{ 
                position: 'relative', 
                width: '100%',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onClick={() => !isSubmitting && document.getElementById('scheduleTime').showPicker()}
            >
              <input
                id="scheduleTime"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                step="300"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: isSubmitting ? colors.hoverBackground : colors.inputBackground,
                  color: colors.textPrimary,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              />
              <div style={{
                position: 'absolute',
                right: '10px', 
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textSecondary,
                pointerEvents: 'none',
                fontSize: '12px'
              }}>
                5분 단위
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="scheduleContent"
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: colors.textPrimary
              }}
            >
              내용을 입력해주세요
            </label>
            <textarea
              id="scheduleContent"
              value={scheduleContent}
              onChange={(e) => setScheduleContent(e.target.value)}
              placeholder="일정에 대한 설명을 입력하세요"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '200px',
                resize: 'vertical',
                backgroundColor: isSubmitting ? colors.hoverBackground : colors.inputBackground,
                color: colors.textPrimary
              }}
            />
            <div style={{ textAlign: 'right', fontSize: '12px', color: colors.textSecondary }}>
              {scheduleContent.length}/10000
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <button
              type="button"
              onClick={handleDeleteSchedule}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 2rem',
                border: '1px solid #f44336',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#f44336',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'inline-block',
                textAlign: 'center'
              }}
            >
              삭제하기
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: '0.75rem 2rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                textDecoration: 'none',
                color: '#333',
                display: 'inline-block',
                textAlign: 'center'
              }}
            >
              취소하기
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              style={{
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: isSubmitting || !isFormValid ? '#cccccc' : '#FF0000',
                color: 'white',
                cursor: isSubmitting || !isFormValid ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isSubmitting ? '처리 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ScheduleDetailView.propTypes = {
  schedule: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default ScheduleDetailView; 