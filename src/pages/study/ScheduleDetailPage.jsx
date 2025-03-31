import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { studyService } from '../../services/api';
import { IoChevronBackOutline } from 'react-icons/io5';

function ScheduleDetailPage() {
  const { studyId, scheduleId } = useParams();
  const navigate = useNavigate();
  
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleContent, setScheduleContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleRound, setScheduleRound] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 일정 데이터 조회
  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const schedule = await studyService.getScheduleById(studyId, scheduleId);
        console.log("[ScheduleDetailPage] 일정 조회 성공:", schedule);
        
        // 날짜 형식 변환 (ISO 날짜에서 yyyy-MM-dd 형식으로)
        let dateString = '';
        if (schedule.scheduleStartingAt) {
          dateString = schedule.scheduleStartingAt.split('T')[0];
        }
        
        setScheduleTitle(schedule.scheduleTitle || '');
        setScheduleContent(schedule.scheduleContent || '');
        setScheduleDate(dateString);
        setScheduleRound(schedule.round || 1);
        
      } catch (error) {
        console.error("[ScheduleDetailPage] 일정 조회 실패:", error);
        setError("일정을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScheduleDetails();
  }, [studyId, scheduleId]);
  
  // 폼 유효성 검증
  const isFormValid = scheduleTitle.trim() !== '' && scheduleDate !== '';

  // 일정 수정 제출
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
        date: scheduleDate
      };
      
      // API 호출
      const result = await studyService.updateSchedule(studyId, scheduleId, scheduleData);
      console.log("[ScheduleDetailPage] 일정 수정 성공:", result);
      
      // 성공 시 일정 목록 페이지로 이동
      navigate(`/studies/${studyId}/schedules`);
    } catch (error) {
      console.error("[ScheduleDetailPage] 일정 수정 실패:", error);
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
        
        // API 호출
        await studyService.deleteSchedule(studyId, scheduleId);
        console.log("[ScheduleDetailPage] 일정 삭제 성공");
        
        // 성공 시 일정 목록 페이지로 이동
        navigate(`/studies/${studyId}/schedules`);
      } catch (error) {
        console.error("[ScheduleDetailPage] 일정 삭제 실패:", error);
        setError(`일정 삭제에 실패했습니다: ${error.message}`);
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem',
        textAlign: 'center'
      }}>
        <div style={{ marginTop: '2rem' }}>
          일정 정보를 불러오는 중입니다...
        </div>
      </div>
    );
  }

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
          일정
        </h1>
      </div>
      
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#F8F9FA',
        borderRadius: '8px'
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
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <div style={{
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            marginBottom: '1rem',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            제목
          </div>
          
          <div style={{
            display: 'flex',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontWeight: 'bold',
              marginRight: '0.5rem'
            }}>
              {scheduleRound}회차
            </div>
            <div style={{
              color: '#666666',
              fontSize: '14px',
              marginRight: '0.5rem'
            }}>
              ({scheduleDate || '날짜 선택'})
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
              {isSubmitting ? '처리 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleDetailPage; 