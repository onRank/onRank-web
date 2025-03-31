import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../services/api';

// 출석 상태별 아이콘 스타일
const STATUS_STYLES = {
  PRESENT: { color: '#4CAF50', text: 'O', label: '출석' },  // 초록색
  ABSENT: { color: '#F44336', text: 'X', label: '결석' },   // 빨간색
  LATE: { color: '#FFC107', text: '-', label: '지각' },     // 노란색
  UNKNOWN: { color: '#9E9E9E', text: '?', label: '미정' }   // 회색
};

function AttendanceDetailPage() {
  const { studyId, scheduleId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 출석 상세 정보 조회
  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studyService.getAttendanceDetails(studyId, scheduleId);
        setAttendances(data);
      } catch (error) {
        console.error('[AttendanceDetailPage] 출석 상세 정보 조회 실패:', error);
        setError('출석 상세 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceDetails();
  }, [studyId, scheduleId]);

  // 출석 상태 변경
  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      await studyService.updateAttendanceStatus(studyId, attendanceId, newStatus);
      // 상태 업데이트 후 목록 다시 조회
      const updatedData = await studyService.getAttendanceDetails(studyId, scheduleId);
      setAttendances(updatedData);
    } catch (error) {
      console.error('[AttendanceDetailPage] 출석 상태 변경 실패:', error);
      alert('출석 상태 변경에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: '#F44336' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2>출석 현황</h2>
        <button
          onClick={() => navigate(`/studies/${studyId}/attendances`)}
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
}

export default AttendanceDetailPage; 