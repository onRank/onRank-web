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
  const { colors } = useTheme();
  const { studyId, attendanceId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('MEMBER');

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`[AttendanceDetailView] 출석 상세 정보 조회 요청: ${attendanceId}`);
        const data = await studyService.getHostAttendancesByAttendance(studyId, attendanceId);
        
        // scheduleId가 응답에 포함되어 있는지 확인하고 로깅
        if (data.length > 0 && data[0].scheduleId) {
          console.log(`[AttendanceDetailView] scheduleId 확인: ${data[0].scheduleId}`);
        }
        
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
      // 상태 업데이트 후 데이터 다시 조회
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
        <h2 style={{ color: colors.text }}>출석 현황</h2>
        <button
          onClick={() => navigate(`/studies/${studyId}/attendances`, { replace: true })}
          style={{
            padding: '0.5rem 1rem',
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
            backgroundColor: colors.cardBackground,
            color: colors.text,
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
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: colors.text }}>
                {attendance.studentName}
              </div>
              <div style={{ fontSize: '14px', color: colors.textSecondary }}>
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
      backgroundColor: colors.cardBackground,
      border: `1px solid ${colors.border}`,
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
  const { colors } = useTheme();
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [userRole, setUserRole] = useState('MEMBER');

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('[AttendanceTab] 출석 목록 조회 요청');
        const response = await studyService.getAttendances(studyId);
        
        // 응답 데이터 구조 로깅
        console.log('[AttendanceTab] 출석 목록 응답:', response);
        
        // 사용자 역할 설정
        if (response.memberContext && response.memberContext.memberRole) {
          setUserRole(response.memberContext.memberRole);
          console.log('[AttendanceTab] 사용자 역할:', response.memberContext.memberRole);
        }
        
        // 출석 데이터 설정
        const attendancesData = Array.isArray(response.data) ? response.data : [];
        console.log('[AttendanceTab] 출석 데이터 수:', attendancesData.length);
        setAttendances(attendancesData);
      } catch (error) {
        console.error('[AttendanceTab] 출석 목록 조회 실패:', error);
        setError('출석 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendances();
  }, [studyId]);

  const handleAttendanceClick = (attendance) => {
    console.log('[AttendanceTab] 출석 항목 클릭:', attendance);
    navigate(`/studies/${studyId}/attendances/${attendance.attendanceId}`);
  };

  const handleCreateAttendance = () => {
    console.log('[AttendanceTab] 출석 생성 버튼 클릭');
    navigate(`/studies/${studyId}/schedules`);
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: '#F44336' }}>{error}</div>;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: colors.text }}>출석 현황</h2>
        {userRole === 'HOST' && (
          <button
            onClick={handleCreateAttendance}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            출석 등록
          </button>
        )}
      </div>

      {attendances.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          color: colors.text
        }}>
          등록된 출석이 없습니다. 출석을 등록해주세요.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem'
        }}>
          <div
            style={{
              padding: '1rem',
              backgroundColor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          >
            <AttendanceChart attendances={attendances} />
          </div>

          {attendances.map((attendance) => (
            <div
              key={attendance.scheduleId || attendance.attendanceId}
              onClick={() => handleAttendanceClick(attendance)}
              style={{
                padding: '1rem',
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '0.5rem',
                  color: colors.text
                }}>
                  {attendance.scheduleName || '무제'}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: colors.textSecondary
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
              <div>
                <FaPencilAlt size={16} color={colors.primary} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AttendanceTab; 