import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import StudySidebar from '../../../components/study/StudySidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { getStatusText, getStatusIcon, STATUS_STYLES, formatDateTime } from '../../../utils/attendanceUtils';
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
  const [openDropdownId, setOpenDropdownId] = useState(null);

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

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      await studyService.updateAttendance(studyId, attendanceId, newStatus);
      setOpenDropdownId(null);
      fetchAttendanceDetails();
    } catch (error) {
      console.error('출석 상태 변경 실패:', error);
    }
  };

  useEffect(() => {
    fetchAttendanceDetails();
  }, [studyId, scheduleId]);

  const toggleDropdown = (attendanceId) => {
    if (openDropdownId === attendanceId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(attendanceId);
    }
  };

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
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{scheduleTitle}</h1>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>{formatDateTime(scheduleStartingAt, 'M월 d일 a h시')}</p>
          </div>
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
                  <th style={{ padding: '1rem', textAlign: 'left', paddingLeft: '2rem' }}>이름</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {attendanceDetails.map((attendance) => (
                  <tr key={attendance.attendanceId} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '1rem', paddingLeft: '2rem' }}>{attendance.studentName}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1rem',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: STATUS_STYLES[attendance.attendanceStatus].background,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: STATUS_STYLES[attendance.attendanceStatus].color,
                          cursor: 'pointer'
                        }}
                          onClick={() => toggleDropdown(attendance.attendanceId)}
                        >
                          {STATUS_STYLES[attendance.attendanceStatus].icon}
                        </div>
                        {getStatusText(attendance.attendanceStatus)}
                        
                        {/* 드롭다운 메뉴 */}
                        {openDropdownId === attendance.attendanceId && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            right: '0', 
                            backgroundColor: 'white', 
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                            borderRadius: '4px', 
                            padding: '0.5rem',
                            display: 'flex',
                            gap: '0.5rem',
                            zIndex: 10
                          }}>
                            <div 
                              onClick={() => handleStatusChange(attendance.attendanceId, 'PRESENT')}
                              style={{
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                backgroundColor: STATUS_STYLES['PRESENT'].background,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: STATUS_STYLES['PRESENT'].color,
                                cursor: 'pointer',
                                border: `1px solid ${STATUS_STYLES['PRESENT'].color}`
                              }}
                              title="출석"
                            >
                              {STATUS_STYLES['PRESENT'].icon}
                            </div>
                            <div 
                              onClick={() => handleStatusChange(attendance.attendanceId, 'LATE')}
                              style={{
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                backgroundColor: STATUS_STYLES['LATE'].background,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: STATUS_STYLES['LATE'].color,
                                cursor: 'pointer',
                                border: `1px solid ${STATUS_STYLES['LATE'].color}`
                              }}
                              title="지각"
                            >
                              {STATUS_STYLES['LATE'].icon}
                            </div>
                            <div 
                              onClick={() => handleStatusChange(attendance.attendanceId, 'ABSENT')}
                              style={{
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                backgroundColor: STATUS_STYLES['ABSENT'].background,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: STATUS_STYLES['ABSENT'].color,
                                cursor: 'pointer',
                                border: `1px solid ${STATUS_STYLES['ABSENT'].color}`
                              }}
                              title="결석"
                            >
                              {STATUS_STYLES['ABSENT'].icon}
                            </div>
                            <div 
                              onClick={() => handleStatusChange(attendance.attendanceId, 'UNKNOWN')}
                              style={{
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                backgroundColor: STATUS_STYLES['UNKNOWN'].background,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: STATUS_STYLES['UNKNOWN'].color,
                                cursor: 'pointer',
                                border: `1px solid ${STATUS_STYLES['UNKNOWN'].color}`
                              }}
                              title="미정"
                            >
                              {STATUS_STYLES['UNKNOWN'].icon}
                            </div>
                          </div>
                        )}
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