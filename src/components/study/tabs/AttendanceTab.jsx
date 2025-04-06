import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { IoChevronBackOutline } from "react-icons/io5";
import { FaPencilAlt } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Select, MenuItem, FormControl, Box } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';
import { useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import AttendanceDetailView from './AttendanceDetailView';
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

// 출석 상태 텍스트 변환 함수 - 컴포넌트 외부로 이동
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

// 날짜 포맷팅 함수 - 컴포넌트 외부로 이동
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
  
  // 배열이 아닌 경우 빈 배열로 처리
  const safeAttendances = Array.isArray(attendances) ? attendances : [];
  
  safeAttendances.forEach(attendance => {
    const status = attendance?.attendanceStatus || attendance?.status || 'UNKNOWN';
    if (stats.hasOwnProperty(status)) {
      stats[status] = stats[status] + 1;
    } else {
      stats.UNKNOWN = stats.UNKNOWN + 1;
    }
  });
  
  const total = safeAttendances.length;
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
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [openDetailId, setOpenDetailId] = useState(null);
  const [error, setError] = useState(null);
  const { role } = useContext(AuthContext);
  const isHost = role === 'CREATOR' || role === 'HOST';

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AttendanceTab] 출석 목록 조회 요청');
      
      const response = await studyService.getAttendances(studyId);
      console.log('[AttendanceTab] 출석 목록 응답:', response);
      
      // 응답 형식 처리 (핵심 수정 부분)
      let formattedAttendances = [];
      
      if (response) {
        if (Array.isArray(response)) {
          // 배열 형태 응답
          formattedAttendances = response.map(item => formatAttendanceItem(item));
        } else if (typeof response === 'object') {
          // 객체 형태 응답
          if (response.data && Array.isArray(response.data)) {
            // data 속성에 배열이 있는 경우
            formattedAttendances = response.data.map(item => 
              formatAttendanceItem(item, response.memberContext));
          } else if (response.data) {
            // data 속성이 객체인 경우
            formattedAttendances = [formatAttendanceItem(response.data, response.memberContext)];
          } else if (response.attendances) {
            // attendances 속성이 있는 경우
            const attendancesArray = Array.isArray(response.attendances) ? 
              response.attendances : [response.attendances];
            formattedAttendances = attendancesArray.map(item => formatAttendanceItem(item));
          } else {
            // 다른 응답 구조 - 단일 항목으로 처리
            formattedAttendances = [formatAttendanceItem(response)];
          }
        }
      }
      
      console.log('[AttendanceTab] 처리된 출석 목록:', formattedAttendances);
      setAttendances(formattedAttendances);
      
    } catch (error) {
      console.error('[AttendanceTab] 출석 목록 조회 실패:', error);
      setError('출석 정보를 불러오는 중 오류가 발생했습니다.');
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };
  
  // 출석 항목 포맷팅 함수 - 간소화
  const formatAttendanceItem = (item, memberContext = null) => {
    if (!item) return null;
    
    // 필수 필드 추출
    const id = item.attendanceId || item.id || '';
    const scheduleId = item.scheduleId || (item.schedule && item.schedule.id) || '';
    const title = item.scheduleTitle || item.title || item.scheduleName || '무제';
    const startingAt = item.scheduleStartingAt || item.startingAt || 
                      (item.schedule && item.schedule.startingAt) || '';
    const status = item.status || item.attendanceStatus || 'UNKNOWN';
    const myStatus = item.myStatus || 
                    (memberContext && memberContext.status) || status || 'UNKNOWN';
    
    return {
      id,
      scheduleId,
      title,
      date: startingAt ? formatDateTime(startingAt) : '날짜 없음',
      status,
      myStatus
    };
  };

  const handleAttendanceClick = (attendance) => {
    if (!attendance || !attendance.id) return;
    
    console.log('[AttendanceTab] 출석 클릭:', attendance);
    setSelectedAttendance(attendance);
    setOpenDetailId(attendance.id);
  };

  const handleCloseDetail = () => {
    setOpenDetailId(null);
    setSelectedAttendance(null);
  };

  useEffect(() => {
    if (studyId) {
      fetchAttendances();
    }
  }, [studyId]);

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
          {attendances.map((attendance, index) => (
            <div
              key={attendance.id || `attendance-item-${index}`}
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
                  <span className={`status ${(attendance.myStatus || 'unknown').toLowerCase()}`}>
                    {getStatusText(attendance.myStatus || 'UNKNOWN')}
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
          scheduleId={selectedAttendance.scheduleId || ''}
          studyId={studyId || ''}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

export default AttendanceTab; 