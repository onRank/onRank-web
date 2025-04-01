import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScheduleTab from "./tabs/ScheduleTab";
import AssignmentTab from "./tabs/AssignmentTab";
import DefaultContent from "./tabs/DefaultContent";
import ManagementTab from "./tabs/ManagementTab";
import { studyService } from "../../services/api";
import NoticeList from "./notice/NoticeList";
import { IoChevronBackOutline } from "react-icons/io5";

// 일정 상세 컴포넌트
const ScheduleDetailView = ({ 
  schedule, 
  onBack, 
  onUpdate, 
  onDelete, 
  isLoading 
}) => {
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleContent, setScheduleContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleRound, setScheduleRound] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 컴포넌트 마운트 시 schedule 데이터로 폼 초기화
  useEffect(() => {
    if (schedule) {
      // 날짜 형식 변환 (ISO 날짜에서 yyyy-MM-dd 형식으로)
      let dateString = '';
      if (schedule.scheduleStartingAt) {
        dateString = schedule.scheduleStartingAt.split('T')[0];
      }
      
      setScheduleTitle(schedule.scheduleTitle || '');
      setScheduleContent(schedule.scheduleContent || '');
      setScheduleDate(dateString);
      setScheduleRound(schedule.round || 1);
    }
  }, [schedule]);
  
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
        width: '100%'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            marginBottom: '1rem',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {scheduleTitle || '제목 없음'}
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

// 출석 상세 컴포넌트
const AttendanceDetailView = ({ onBack }) => {
  const { studyId, scheduleId } = useParams();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studyService.getAttendanceDetails(studyId, scheduleId);
        setAttendances(data);
      } catch (error) {
        console.error('[AttendanceDetailView] 출석 상세 정보 조회 실패:', error);
        setError('출석 상세 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceDetails();
  }, [studyId, scheduleId]);

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      await studyService.updateAttendanceStatus(studyId, attendanceId, newStatus);
      const updatedData = await studyService.getAttendanceDetails(studyId, scheduleId);
      setAttendances(updatedData);
    } catch (error) {
      console.error('[AttendanceDetailView] 출석 상태 변경 실패:', error);
      alert('출석 상태 변경에 실패했습니다.');
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: '#F44336' }}>{error}</div>;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2>출석 현황</h2>
        <button
          onClick={onBack}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #E5E5E5',
            borderRadius: '4px',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer'
          }}
        >
          목록으로
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem'
      }}>
        {attendances.map((attendance) => (
          <div
            key={attendance.attendanceId}
            style={{
              padding: '1rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {attendance.studentName}
              </div>
              <div style={{ fontSize: '14px', color: '#666666' }}>
                {new Date(attendance.scheduleStartingAt).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {Object.entries(STATUS_STYLES).map(([status, style]) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(attendance.attendanceId, status)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: attendance.attendanceStatus === status ? style.color : '#E5E5E5',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  title={style.label}
                >
                  {style.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 출석 상세 컴포넌트
function StudyContent({ activeTab, studyData }) {
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { studyId, scheduleId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [showAttendanceDetail, setShowAttendanceDetail] = useState(false);

  // ISO 날짜 문자열을 'yyyy.MM.dd' 형식으로 변환하는 함수
  const formatDate = (isoDateString) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 일정 목록 조회
  useEffect(() => {
    if (activeTab === "일정") {
      const fetchSchedules = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const data = await studyService.getSchedules(studyId);
          console.log("[StudyContent] 일정 데이터 조회 성공:", data);
          
          // 응답 데이터 변환 (날짜 형식 변환)
          const formattedData = data.map(schedule => ({
            ...schedule,
            formattedDate: formatDate(schedule.scheduleStartingAt)
          }));
          
          setSchedules(formattedData);
        } catch (error) {
          console.error("[StudyContent] 일정 데이터 조회 실패:", error);
          setError("일정을 불러오는 중 오류가 발생했습니다.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchSchedules();
    }
  }, [activeTab, studyId]);

  useEffect(() => {
    if (activeTab === "과제") {
      // TODO: API 연동 후 과제 목록 불러오기
      setAssignments([
        {
          id: 1,
          title: "[기말 프로젝트]",
          dueDate: "2025.3.2",
          status: "진행중",
        },
        {
          id: 2,
          title: "[중간 프로젝트]",
          dueDate: "2025.2.1",
          status: "완료",
          score: "10/10",
        },
      ]);
    }
  }, [activeTab]);

  // 일정 추가 핸들러
  const handleAddSchedule = async (newSchedule) => {
    try {
      setIsLoading(true);

      // API 요청 데이터 형식으로 변환
      const scheduleData = {
        title: newSchedule.title,
        content: newSchedule.description,
        date: newSchedule.date,
        round: newSchedule.round,
      };

      // API 호출
      const result = await studyService.addSchedule(studyId, scheduleData);
      console.log("[StudyContent] 일정 추가 성공:", result);

      // 성공 시 상태 업데이트
      const addedSchedule = {
        scheduleId: result.scheduleId || Date.now(), // Location 헤더에서 추출한 ID 또는 임시 ID
        scheduleTitle: newSchedule.title,
        scheduleContent: newSchedule.description,
        scheduleStartingAt: `${newSchedule.date}T00:00:00`,
        formattedDate: newSchedule.date,
        round: newSchedule.round, // UI 표시용으로 round 정보 유지
      };

      setSchedules((prev) => [...prev, addedSchedule]);
      return true;
    } catch (error) {
      console.error("[StudyContent] 일정 추가 실패:", error);
      setError("일정 추가에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 일정 삭제 핸들러
  const handleDeleteSchedule = async (scheduleId) => {
    try {
      setIsLoading(true);

      // API 호출
      await studyService.deleteSchedule(studyId, scheduleId);
      console.log("[StudyContent] 일정 삭제 성공:", scheduleId);

      // 성공 시 상태 업데이트
      setSchedules((prev) =>
        prev.filter((schedule) => schedule.scheduleId !== scheduleId)
      );
      return true;
    } catch (error) {
      console.error("[StudyContent] 일정 삭제 실패:", error);
      setError("일정 삭제에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 일정 수정 핸들러
  const handleUpdateSchedule = async (scheduleId, updatedSchedule) => {
    try {
      setIsLoading(true);

      // API 요청 데이터 형식으로 변환
      const scheduleData = {
        title: updatedSchedule.title,
        content: updatedSchedule.content,
        date: updatedSchedule.date,
      };

      // API 호출
      const result = await studyService.updateSchedule(studyId, scheduleId, scheduleData);
      console.log("[StudyContent] 일정 수정 성공:", result);

      // 성공 시 상태 업데이트
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.scheduleId === scheduleId
            ? {
                ...schedule,
                scheduleTitle: updatedSchedule.title,
                scheduleContent: updatedSchedule.content,
                scheduleStartingAt: updatedSchedule.date.includes('T') 
                  ? updatedSchedule.date 
                  : `${updatedSchedule.date}T00:00:00`,
                formattedDate: formatDate(updatedSchedule.date.includes('T') 
                  ? updatedSchedule.date 
                  : `${updatedSchedule.date}T00:00:00`),
              }
            : schedule
        )
      );
      return true;
    } catch (error) {
      console.error("[StudyContent] 일정 수정 실패:", error);
      setError(`일정 수정에 실패했습니다: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // 일정 상세 보기로 전환
  const handleViewScheduleDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setShowScheduleDetail(true);
  };
  
  // 일정 목록 보기로 돌아가기
  const handleBackToScheduleList = () => {
    setShowScheduleDetail(false);
    setSelectedSchedule(null);
  };

  // 출석 목록 조회
  useEffect(() => {
    if (activeTab === '출석' && !scheduleId) {
      const fetchAttendances = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await studyService.getAttendances(studyId);
          
          // 중복 제거: scheduleId를 기준으로 중복된 항목 제거
          const uniqueAttendances = data.reduce((acc, current) => {
            const x = acc.find(item => item.scheduleId === current.scheduleId);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          
          // 날짜순으로 정렬 (최신순)
          const sortedAttendances = uniqueAttendances.sort((a, b) => 
            new Date(b.scheduleStartingAt) - new Date(a.scheduleStartingAt)
          );
          
          setAttendances(sortedAttendances);
        } catch (error) {
          console.error('[StudyContent] 출석 목록 조회 실패:', error);
          setError('출석 목록을 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchAttendances();
    }
  }, [activeTab, studyId, scheduleId]);

  // 출석 상세 페이지로 이동
  const handleAttendanceClick = (scheduleId) => {
    navigate(`/studies/${studyId}/attendances/${scheduleId}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div>로딩 중...</div>;
    }

    if (error) {
      return <div style={{ color: '#F44336' }}>{error}</div>;
    }

    // URL에 scheduleId가 있으면 출석 상세 페이지 표시
    if (scheduleId && activeTab === '출석') {
      return (
        <AttendanceDetailView
          onBack={() => navigate(`/studies/${studyId}/attendances`)}
        />
      );
    }

    switch (activeTab) {
      case "일정":
        if (showScheduleDetail) {
          return (
            <ScheduleDetailView
              schedule={selectedSchedule}
              onBack={handleBackToScheduleList}
              onUpdate={handleUpdateSchedule}
              onDelete={handleDeleteSchedule}
              isLoading={isLoading}
            />
          );
        }
        return (
          <ScheduleTab
            schedules={schedules}
            onAddSchedule={() => navigate(`/studies/${studyId}/schedules/add`)}
            onDeleteSchedule={handleDeleteSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onViewScheduleDetail={handleViewScheduleDetail}
            isLoading={isLoading}
            error={error}
          />
        );
      case "과제":
        return (
          <AssignmentTab
            assignments={assignments}
            studyId={studyId}
          />
        );
      case "공지사항":
        return <NoticeList studyId={studyId} userRole="MEMBER" />;
      case "게시판":
        return <DefaultContent content="게시판 기능 개발 중입니다." />;
      case "출석":
        return (
          <div style={{ width: '100%' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem',
              width: '100%'
            }}>
              {attendances.map((attendance) => (
                <div
                  key={attendance.attendanceId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {attendance.scheduleTitle}
                    </h3>
                    <div style={{
                      fontSize: '14px',
                      color: '#666666'
                    }}>
                      {new Date(attendance.scheduleStartingAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAttendanceClick(attendance.attendanceId)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007AFF',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    수정하기
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case "관리":
        return <ManagementTab studyId={studyId} />;
      case "랭킹&보증금":
        return <DefaultContent content="랭킹 및 보증금 기능 개발 중입니다." />;
      default:
        return (
          <DefaultContent content="탭을 선택하여 스터디 관련 정보를 확인하세요." />
        );
    }
  };

  return (
    <div 
      className="study-content" 
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0'
      }}
    >
      {renderContent()}
    </div>
  );
}

StudyContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  studyData: PropTypes.object,
};

export default StudyContent;
