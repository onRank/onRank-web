import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { IoChevronBackOutline } from "react-icons/io5";
import { FaPencilAlt } from "react-icons/fa";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Select, MenuItem, FormControl, Box } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';
import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/attendanceTab.css';

// Chart.js 컴포넌트 등록
ChartJS.register(ArcElement, Tooltip, Legend);

// 출석 상태 스타일 정의
const STATUS_STYLES = {
  PRESENT: { color: '#4CAF50', text: 'O', label: '출석' },
  ABSENT: { color: '#F44336', text: 'X', label: '결석' },
  LATE: { color: '#FFC107', text: '△', label: '지각' },
  UNKNOWN: { color: '#9E9E9E', text: '?', label: '미확인' }
};

// 그래프 색상 - 출석은 빨간색, 나머지는 분홍색
const CHART_COLORS = {
  PRESENT: '#E50011',  // 빨간색 - 출석
  ABSENT: '#FF5252',   // 분홍색 - 결석
  LATE: '#FF5252',     // 분홍색 - 지각
  UNKNOWN: '#FF5252'   // 분홍색 - 미확인
};

// 출석 상세 컴포넌트
const AttendanceDetailView = ({ id, scheduleId, studyId, onClose }) => {
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleInfo, setScheduleInfo] = useState({
    title: '',
    startingAt: '',
    id: scheduleId
  });
  const [error, setError] = useState(null);
  const { role } = useContext(AuthContext);
  const isHost = role === 'CREATOR' || role === 'HOST';

  const fetchAttendanceDetails = async () => {
    try {
      setLoading(true);
      console.log(`[AttendanceDetailView] 출석 상세 조회 요청: studyId=${studyId}, id=${id}`);
      
      let response;
      // 호스트/관리자일 경우 호스트용 API 사용
      if (isHost) {
        response = await studyService.getHostAttendancesByAttendance(studyId, id);
      } else {
        response = await studyService.getAttendanceById(studyId, id);
      }
      
      console.log('[AttendanceDetailView] API 응답:', response);
      
      // 응답 데이터 처리
      if (response) {
        // 스케줄 정보 추출
        if (!Array.isArray(response)) {
          // 객체 형태 응답 처리 (호스트 API 응답)
          setScheduleInfo({
            title: response.scheduleTitle || response.title || '무제',
            startingAt: response.scheduleStartingAt || response.startingAt || '',
            id: response.scheduleId || scheduleId
          });
          
          // 출석 데이터 배열 추출
          const attendanceData = response.data || [];
          console.log('[AttendanceDetailView] 추출된 출석 데이터:', attendanceData);
          setAttendanceDetails(attendanceData);
        } else {
          // 배열 형태 응답 처리 (일반 참가자 API 응답)
          // 참고: 배열의 모든 항목이 같은 일정에 속한다고 가정
          if (response.length > 0) {
            const firstItem = response[0];
            setScheduleInfo({
              title: firstItem.scheduleTitle || firstItem.title || '무제',
              startingAt: firstItem.scheduleStartingAt || firstItem.startingAt || '',
              id: firstItem.scheduleId || scheduleId
            });
          }
          setAttendanceDetails(response);
        }
      } else {
        console.error('[AttendanceDetailView] 응답 데이터가 없습니다.');
        setError('데이터를 불러올 수 없습니다.');
        setAttendanceDetails([]);
      }
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
    return <div>로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="attendance-error">
        <div className="error-message">{error}</div>
        <button onClick={onClose} className="btn-close">닫기</button>
      </div>
    );
  }

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
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      {attendanceDetails.length === 0 ? (
        <div className="no-attendance">출석 정보가 없습니다.</div>
      ) : (
        <div className="attendance-list">
          {attendanceDetails.map((attendance) => (
            <div key={attendance.attendanceId} className="attendance-item">
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
                          attendance.status === status ? 'active' : ''
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
                      attendance.status ? attendance.status.toLowerCase() : 'unknown'
                    }`}
                  >
                    {getStatusText(attendance.status || 'UNKNOWN')}
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
  scheduleId: PropTypes.string.isRequired,
  studyId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

// 출석률 그래프 컴포넌트
const AttendanceChart = ({ attendances }) => {
  const { colors } = useTheme();
  // 출석 상태 통계 계산
  const stats = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    UNKNOWN: 0
  };
  
  attendances.forEach(attendance => {
    const status = attendance.attendanceStatus || 'UNKNOWN';
    stats[status] = (stats[status] || 0) + 1;
  });
  
  const total = attendances.length;
  const presentRate = total > 0 ? Math.round((stats.PRESENT / total) * 100) : 0;
  
  // 차트 데이터
  const chartData = {
    labels: Object.entries(STATUS_STYLES).map(([_, style]) => style.label),
    datasets: [
      {
        data: Object.keys(STATUS_STYLES).map(status => stats[status] || 0),
        backgroundColor: Object.keys(STATUS_STYLES).map(status => CHART_COLORS[status]),
        borderWidth: 0,
      },
    ],
  };
  
  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value}명 (${percentage}%)`;
          }
        }
      }
    }
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '2rem',
      backgroundColor: `var(--cardBackground)`,
      border: `1px solid var(--border)`,
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        position: 'relative',
        width: '280px',
        height: '280px'
      }}>
        <Doughnut data={chartData} options={chartOptions} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#E50011' }}>
            {presentRate}%
          </div>
          <div style={{ fontSize: '14px', color: `var(--textSecondary)` }}>
            출석률
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        {Object.entries(STATUS_STYLES).map(([status, style]) => (
          <div key={status} style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: style.color
            }} />
            <div style={{ 
              fontSize: '16px',
              color: `var(--textPrimary)`
            }}>
              {style.label}: <span style={{ fontWeight: 'bold' }}>{stats[status] || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

AttendanceChart.propTypes = {
  attendances: PropTypes.array.isRequired
};

// 출석 탭 메인 컴포넌트
function AttendanceTab() {
  const { colors } = useTheme();
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [openDetailId, setOpenDetailId] = useState(null);
  const [error, setError] = useState(null);
  const { role, userId } = useContext(AuthContext);
  const isHost = role === 'CREATOR' || role === 'HOST';

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const response = await studyService.getAttendances(studyId);
      console.log('[AttendanceTab] 출석 목록 응답:', response);
      
      let formattedAttendances = [];
      
      // 응답이 배열인 경우 (일반 참가자)
      if (Array.isArray(response)) {
        formattedAttendances = response.map((attendance) => ({
          id: attendance.attendanceId,
          scheduleId: attendance.scheduleId,
          title: attendance.scheduleTitle || attendance.title || '무제',
          date: attendance.scheduleStartingAt ? 
                formatDateTime(attendance.scheduleStartingAt) : '날짜 없음',
          status: attendance.status || 'UNKNOWN',
          myStatus: attendance.myStatus || 'UNKNOWN'
        }));
      } 
      // 응답이 객체인 경우 (memberContext와 data 분리)
      else if (response && response.data) {
        // 회원 컨텍스트 정보 추출
        const memberContext = response.memberContext || {};
        console.log('[AttendanceTab] 회원 컨텍스트:', memberContext);
        
        // 데이터 배열 처리
        if (Array.isArray(response.data)) {
          formattedAttendances = response.data.map((attendance) => ({
            id: attendance.attendanceId,
            scheduleId: attendance.scheduleId,
            title: attendance.scheduleTitle || attendance.title || '무제',
            date: attendance.scheduleStartingAt ? 
                  formatDateTime(attendance.scheduleStartingAt) : '날짜 없음',
            status: attendance.status || 'UNKNOWN',
            myStatus: attendance.myStatus || memberContext.status || 'UNKNOWN',
            // 회원 정보 추가
            myRole: memberContext.role || role
          }));
        }
      }
      
      console.log('[AttendanceTab] 처리된 출석 목록:', formattedAttendances);
      setAttendances(formattedAttendances);
      setError(null);
    } catch (error) {
      console.error('[AttendanceTab] 출석 목록 조회 실패:', error);
      setError('출석 정보를 불러오는 중 오류가 발생했습니다.');
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceClick = (attendance) => {
    console.log('[AttendanceTab] 출석 클릭:', attendance);
    setSelectedAttendance(attendance);
    setOpenDetailId(attendance.id);
  };

  const handleCloseDetail = () => {
    setOpenDetailId(null);
    setSelectedAttendance(null);
  };

  useEffect(() => {
    fetchAttendances();
  }, [studyId]);

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

  return (
    <div className="attendance-tab">
      <h2>출석</h2>
      
      {loading && <div className="loading">로딩 중...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && attendances.length === 0 && (
        <div className="no-attendance">출석 정보가 없습니다.</div>
      )}
      
      {!loading && !error && attendances.length > 0 && (
        <div className="attendance-list">
          {attendances.map((attendance) => (
            <div
              key={attendance.id}
              className="attendance-item"
              onClick={() => handleAttendanceClick(attendance)}
            >
              <div className="attendance-info">
                <div className="attendance-title">{attendance.title || '무제'}</div>
                <div className="attendance-date">{attendance.date}</div>
              </div>
              <div className="attendance-status">
                {isHost ? (
                  <button className="view-detail-btn">자세히 보기</button>
                ) : (
                  <span className={`status ${attendance.myStatus.toLowerCase()}`}>
                    {getStatusText(attendance.myStatus)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {openDetailId && selectedAttendance && (
        <AttendanceDetailView
          id={openDetailId}
          scheduleId={selectedAttendance.scheduleId}
          studyId={studyId}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

export default AttendanceTab; 