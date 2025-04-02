import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { IoChevronBackOutline } from "react-icons/io5";
import { FaPencilAlt } from "react-icons/fa";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Select, MenuItem, FormControl, Box } from '@mui/material';

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
const AttendanceDetailView = ({ onBack }) => {
  const { studyId, attendanceId } = useParams();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('MEMBER');

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studyService.getHostAttendancesByAttendance(studyId, attendanceId);
        setAttendances(data);
        
        if (data.length > 0 && data[0].memberRole) {
          setUserRole(data[0].memberRole);
        }
      } catch (error) {
        console.error('[AttendanceDetailView] 출석 상세 정보 조회 실패:', error);
        setError('출석 상세 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceDetails();
  }, [studyId, attendanceId]);

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      await studyService.updateAttendance(studyId, attendanceId, newStatus);
      const updatedData = await studyService.getHostAttendancesByAttendance(studyId, attendanceId);
      setAttendances(updatedData);
    } catch (error) {
      console.error('[AttendanceDetailView] 출석 상태 변경 실패:', error);
      alert('출석 상태 변경에 실패했습니다.');
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: '#F44336' }}>{error}</div>;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2>출석 현황</h2>
        <button
          onClick={onBack}
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

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {userRole === 'HOST' ? (
                <FormControl size="small">
                  <Select
                    value={attendance.attendanceStatus || 'UNKNOWN'}
                    onChange={(e) => handleStatusChange(attendance.attendanceId, e.target.value)}
                    sx={{ 
                      minWidth: 100,
                      height: 32,
                      fontSize: '14px',
                      '.MuiOutlinedInput-notchedOutline': { 
                        borderColor: STATUS_STYLES[attendance.attendanceStatus || 'UNKNOWN'].color 
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': { 
                        borderColor: STATUS_STYLES[attendance.attendanceStatus || 'UNKNOWN'].color 
                      },
                      color: STATUS_STYLES[attendance.attendanceStatus || 'UNKNOWN'].color,
                      fontWeight: 'bold'
                    }}
                  >
                    {Object.entries(STATUS_STYLES).map(([status, style]) => (
                      <MenuItem key={status} value={status}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          color: style.color,
                          fontWeight: 'bold' 
                        }}>
                          <span style={{ marginRight: '8px' }}>{style.text}</span>
                          {style.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <div style={{ 
                  width: '32px', 
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: STATUS_STYLES[attendance.attendanceStatus || 'UNKNOWN'].color,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {STATUS_STYLES[attendance.attendanceStatus || 'UNKNOWN'].text}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

AttendanceDetailView.propTypes = {
  onBack: PropTypes.func.isRequired
};

// 출석률 그래프 컴포넌트
const AttendanceChart = ({ attendances }) => {
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
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E5E5',
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
          <div style={{ fontSize: '14px', color: '#666666' }}>
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
              color: '#333333'
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
  const { studyId, attendanceId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('MEMBER');
  const [hoveredItem, setHoveredItem] = useState(null);

  // 출석 목록 조회
  useEffect(() => {
    if (!attendanceId) {
      const fetchAttendances = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await studyService.getAttendances(studyId);
          
          // 중복 제거 (scheduleTitle + scheduleStartingAt 기준)
          const uniqueSchedules = [];
          const scheduleKeys = new Set();
          
          data.forEach(item => {
            const key = `${item.scheduleTitle}_${item.scheduleStartingAt}`;
            if (!scheduleKeys.has(key)) {
              scheduleKeys.add(key);
              uniqueSchedules.push(item);
            }
          });
          
          // 최신순 정렬
          const sortedData = uniqueSchedules.sort((a, b) => 
            new Date(b.scheduleStartingAt) - new Date(a.scheduleStartingAt)
          );
          
          setAttendances(sortedData);
          
          if (data.length > 0 && data[0].memberRole) {
            setUserRole(data[0].memberRole);
          }
        } catch (error) {
          console.error('[AttendanceTab] 출석 목록 조회 실패:', error);
          setError('출석 목록을 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchAttendances();
    }
  }, [studyId, attendanceId]);

  // 출석 상세 페이지로 이동
  const handleAttendanceClick = (scheduleTitle, scheduleStartingAt) => {
    const attendance = attendances.find(a => 
      a.scheduleTitle === scheduleTitle && 
      a.scheduleStartingAt === scheduleStartingAt
    );
    
    if (attendance) {
      navigate(`/studies/${studyId}/attendances/${attendance.attendanceId}`);
    } else {
      console.error('해당 일정의 출석 정보를 찾을 수 없습니다.');
    }
  };

  // 출석 상세 페이지에서 뒤로 가기
  const handleBackFromDetail = () => {
    navigate(`/studies/${studyId}/attendances`);
  };

  // URL에 attendanceId가 있으면 출석 상세 페이지 표시
  if (attendanceId) {
    return (
      <AttendanceDetailView
        onBack={handleBackFromDetail}
      />
    );
  }

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: '#F44336' }}>{error}</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 출석률 그래프 */}
      <AttendanceChart attendances={attendances} />
      
      {/* 출석 목록 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1rem',
        width: '100%'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>
          출석 기록
        </h2>
        
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
              borderRadius: '8px',
              position: 'relative',
              cursor: userRole === 'HOST' ? 'pointer' : 'default'
            }}
            onClick={() => userRole === 'HOST' && handleAttendanceClick(attendance.scheduleTitle, attendance.scheduleStartingAt)}
            onMouseEnter={() => setHoveredItem(attendance.attendanceId)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                {attendance.scheduleTitle}
                <span style={{ 
                  marginLeft: '0.5rem',
                  fontSize: '14px', 
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: STATUS_STYLES[attendance.attendanceStatus || 'UNKNOWN'].color,
                  color: '#FFFFFF' 
                }}>
                  {STATUS_STYLES[attendance.attendanceStatus || 'UNKNOWN'].label}
                </span>
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
            
            {userRole === 'HOST' && (
              <div
                className="edit-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: hoveredItem === attendance.attendanceId ? '#F5F5F5' : 'transparent',
                  border: 'none',
                  position: 'absolute',
                  right: '16px',
                  transition: 'all 0.2s ease-in-out',
                  opacity: hoveredItem === attendance.attendanceId ? 1 : 0
                }}
              >
                <FaPencilAlt size={14} color="#666666" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttendanceTab; 