import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { studyService } from '../../../services/api';

const styles = {
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease'
  }
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

  const handleEditClick = (e, scheduleId) => {
    e.stopPropagation(); // 이벤트 버블링 방지
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
              onClick={(e) => handleEditClick(e, attendance.attendanceId)}
              style={styles.editButton}
            >
              수정하기
            </button>
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