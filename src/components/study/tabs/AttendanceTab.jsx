import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { IoChevronBackOutline } from "react-icons/io5";

// 출석 상태 스타일 정의
const STATUS_STYLES = {
  PRESENT: { color: '#4CAF50', text: 'O', label: '출석' },
  ABSENT: { color: '#F44336', text: 'X', label: '결석' },
  LATE: { color: '#FFC107', text: '△', label: '지각' }
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

AttendanceDetailView.propTypes = {
  onBack: PropTypes.func.isRequired
};

// 출석 탭 메인 컴포넌트
function AttendanceTab() {
  const { studyId, scheduleId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 출석 목록 조회
  useEffect(() => {
    if (!scheduleId) {
      const fetchAttendances = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await studyService.getSchedules(studyId);
          
          // 날짜순으로 정렬 (최신순)
          const sortedSchedules = data.sort((a, b) => 
            new Date(b.scheduleStartingAt) - new Date(a.scheduleStartingAt)
          );
          
          setAttendances(sortedSchedules);
        } catch (error) {
          console.error('[AttendanceTab] 출석 목록 조회 실패:', error);
          setError('출석 목록을 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchAttendances();
    }
  }, [studyId, scheduleId]);

  // 출석 상세 페이지로 이동
  const handleAttendanceClick = (scheduleId) => {
    navigate(`/studies/${studyId}/attendances/${scheduleId}`);
  };

  // URL에 scheduleId가 있으면 출석 상세 페이지 표시
  if (scheduleId) {
    return (
      <AttendanceDetailView
        onBack={() => navigate(`/studies/${studyId}/attendances`)}
      />
    );
  }

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: '#F44336' }}>{error}</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem',
        width: '100%'
      }}>
        {attendances.map((schedule) => (
          <div
            key={schedule.scheduleId}
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
                {schedule.scheduleTitle}
              </h3>
              <div style={{
                fontSize: '14px',
                color: '#666666'
              }}>
                {new Date(schedule.scheduleStartingAt).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <button
              onClick={() => handleAttendanceClick(schedule.scheduleId)}
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
}

export default AttendanceTab; 