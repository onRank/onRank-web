import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { studyService } from '../../services/api';
import { IoChevronBackOutline } from 'react-icons/io5';

function ScheduleAddPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleContent, setScheduleContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 폼 유효성 검증
  const isFormValid = scheduleTitle.trim() !== '' && scheduleDate !== '';

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
        title: scheduleTitle.trim(),
        content: scheduleContent.trim(),
        date: scheduleDate,
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

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem 1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <Link 
          to={`/studies/${studyId}/schedules`}
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#333',
            marginRight: '1rem'
          }}
        >
          <IoChevronBackOutline size={20} />
        </Link>
        <h1 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0
        }}>
          일정 등록
        </h1>
      </div>
      
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FFEBEE',
          color: '#D32F2F',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="scheduleTitle"
            style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            제목 <span style={{ color: '#FF0000' }}>*</span>
          </label>
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
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: isSubmitting ? '#f5f5f5' : 'white'
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
              fontSize: '14px'
            }}
          >
            날짜 <span style={{ color: '#FF0000' }}>*</span>
          </label>
          <input
            id="scheduleDate"
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: isSubmitting ? '#f5f5f5' : 'white'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="scheduleContent"
            style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              fontSize: '14px'
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
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '200px',
              resize: 'vertical',
              backgroundColor: isSubmitting ? '#f5f5f5' : 'white'
            }}
          />
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
            {scheduleContent.length}/10000
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <Link
            to={`/studies/${studyId}/schedules`}
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
          </Link>
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
            {isSubmitting ? '처리 중...' : '업로드'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleAddPage; 