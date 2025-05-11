import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IoChevronBackOutline } from "react-icons/io5";
import { useTheme } from '../../../contexts/ThemeContext';
import useStudyRole from '../../../hooks/useStudyRole';
import TimeSelector from '../../../components/common/TimeSelector';
import Button from '../../../components/common/Button';
import { formatDateYMD as formatDate, formatTime, formatDateTime } from '../../../utils/dateUtils';
import './ScheduleDetailView.css';

const ScheduleDetailView = ({ 
  schedule, 
  onBack, 
  onUpdate, 
  onDelete, 
  isLoading
}) => {
  const { colors } = useTheme();
  const { isManager } = useStudyRole();
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleContent, setScheduleContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('00:00');
  const [scheduleRound, setScheduleRound] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 관리자 권한 확인하여 출력 (디버그용)
  useEffect(() => {
    console.log('[ScheduleDetailView] 관리자 권한 여부:', isManager);
  }, [isManager]);

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
  const isFormValid = scheduleTitle.trim() !== '' && scheduleDate !== '' && scheduleTime !== '' && scheduleContent.trim() !== '';

  // 일정 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError('제목, 날짜, 시간, 내용은 필수입니다.');
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
  
  // 내용 변경 핸들러 - 최대 10000자 제한
  const handleContentChange = (e) => {
    const value = e.target.value;
    if (value.length <= 10000) {
      setScheduleContent(value);
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
    <div className="schedule-detail-container">
      {/* 헤더 */}
      <div className="schedule-detail-header">
        <button
          onClick={onBack}
          className="back-button"
          style={{ color: colors.text }}
        >
          <IoChevronBackOutline size={24} />
        </button>
        <h2 className="schedule-detail-title" style={{ color: colors.text }}>
          일정 수정
        </h2>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="schedule-error" style={{
          backgroundColor: `${colors.error}20`,
          color: colors.error
        }}>
          {error}
        </div>
      )}

      {/* 일정 수정 폼 - 관리자 권한이 있을 때만 수정 가능하게 */}
      <form onSubmit={handleSubmit}>
        <div className="field-container">
          <label className="field-label">
            <span className="required-mark">*</span>
            제목
          </label>
          <input
            type="text"
            value={scheduleTitle}
            onChange={(e) => setScheduleTitle(e.target.value)}
            disabled={!isManager || isSubmitting}
            className="form-input"
            style={{
              border: `1px solid ${colors.border}`,
              backgroundColor: isManager ? colors.background : colors.hoverBackground,
              color: colors.text
            }}
            placeholder="일정 제목을 입력하세요"
            readOnly={!isManager}
          />
        </div>

        <div className="field-container">
          <label className="field-label">
            <span className="required-mark">*</span>
            날짜
          </label>
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            disabled={!isManager || isSubmitting}
            className="form-input"
            style={{
              border: `1px solid ${colors.border}`,
              backgroundColor: isManager ? colors.background : colors.hoverBackground,
              color: colors.text
            }}
            readOnly={!isManager}
          />
        </div>

        <div className="field-container">
          <label className="field-label">
            <span className="required-mark">*</span>
            시간
          </label>
          <TimeSelector
            value={scheduleTime}
            onChange={setScheduleTime}
            disabled={!isManager || isSubmitting}
          />
        </div>

        <div className="field-container">
          <label className="field-label">
            <span className="required-mark">*</span>
            내용
          </label>
          <div className="textarea-container">
            <textarea
              value={scheduleContent}
              onChange={handleContentChange}
              disabled={!isManager || isSubmitting}
              className="form-input"
              style={{
                border: `1px solid ${colors.border}`,
                backgroundColor: isManager ? colors.background : colors.hoverBackground,
                color: colors.text,
                minHeight: '200px',
                resize: 'vertical'
              }}
              placeholder="일정 내용을 입력하세요"
              readOnly={!isManager}
              maxLength={10000}
            />
            <div className="char-counter" style={{ color: colors.textSecondary }}>
              {scheduleContent.length}/10000
            </div>
          </div>
        </div>

        {/* 관리자만 버튼 표시 */}
        {isManager && (
          <div className="button-container">
            <Button 
              variant="store" 
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              style={{ 
                width: '84px', 
                height: '40px',
                opacity: isFormValid && !isSubmitting ? 1 : 0.5,
                cursor: isFormValid && !isSubmitting ? 'pointer' : 'not-allowed'
              }}
            />
            <Button 
              variant="back" 
              label="닫기" 
              onClick={onBack}
              style={{ width: '84px', height: '40px' }}
            />
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
  isLoading: PropTypes.bool
};

ScheduleDetailView.defaultProps = {
  isLoading: false
};

export default ScheduleDetailView; 