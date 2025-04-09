import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import StudySidebar from '../../../components/study/StudySidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { getStatusText, getStatusIcon, STATUS_STYLES } from '../../../utils/attendanceUtils';
import { isStudyHost, getStudyName } from '../../../utils/studyRoleUtils';

/**
 * 출석 상세 페이지
 * 특정 출석 일정에 대한 상세 정보를 보여주는 페이지
 */
function AttendanceDetailPage() {
  const { studyId, scheduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleStartingAt, setScheduleStartingAt] = useState('');

  const fetchAttendanceDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await studyService.getAttendanceDetails(studyId, scheduleId);
      console.log('응답 데이터:', response);

      if (response.data && Array.isArray(response.data)) {
        setAttendanceDetails(response.data);
        setScheduleTitle(response.scheduleTitle);
        setScheduleStartingAt(response.scheduleStartingAt);
        setIsHost(isStudyHost(response));
      } else {
        setError('출석 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('[AttendanceDetailPage] 출석 상세 정보 조회 실패:', error);
      setError('출석 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 출석 상태 업데이트 함수
  const handleUpdateStatus = async (attendanceId, newStatus) => {
    try {
      await studyService.updateAttendanceStatus(studyId, attendanceId, newStatus);
      // 상태 변경 후 데이터 다시 불러오기
      await fetchAttendanceDetails();
    } catch (error) {
      console.error('[AttendanceDetailPage] 출석 상태 업데이트 실패:', error);
      alert('출석 상태 변경에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchAttendanceDetails();
  }, [studyId, scheduleId]);

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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{scheduleTitle}</h1>
          <button
            onClick={() => navigate(`/studies/${studyId}/attendances`)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #E5E5E5',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF',
              color: '#333333',
              cursor: 'pointer'
            }}
          >
            목록으로
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '1rem' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1rem' }}>출석 현황</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>이름</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {attendanceDetails.map((attendance) => (
                  <tr key={attendance.attendanceId} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '1rem' }}>{attendance.studentName}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: STATUS_STYLES[attendance.attendanceStatus].background,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: STATUS_STYLES[attendance.attendanceStatus].color
                        }}>
                          {STATUS_STYLES[attendance.attendanceStatus].icon}
                        </div>
                        {getStatusText(attendance.attendanceStatus)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceDetailPage; 