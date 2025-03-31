import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studyService } from '../../services/api';
import { tokenUtils } from '../../utils/tokenUtils';
import StudySidebar from '../../components/study/StudySidebar';

function ScheduleAddPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
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
  
  // 폼 유효성 검증
  const isFormValid = title.trim() !== '' && date !== '';

  // 일정 추가 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError('제목과 날짜는 필수입니다.');
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
      };
      
      // API 호출
      const result = await studyService.addSchedule(studyId, scheduleData);
      console.log("[ScheduleAddPage] 일정 추가 성공:", result);
      
      // 성공 시 일정 목록 페이지로 이동
      navigate(`/studies/${studyId}/schedules`);
    } catch (error) {
      console.error("[ScheduleAddPage] 일정 추가 실패:", error);
      setError(`일정 추가에 실패했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/studies/${studyId}/schedules`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <StudySidebar activeTab="일정" />
      <div style={{ flex: 1, padding: '2rem' }}>
        <h2>일정</h2>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '800px',
          margin: '2rem auto'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3>제목</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>날짜 <span style={{ color: '#FF0000' }}>*</span></h3>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>내용을 입력해주세요</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="일정에 대한 설명을 입력하세요"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                fontSize: '16px',
                minHeight: '200px',
                resize: 'vertical'
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
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!date}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: date ? '#FF0000' : '#CCCCCC',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: date ? 'pointer' : 'not-allowed'
              }}
            >
              작성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleAddPage; 