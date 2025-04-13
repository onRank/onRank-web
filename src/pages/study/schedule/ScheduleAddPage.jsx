import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { tokenUtils } from '../../../utils/tokenUtils';
import { useTheme } from '../../../contexts/ThemeContext';
import TimeSelector from '../../../components/common/TimeSelector';
import PropTypes from 'prop-types';

function ScheduleAddPage({ onCancel }) {
  const { studyId } = useParams();
  const { colors } = useTheme();
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('00:00');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 일정 목록을 가져와서 회차 번호 계산
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const schedules = await studyService.getSchedules(studyId);
        // 새 일정 회차는 현재 일정 갯수 + 1
        if (schedules && schedules.length > 0) {
          setDate(schedules[schedules.length - 1].date);
        }
      } catch (error) {
        console.error("[ScheduleAddPage] 일정 목록 조회 실패:", error);
      }
    };
    
    fetchSchedules();
  }, [studyId]);
  
  // 새로고침 감지 및 리다이렉트 처리
  useEffect(() => {
    const handleBeforeUnload = () => {
      const token = tokenUtils.getToken();
      if (!token) {
        window.location.href = `https://d37q7cndbbsph5.cloudfront.net/studies/${studyId}/schedules`;
        return null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 컴포넌트 마운트 시에도 토큰 체크
    const token = tokenUtils.getToken();
    if (!token) {
      window.location.href = `https://d37q7cndbbsph5.cloudfront.net/studies/${studyId}/schedules`;
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [studyId]);
  
  // 폼 유효성 검증 - 제목, 날짜, 시간 모두 필수
  const isFormValid = title.trim() !== '' && date !== '' && time !== '';

  // 일정 추가 제출
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
        title: title.trim(),
        content: content.trim(),
        date: date,
        time: time,
      };
      
      // API 호출
      const result = await studyService.addSchedule(studyId, scheduleData);
      console.log("[ScheduleAddPage] 일정 추가 성공:", result);
      
      // 성공 시 일정 목록 페이지로 이동
      if (onCancel) onCancel();
    } catch (error) {
      console.error("[ScheduleAddPage] 일정 추가 실패:", error);
      setError(`일정 추가에 실패했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ color: colors.textPrimary }}>일정 추가</h2>
      <div style={{
        backgroundColor: colors.cardBackground,
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '800px',
        margin: '2rem auto',
        border: `1px solid ${colors.border}`
      }}>
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
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.textPrimary }}>제목</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일정 제목을 입력하세요"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: colors.inputBackground,
              color: colors.textPrimary
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.textPrimary }}>날짜 <span style={{ color: colors.primary }}>*</span></h3>
          <div 
            style={{ 
              position: 'relative', 
              width: '100%',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('date-input').showPicker()}
          >
            <input
              id="date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: colors.inputBackground,
                color: colors.textPrimary,
                cursor: 'pointer'
              }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.textPrimary }}>시간 <span style={{ color: colors.primary }}>*</span></h3>
          <TimeSelector 
            value={time}
            onChange={setTime}
            disabled={isSubmitting}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: colors.textPrimary }}>내용을 입력해주세요</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="일정에 대한 설명을 입력하세요"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              fontSize: '16px',
              minHeight: '200px',
              resize: 'vertical',
              backgroundColor: colors.inputBackground,
              color: colors.textPrimary
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '0.75rem 2rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              backgroundColor: colors.buttonBackground,
              color: colors.buttonText,
              cursor: 'pointer'
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: isFormValid && !isSubmitting ? colors.primary : '#CCCCCC',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: isFormValid && !isSubmitting ? 'pointer' : 'not-allowed'
            }}
          >
            작성
          </button>
        </div>
      </div>
    </div>
  );
}

ScheduleAddPage.propTypes = {
  onCancel: PropTypes.func
};

export default ScheduleAddPage; 