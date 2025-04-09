import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import StudySidebar from '../../../components/study/StudySidebar';
import AttendanceDetail from '../../../components/study/attendance/AttendanceDetail';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';

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

 // 출석 상세 정보 가져오기
const fetchAttendanceDetails = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    // 출석 상세 정보 가져오기
    const response = await studyService.getAttendanceDetails(studyId, scheduleId);
    console.log('응답 데이터:', response);
    
    // data 배열의 각 항목에 일정 정보 추가
    if (response.data && Array.isArray(response.data)) {
      const formattedData = response.data.map(item => ({
        ...item,
        scheduleTitle: response.scheduleTitle,
        scheduleStartingAt: response.scheduleStartingAt,
        scheduleEndingAt: response.scheduleEndingAt || response.scheduleStartingAt
      }));
      
      setAttendanceDetails(formattedData);
    } else {
      setError('출석 데이터 형식이 올바르지 않습니다.');
    }
    
    // 호스트 여부는 사용자 권한으로 판단
    setIsHost(user?.role === 'ADMIN' || user?.role === 'CREATOR');

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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>출석 상세</h1>
          <div>
            {isHost && (
              <button
                onClick={() => navigate(`/studies/${studyId}/attendances/${scheduleId}/edit`)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #007BFF',
                  borderRadius: '4px',
                  backgroundColor: '#FFFFFF',
                  color: '#007BFF',
                  marginRight: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                출석 관리
              </button>
            )}
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
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <AttendanceDetail
            attendanceDetails={attendanceDetails}
            isHost={isHost}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </div>
  );
}

export default AttendanceDetailPage; 