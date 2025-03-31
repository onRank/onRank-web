import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { studyService } from '../../../services/api';

const styles = {
  progressBar: {
    width: '120px',
    height: '8px',
    backgroundColor: '#E5E5E5',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF0000',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: '8px'
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

  // 출석 상세 페이지로 이동
  const handleAttendanceClick = (scheduleId) => {
    navigate(`/studies/${studyId}/attendances/${scheduleId}`);
  };

  // 출석률 계산 함수
  const calculateAttendanceRate = (attendance) => {
    const totalMembers = attendance.attendanceDetails?.length || 0;
    if (totalMembers === 0) return 0;
    
    const presentMembers = attendance.attendanceDetails.filter(
      detail => detail.status === 'PRESENT'
    ).length;
    
    return Math.round((presentMembers / totalMembers) * 100);
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${calculateAttendanceRate(attendance)}%`
                  }}
                />
              </div>
              <span style={styles.progressText}>
                {calculateAttendanceRate(attendance)}%
              </span>
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