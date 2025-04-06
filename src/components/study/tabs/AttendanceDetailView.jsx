import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { studyService } from '../../../services/api';
import { IoCloseOutline } from "react-icons/io5";
import AuthContext from '../../../contexts/AuthContext';
import '../../../styles/attendanceTab.css';

// 출석 상태 텍스트 변환 함수
const getStatusText = (status) => {
  switch (status) {
    case 'PRESENT':
      return '출석';
    case 'LATE':
      return '지각';
    case 'ABSENT':
      return '결석';
    case 'UNKNOWN':
    default:
      return '미정';
  }
};

// 날짜 포맷팅 함수
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '날짜 없음';
  const date = new Date(dateTimeStr);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const hours = date.getHours();
  const formattedHours = hours % 12 || 12; // 12시간제로 변환
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  return `${year}.${month}.${day} ${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
};

// 출석 상세 컴포넌트
const AttendanceDetailView = ({ id, scheduleId, studyId, onClose }) => {
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleInfo, setScheduleInfo] = useState({
    title: '',
    startingAt: '',
    id: scheduleId || ''
  });
  const [error, setError] = useState(null);
  const { role } = useContext(AuthContext);
  const isHost = role === 'CREATOR' || role === 'HOST';

  const fetchAttendanceDetails = async () => {
    try {
      setLoading(true);
      console.log(`[AttendanceDetailView] 출석 상세 조회 요청: studyId=${studyId}, id=${id}`);
      
      // 호스트/관리자일 경우 호스트용 API 사용
      const response = await studyService.getHostAttendancesByAttendance(studyId, id);
      console.log('[AttendanceDetailView] API 응답:', response);
      
      // 응답 데이터 처리 (핵심 수정 부분)
      let scheduleData = {
        title: '',
        startingAt: '',
        id: scheduleId || ''
      };
      
      // 안전하게 배열로 만들기
      let attendanceData = [];
      
      if (response) {
        // 스케줄 정보 추출
        if (Array.isArray(response)) {
          // 배열 형태인 경우
          if (response.length > 0) {
            const firstItem = response[0];
            scheduleData = {
              title: firstItem.scheduleTitle || firstItem.title || '무제',
              startingAt: firstItem.scheduleStartingAt || firstItem.startingAt || '',
              id: firstItem.scheduleId || scheduleId || ''
            };
            attendanceData = response;
          }
        } else {
          // 객체 형태인 경우
          scheduleData = {
            title: response.scheduleTitle || response.title || '무제',
            startingAt: response.scheduleStartingAt || response.startingAt || '',
            id: response.scheduleId || scheduleId || ''
          };
          
          // 가능한 출석 데이터 위치 확인
          if (response.data) {
            attendanceData = Array.isArray(response.data) ? response.data : [response.data];
          } else if (response.attendances) {
            attendanceData = Array.isArray(response.attendances) ? response.attendances : [response.attendances];
          } else {
            // 응답 자체를 단일 항목으로 취급
            attendanceData = [{
              attendanceId: response.attendanceId || id,
              status: response.status || 'UNKNOWN',
              studentName: response.memberName || response.studentName || '이름 없음'
            }];
          }
        }
      }
      
      console.log('[AttendanceDetailView] 처리된 출석 데이터:', attendanceData);
      setScheduleInfo(scheduleData);
      setAttendanceDetails(attendanceData);
      setError(null);
    } catch (error) {
      console.error('[AttendanceDetailView] 출석 상세 조회 실패:', error);
      setError('출석 정보를 불러오는 중 오류가 발생했습니다.');
      setAttendanceDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (attendanceId, newStatus) => {
    try {
      console.log(`[AttendanceDetailView] 상태 변경: ${attendanceId}, ${newStatus}`);
      await studyService.updateAttendance(studyId, attendanceId, newStatus);
      await fetchAttendanceDetails();
    } catch (error) {
      console.error('[AttendanceDetailView] 상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchAttendanceDetails();
  }, [id, studyId]);

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="attendance-error">
        <div className="error-message">{error}</div>
        <button onClick={onClose} className="btn-close">닫기</button>
      </div>
    );
  }

  return (
    <div className="attendance-detail-view">
      <div className="attendance-detail-header">
        <h3>
          출석 상세 정보: {scheduleInfo.title || '무제'} 
          {scheduleInfo.startingAt && (
            <span className="schedule-date"> ({formatDateTime(scheduleInfo.startingAt)})</span>
          )}
        </h3>
        <button onClick={onClose} className="btn-close">
          <IoCloseOutline size={24} />
        </button>
      </div>

      {attendanceDetails.length === 0 ? (
        <div className="no-attendance">출석 정보가 없습니다.</div>
      ) : (
        <div className="attendance-list">
          {attendanceDetails.map((attendance, index) => (
            <div key={attendance.attendanceId || `attendance-${index}`} className="attendance-item">
              <div className="attendee-info">
                <span className="attendee-name">
                  {attendance.studentName || attendance.memberName || '이름 없음'}
                  {attendance.isMe && <span className="is-me"> (나)</span>}
                  {attendance.role && (
                    <span className={`role ${attendance.role.toLowerCase()}`}>
                      {attendance.role === 'CREATOR' ? '개설자' : 
                       attendance.role === 'HOST' ? '관리자' : ''}
                    </span>
                  )}
                </span>
              </div>
              <div className="attendance-status">
                {isHost ? (
                  // 호스트인 경우 상태 변경 버튼 표시
                  <div className="status-buttons">
                    {['PRESENT', 'LATE', 'ABSENT', 'UNKNOWN'].map((status) => (
                      <button
                        key={status}
                        className={`status-btn ${status.toLowerCase()} ${
                          (attendance.status || attendance.attendanceStatus) === status ? 'active' : ''
                        }`}
                        onClick={() => 
                          handleUpdateStatus(attendance.attendanceId, status)
                        }
                      >
                        {getStatusText(status)}
                      </button>
                    ))}
                  </div>
                ) : (
                  // 일반 참가자인 경우 상태만 표시
                  <span
                    className={`status ${
                      (attendance.status || attendance.attendanceStatus || 'unknown').toLowerCase()
                    }`}
                  >
                    {getStatusText(attendance.status || attendance.attendanceStatus || 'UNKNOWN')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

AttendanceDetailView.propTypes = {
  id: PropTypes.string.isRequired,
  scheduleId: PropTypes.string,
  studyId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AttendanceDetailView; 