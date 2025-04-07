import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IoChevronBackOutline } from "react-icons/io5";
import { useTheme } from '../../../contexts/ThemeContext';
import TimeSelector from '../../../components/common/TimeSelector';
import { formatDateYMD as formatDate, formatTime, formatDateTime } from '../../../utils/dateUtils';
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
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="scheduleTitle"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: colors.textPrimary
              }}
            >
              제목
            </label>
            <input
              id="scheduleTitle"
              type="text"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: `1px solid ${colors.border}`,
                fontSize: '14px',
                backgroundColor: colors.cardBackground,
                color: colors.text
              }}
              placeholder="일정 제목을 입력하세요"
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label 
                htmlFor="scheduleDate"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: colors.textPrimary
                }}
              >
                날짜
              </label>
              <input
                id="scheduleDate"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: `1px solid ${colors.border}`,
                  fontSize: '14px',
                  backgroundColor: colors.cardBackground,
                  color: colors.text
                }}
                required
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label 
                htmlFor="scheduleTime"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: colors.textPrimary
                }}
              >
                시간
              </label>
              <input
                id="scheduleTime"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: `1px solid ${colors.border}`,
                  fontSize: '14px',
                  backgroundColor: colors.cardBackground,
                  color: colors.text
                }}
                required
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="scheduleContent"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: colors.textPrimary
              }}
            >
              내용
            </label>
            <textarea
              id="scheduleContent"
              value={scheduleContent}
              onChange={(e) => setScheduleContent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: `1px solid ${colors.border}`,
                fontSize: '14px',
                backgroundColor: colors.cardBackground,
                color: colors.text,
                minHeight: '150px',
                resize: 'vertical'
              }}
              placeholder="일정 내용을 입력하세요"
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={handleDeleteSchedule}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: colors.error,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: isSubmitting ? 0.7 : 1,
                pointerEvents: isSubmitting ? 'none' : 'auto'
              }}
              disabled={isSubmitting}
            >
              삭제하기
            </button>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={onBack}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e5e5e5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: isSubmitting ? 0.7 : 1,
                  pointerEvents: isSubmitting ? 'none' : 'auto'
                }}
                disabled={isSubmitting}
              >
                취소
              </button>
              
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: isSubmitting || !isFormValid ? 0.7 : 1,
                  pointerEvents: isSubmitting || !isFormValid ? 'none' : 'auto'
                }}
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? '저장 중...' : '저장하기'}
              </button>
            </div>
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

ScheduleDetailView.defaultProps = {
  isLoading: false
};

export default ScheduleDetailView; 