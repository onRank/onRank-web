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
  PRESENT: { color: '#4CAF50', text: 'O', label: '출석', bgColor: '#E50011', iconColor: 'white' },
  ABSENT: { color: '#F44336', text: 'X', label: '결석', bgColor: '#000000', iconColor: 'white' },
  LATE: { color: '#FFC107', text: '△', label: '지각', bgColor: '#007BFF', iconColor: 'white' },
  UNKNOWN: { color: '#9E9E9E', text: '?', label: '미확인', bgColor: '#999999', iconColor: 'white' }
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

// 출석 상태 아이콘 변환 함수
const getStatusIcon = (status) => {
  switch (status) {
    case 'PRESENT':
      return (
        <div className="status-icon-wrapper">
          <div className="status-icon present" style={{ backgroundColor: '#E50011', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>O</div>
        </div>
      );
    case 'LATE':
      return (
        <div className="status-icon-wrapper">
          <div className="status-icon late" style={{ backgroundColor: '#007BFF', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>△</div>
        </div>
      );
    case 'ABSENT':
      return (
        <div className="status-icon-wrapper">
          <div className="status-icon absent" style={{ backgroundColor: '#000000', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>X</div>
        </div>
      );
    case 'UNKNOWN':
    default:
      return (
        <div className="status-icon-wrapper">
          <div className="status-icon unknown" style={{ backgroundColor: '#999999', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>?</div>
        </div>
      );
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

// 날짜만 포맷팅 함수
const formatDate = (dateTimeStr) => {
  if (!dateTimeStr) return '날짜 없음';
  const date = new Date(dateTimeStr);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
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
    const status = attendance?.status || attendance?.attendanceStatus || 'UNKNOWN';
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
    labels: ['출석', '미출석'],
    datasets: [
      {
        data: [stats.PRESENT, (total - stats.PRESENT)],
        backgroundColor: ['#E50011', '#FFB2B2'],
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
        enabled: false
      }
    }
  };
  
  return (
    <div className="attendance-overview">
      <h2>출석</h2>
      <div className="attendance-chart-container">
        <div className="chart-wrapper">
        <Doughnut data={chartData} options={chartOptions} />
          <div className="chart-center">
            <div className="percentage">{presentRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

AttendanceChart.propTypes = {
  attendances: PropTypes.array.isRequired
};

// 출석 상세 정보 테이블 컴포넌트
const AttendanceDetail = ({ attendances, selectedSchedule, isHost, onUpdateStatus }) => {
  // 디버깅 출력 추가
  console.log('AttendanceDetail - attendances:', attendances);
  console.log('AttendanceDetail - isHost:', isHost);
  
  return (
    <div className="attendance-detail">
      <h2>출석 현황</h2>
      <div className="attendance-table">
        <div className="table-header">
          <div className="header-cell">이름</div>
          <div className="header-cell">상태</div>
        </div>
        {attendances.map((attendance, index) => {
          // 출석 상태 변경 시 사용할 ID 값을 명확하게 설정
          const attendanceId = attendance.attendanceId || attendance.id || `attendance-${index}`;
          const currentStatus = attendance.status || attendance.attendanceStatus || 'UNKNOWN';
          console.log(`AttendanceDetail - item ${index}:`, attendance, 'attendanceId:', attendanceId);
          
          return (
            <div key={attendanceId} className="table-row">
              <div className="name-cell">
                {attendance.studentName || attendance.memberName || '이름 없음'}
                {attendance.isMe && <span className="is-me"> (나)</span>}
                {attendance.role && (
                  <span className={`role ${attendance.role.toLowerCase()}`}>
                    {attendance.role === 'CREATOR' || attendance.role === 'CREATER' ? '개설자' : 
                     attendance.role === 'HOST' ? '관리자' : ''}
                  </span>
                )}
              </div>
              <div className="status-cell">
                <div className="status-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button 
                    className={`status-btn present ${currentStatus === 'PRESENT' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('Updating status to PRESENT for:', attendanceId);
                      onUpdateStatus(attendanceId, 'PRESENT');
                    }}
                    style={{ 
                      backgroundColor: currentStatus === 'PRESENT' ? '#E50011' : 'white',
                      color: currentStatus === 'PRESENT' ? 'white' : '#E50011',
                      border: '1px solid #E50011',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    O
                  </button>
                  <button 
                    className={`status-btn absent ${currentStatus === 'ABSENT' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('Updating status to ABSENT for:', attendanceId);
                      onUpdateStatus(attendanceId, 'ABSENT');
                    }}
                    style={{ 
                      backgroundColor: currentStatus === 'ABSENT' ? '#000' : 'white',
                      color: currentStatus === 'ABSENT' ? 'white' : '#000',
                      border: '1px solid #000',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    X
                  </button>
                  <button 
                    className={`status-btn late ${currentStatus === 'LATE' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('Updating status to LATE for:', attendanceId);
                      onUpdateStatus(attendanceId, 'LATE');
                    }}
                    style={{ 
                      backgroundColor: currentStatus === 'LATE' ? '#007BFF' : 'white',
                      color: currentStatus === 'LATE' ? 'white' : '#007BFF',
                      border: '1px solid #007BFF',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    △
                  </button>
                  <button 
                    className={`status-btn unknown ${currentStatus === 'UNKNOWN' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('Updating status to UNKNOWN for:', attendanceId);
                      onUpdateStatus(attendanceId, 'UNKNOWN');
                    }}
                    style={{ 
                      backgroundColor: currentStatus === 'UNKNOWN' ? '#999' : 'white',
                      color: currentStatus === 'UNKNOWN' ? 'white' : '#999',
                      border: '1px solid #999',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ?
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

AttendanceDetail.propTypes = {
  attendances: PropTypes.array.isRequired,
  selectedSchedule: PropTypes.object,
  isHost: PropTypes.bool.isRequired,
  onUpdateStatus: PropTypes.func.isRequired
};

// 출석 목록 컴포넌트
const AttendanceScheduleList = ({ schedules, selectedId, onSelectSchedule }) => {
  return (
    <div className="attendance-schedule-list">
      <div className="schedule-table">
        <div className="table-header">
          <div className="header-cell">일정</div>
          <div className="header-cell">출석 상태</div>
        </div>
        {schedules.map((schedule) => (
          <div 
            key={schedule.id} 
            className={`table-row ${selectedId === schedule.id ? 'selected' : ''}`}
            onClick={() => onSelectSchedule(schedule.id)}
          >
            <div className="date-cell">
              {schedule.title || '무제'}<br />
              <span className="date-info">{schedule.date}</span>
            </div>
            <div className="status-cell">
              {getStatusIcon(schedule.myStatus || 'UNKNOWN')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

AttendanceScheduleList.propTypes = {
  schedules: PropTypes.array.isRequired,
  selectedId: PropTypes.string,
  onSelectSchedule: PropTypes.func.isRequired
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
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [view, setView] = useState('overview'); // 'overview' or 'detail'
  const { role } = useContext(AuthContext);
  // 'CREATER'도 허용 (API 응답과 일치)
  const isHost = role === 'CREATOR' || role === 'CREATER' || role === 'HOST';
  console.log('[AttendanceTab] 사용자 권한:', role, '관리자 여부:', isHost);

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
      
      // 첫 번째 항목을 기본 선택하지만 상세 뷰로 전환하지 않음
      if (formattedAttendances.length > 0 && !selectedScheduleId) {
        setSelectedScheduleId(formattedAttendances[0].id);
        // 자동으로 상세 뷰로 전환하지 않음 - 다음 줄 제거
        // fetchAttendanceDetails(formattedAttendances[0].id);
      }
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
      date: startingAt ? formatDate(startingAt) : '날짜 없음',
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

  // 출석 상세 조회
  const fetchAttendanceDetails = async (attendanceId) => {
    if (!attendanceId) return;
    
    try {
      setDetailLoading(true);
      console.log(`[AttendanceTab] 출석 상세 조회 요청: ${attendanceId}`);
      
      const response = await studyService.getHostAttendancesByAttendance(studyId, attendanceId);
      console.log('[AttendanceTab] 출석 상세 응답:', response);
      
      // 응답 데이터 처리
      let attendanceData = [];
      let memberRole = '';
      
      if (response) {
        // 응답에서 멤버 역할 정보 추출
        if (response.memberContext && response.memberContext.memberRole) {
          memberRole = response.memberContext.memberRole;
          console.log(`[AttendanceTab] 멤버 역할: ${memberRole}`);
        }
        
        // 데이터 배열 처리
        if (response.data && Array.isArray(response.data)) {
          attendanceData = response.data.map(item => ({
            ...item,
            // attendanceStatus를 status로 매핑
            status: item.attendanceStatus,
            attendanceId: item.attendanceId,
            // 필요한 경우 역할 정보 추가
            role: item.memberId === response.memberContext?.memberId ? memberRole : undefined
          }));
        } else if (Array.isArray(response)) {
          attendanceData = response.map(item => ({
            ...item,
            attendanceId: item.attendanceId || item.id || attendanceId
          }));
        } else {
          // 다른 형태의 응답 처리 로직 유지
          if (response.attendances) {
            const attendancesArray = Array.isArray(response.attendances) ? response.attendances : [response.attendances];
            attendanceData = attendancesArray.map(item => ({
              ...item,
              attendanceId: item.attendanceId || item.id || attendanceId
            }));
          } else {
            // 단일 항목으로 처리
            attendanceData = [{
              attendanceId: response.attendanceId || response.id || attendanceId,
              status: response.status || response.attendanceStatus || 'UNKNOWN',
              studentName: response.memberName || response.studentName || '이름 없음'
            }];
          }
        }
      }
      
      console.log('[AttendanceTab] 처리된 출석 상세 데이터:', attendanceData);
      setDetailData(attendanceData);
      
      // 상세 보기로 전환
      setView('detail');
    } catch (error) {
      console.error('[AttendanceTab] 출석 상세 조회 실패:', error);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };
  
  // 출석 상태 업데이트
  const handleUpdateStatus = async (attendanceId, newStatus) => {
    try {
      console.log(`[AttendanceTab] 상태 변경 시도: attendanceId=${attendanceId}, newStatus=${newStatus}`);
      
      if (!attendanceId) {
        console.error('[AttendanceTab] 출석 ID가 없어 상태를 변경할 수 없습니다.');
        alert('출석 ID가 없어 상태를 변경할 수 없습니다.');
        return;
      }
      
      if (!studyId) {
        console.error('[AttendanceTab] 스터디 ID가 없어 상태를 변경할 수 없습니다.');
        alert('스터디 ID가 없어 상태를 변경할 수 없습니다.');
        return;
      }
      
      // 상태값 검증
      if (!['PRESENT', 'ABSENT', 'LATE', 'UNKNOWN'].includes(newStatus)) {
        console.error(`[AttendanceTab] 잘못된 상태값: ${newStatus}`);
        alert('잘못된 상태값입니다.');
        return;
      }
      
      console.log(`[AttendanceTab] API 호출: studyService.updateAttendance(${studyId}, ${attendanceId}, ${newStatus})`);
      const response = await studyService.updateAttendance(studyId, attendanceId, newStatus);
      console.log('[AttendanceTab] 상태 변경 응답:', response);
      
      // 상세 정보 다시 조회
      console.log(`[AttendanceTab] 상태 변경 후 상세 정보 다시 조회: ${selectedScheduleId}`);
      fetchAttendanceDetails(selectedScheduleId);
      
      // 전체 목록도 새로고침
      console.log('[AttendanceTab] 상태 변경 후 전체 목록 새로고침');
      fetchAttendances();
    } catch (error) {
      console.error('[AttendanceTab] 상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  // 일정 선택 핸들러
  const handleSelectSchedule = (scheduleId) => {
    if (!scheduleId) return;
    
    console.log(`[AttendanceTab] 일정 선택: ${scheduleId}`);
    setSelectedScheduleId(scheduleId);
    fetchAttendanceDetails(scheduleId);
  };
  
  // 개요 보기로 전환
  const handleBackToOverview = () => {
    setView('overview');
  };

  // 컴포넌트 마운트 시 출석 목록 조회
  useEffect(() => {
    if (studyId) {
      // 컴포넌트 마운트 시 view를 항상 overview로 설정
      setView('overview');
      fetchAttendances();
    }
  }, [studyId]);

  // 선택된 일정 정보 찾기
  const selectedSchedule = attendances.find(a => a.id === selectedScheduleId) || {};

  return (
    <div className="attendance-tab">
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : attendances.length === 0 ? (
        <div className="no-attendance">출석 정보가 없습니다.</div>
      ) : (
        <>
          {view === 'overview' ? (
            <div className="attendance-overview-container">
              <AttendanceChart attendances={attendances} />
              
              <div className="attendance-history">
                <h3>출석 현황</h3>
                <AttendanceScheduleList 
                  schedules={attendances} 
                  selectedId={selectedScheduleId}
                  onSelectSchedule={handleSelectSchedule}
                />
              </div>
            </div>
          ) : (
            <div className="attendance-detail-container">
              <div className="detail-header">
                <button onClick={handleBackToOverview} className="back-button">
                  <IoChevronBackOutline /> 돌아가기
                </button>
                <h2>{selectedSchedule.title || '무제'} ({selectedSchedule.date})</h2>
              </div>
              
              {detailLoading ? (
                <div className="loading">상세 정보 로딩 중...</div>
              ) : detailData.length === 0 ? (
                <div className="no-attendance">출석 정보가 없습니다.</div>
              ) : (
                <AttendanceDetail 
                  attendances={detailData} 
                  selectedSchedule={selectedSchedule}
                  isHost={isHost}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AttendanceTab; 