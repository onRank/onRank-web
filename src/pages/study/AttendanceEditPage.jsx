import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../services/api';
import StudySidebar from '../../components/study/StudySidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

function AttendanceEditPage() {
  const { studyId, scheduleId } = useParams();
  const navigate = useNavigate();
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
        console.error('[AttendanceEditPage] 출석 상세 정보 조회 실패:', error);
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
      console.error('[AttendanceEditPage] 출석 상태 변경 실패:', error);
      alert('출석 상태 변경에 실패했습니다.');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <StudySidebar activeTab="출석" />
      <div style={{ flex: 1, padding: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>출석 현황</h1>
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
                <button
                  onClick={() => handleStatusChange(attendance.attendanceId, 'PRESENT')}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: attendance.attendanceStatus === 'PRESENT' ? '#4CAF50' : '#E5E5E5',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  title="출석"
                >
                  O
                </button>
                <button
                  onClick={() => handleStatusChange(attendance.attendanceId, 'ABSENT')}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: attendance.attendanceStatus === 'ABSENT' ? '#F44336' : '#E5E5E5',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  title="결석"
                >
                  X
                </button>
                <button
                  onClick={() => handleStatusChange(attendance.attendanceId, 'LATE')}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: attendance.attendanceStatus === 'LATE' ? '#FFC107' : '#E5E5E5',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  title="지각"
                >
                  △
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AttendanceEditPage; 