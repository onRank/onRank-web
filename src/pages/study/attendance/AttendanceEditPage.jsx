import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../../services/api';
import StudySidebar from '../../../components/study/StudySidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { getStatusText, STATUS_STYLES } from '../../../utils/attendanceUtils';

/**
 * 출석 편집 페이지
 * 출석 상태를 수정하는 페이지
 */
function AttendanceEditPage() {
  const { studyId, scheduleId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studyService.getAttendanceDetails(studyId, scheduleId);
        
        if (data && data.length > 0) {
          setAttendances(data);
          
          // 스케줄 정보 저장
          setScheduleInfo({
            title: data[0].scheduleTitle || '일정 정보 없음',
            startingAt: data[0].scheduleStartingAt,
            endingAt: data[0].scheduleEndingAt
          });
        } else {
          setAttendances([]);
        }
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
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0.5rem' }}>출석 관리</h1>
            {scheduleInfo && (
              <div style={{ fontSize: '16px', color: '#666666' }}>
                {scheduleInfo.title} - {new Date(scheduleInfo.startingAt).toLocaleDateString()}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate(`/studies/${studyId}/attendance`)}
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
          {attendances.length === 0 ? (
            <div style={{
              padding: '2rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666666'
            }}>
              출석 정보가 없습니다.
            </div>
          ) : (
            attendances.map((attendance) => {
              const status = attendance.attendanceStatus || 'UNKNOWN';
              const styles = STATUS_STYLES[status] || STATUS_STYLES.UNKNOWN;
              
              return (
                <div
                  key={attendance.attendanceId}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#FFFFFF',
                    border: styles.border,
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {attendance.studentName || '이름 없음'}
                    </div>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px', 
                      color: styles.color 
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: styles.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        marginRight: '4px'
                      }}>
                        {styles.icon}
                      </div>
                      {getStatusText(status)}
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
                        backgroundColor: status === 'PRESENT' ? '#E50011' : '#E5E5E5',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                      title={getStatusText('PRESENT')}
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
                        backgroundColor: status === 'ABSENT' ? '#000' : '#E5E5E5',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                      title={getStatusText('ABSENT')}
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
                        backgroundColor: status === 'LATE' ? '#007BFF' : '#E5E5E5',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                      title={getStatusText('LATE')}
                    >
                      △
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceEditPage; 