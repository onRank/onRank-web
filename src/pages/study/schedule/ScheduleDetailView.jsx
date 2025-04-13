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
  isLoading,
  memberRole
}) => {
  const { colors } = useTheme();
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleContent, setScheduleContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('00:00');
  const [scheduleRound, setScheduleRound] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 관리자 권한 확인
  const isManager = memberRole === 'HOST' || memberRole === 'ADMIN' || memberRole === 'OWNER';

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
      
      // 수정 API 호출
      const success = await onUpdate(schedule.scheduleId, scheduleData);
      
      if (success) {
        onBack(); // 수정 성공 시 목록으로 돌아가기
      }
    } catch (error) {
      console.error("[ScheduleDetailView] 일정 수정 실패:", error);
      setError(`일정 수정에 실패했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 일정 삭제
  const handleDelete = async () => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      try {
        setIsSubmitting(true);
        await onDelete(schedule.scheduleId);
        onBack(); // 삭제 성공 시 목록으로 돌아가기
      } catch (error) {
        console.error("[ScheduleDetailView] 일정 삭제 실패:", error);
        setError(`일정 삭제에 실패했습니다: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: colors.text
          }}
        >
          <IoChevronBackOutline size={24} />
        </button>
        <h2 style={{
          margin: 0,
          marginLeft: '0.5rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: colors.text
        }}>
          일정 상세
        </h2>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: `${colors.error}20`,
          color: colors.error,
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* 일정 수정 폼 - 관리자 권한이 있을 때만 수정 가능하게 */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.text,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            제목 <span style={{ color: '#FF0000' }}>*</span>
          </label>
          <input
            type="text"
            value={scheduleTitle}
            onChange={(e) => setScheduleTitle(e.target.value)}
            disabled={!isManager || isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: isManager ? colors.background : colors.hoverBackground,
              color: colors.text
            }}
            placeholder="일정 제목을 입력하세요"
            readOnly={!isManager}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.text,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            날짜 <span style={{ color: '#FF0000' }}>*</span>
          </label>
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            disabled={!isManager || isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: isManager ? colors.background : colors.hoverBackground,
              color: colors.text
            }}
            readOnly={!isManager}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.text,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            시간 <span style={{ color: '#FF0000' }}>*</span>
          </label>
          <TimeSelector
            value={scheduleTime}
            onChange={setScheduleTime}
            disabled={!isManager || isSubmitting}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.text,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            내용
          </label>
          <textarea
            value={scheduleContent}
            onChange={(e) => setScheduleContent(e.target.value)}
            disabled={!isManager || isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '150px',
              resize: 'vertical',
              backgroundColor: isManager ? colors.background : colors.hoverBackground,
              color: colors.text
            }}
            placeholder="일정 내용을 입력하세요"
            readOnly={!isManager}
          />
        </div>

        {/* 관리자만 버튼 표시 */}
        {isManager && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '2rem'
          }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: colors.error,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              삭제
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: (!isFormValid || isSubmitting) ? 0.7 : 1
              }}
            >
              수정
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

ScheduleDetailView.propTypes = {
  schedule: PropTypes.shape({
    scheduleId: PropTypes.number.isRequired,
    scheduleTitle: PropTypes.string.isRequired,
    scheduleContent: PropTypes.string,
    scheduleStartingAt: PropTypes.string,
    round: PropTypes.number
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  memberRole: PropTypes.string
};

ScheduleDetailView.defaultProps = {
  isLoading: false,
  memberRole: ''
};

export default ScheduleDetailView; 