import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { studyService } from '../../../services/api';

const styles = {
  // 스타일 코드는 유지
};

// 출석 상태별 아이콘 스타일
const STATUS_STYLES = {
  PRESENT: { color: '#4CAF50', text: 'O' },  // 초록색
  ABSENT: { color: '#F44336', text: 'X' },   // 빨간색
  LATE: { color: '#FFC107', text: '-' },     // 노란색
  UNKNOWN: { color: '#9E9E9E', text: '?' }   // 회색
};

function AttendanceTab() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 출석 목록 조회
  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studyService.getAttendances(studyId);
        setAttendances(data);
      } catch (error) {
        console.error('[AttendanceTab] 출석 목록 조회 실패:', error);
        setError('출석 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendances();
  }, [studyId]);

  // 출석 상세 페이지로 이동
  const handleAttendanceClick = (scheduleId) => {
    navigate(`/studies/${studyId}/attendances/${scheduleId}`);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: '#F44336' }}>{error}</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 출석 현황 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem',
        width: '100%'
      }}>
        {attendances.map((attendance) => (
          <div
            key={attendance.attendanceId}
            onClick={() => handleAttendanceClick(attendance.attendanceId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: '#F8F9FA',
                transform: 'translateX(4px)'
              }
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
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: STATUS_STYLES[attendance.attendanceStatus].color,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {STATUS_STYLES[attendance.attendanceStatus].text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

AttendanceTab.propTypes = {
  // 필요한 props 정의
};

export default AttendanceTab; 