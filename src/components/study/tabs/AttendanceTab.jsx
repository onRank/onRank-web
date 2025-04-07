import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService, tokenUtils } from '../../../services/api';
import { IoChevronBackOutline } from "react-icons/io5";
import { FaPencilAlt } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Select, MenuItem, FormControl, Box } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';
import { useContext } from 'react';
import AuthContext from '../../../contexts/AuthContext';
import '../../../styles/attendanceTab.css';
import axios from 'axios';

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

// 출석 상세 정보 테이블 컴포넌트
const AttendanceDetail = ({ attendances, selectedSchedule, isHost, onUpdateStatus }) => {
  // 디버깅 출력 추가
  console.log('[AttendanceDetail] props 확인:');
  console.log('- attendances:', attendances);
  console.log('- selectedSchedule:', selectedSchedule);
  console.log('- isHost:', isHost);
  console.log('- API 응답 memberContext 정보:', 
    attendances.length > 0 && attendances[0].memberRole 
      ? { studyName: attendances[0].studyName, memberRole: attendances[0].memberRole } 
      : '정보 없음'
  );
  
  // 관리자 권한 확인 - API 응답에서 받은 memberRole 정보도 함께 확인
  const canEditAttendance = isHost || 
    (attendances.length > 0 && 
     ['CREATOR', 'CREATER', 'HOST'].includes(attendances[0].memberRole));
  
  console.log('[AttendanceDetail] 관리자 권한 최종 판단:', canEditAttendance);
  
  return (
    <div className="attendance-detail">
      <h2>출석 현황</h2>
      {canEditAttendance ? (
        <div className="host-message">관리자 권한으로 출석 상태를 변경할 수 있습니다.</div>
      ) : null}
      <div className="attendance-table">
        <div className="table-header">
          <div className="header-cell">이름</div>
          <div className="header-cell">상태</div>
        </div>
        {attendances.map((attendance, index) => {
          // 출석 상태 변경 시 사용할 ID 값을 명확하게 설정
          const attendanceId = attendance.attendanceId || attendance.id || `attendance-${index}`;
          const currentStatus = attendance.status || attendance.attendanceStatus || 'UNKNOWN';
          console.log(`[AttendanceDetail] item ${index}:`, attendance, 'attendanceId:', attendanceId);
          
          return (
            <div key={attendanceId} className="table-row">
              <div className="name-cell">
                {attendance.studentName || attendance.memberName || '이름 없음'}
                {attendance.isMe && <span className="is-me"> (나)</span>}
                {attendance.role && (
                  <span className={`role ${attendance.role.toLowerCase()}`}>
                    {attendance.role === 'CREATOR' || attendance.role === 'CREATER' ? '스터디 생성자' : 
                     attendance.role === 'HOST' ? '관리자' : ''}
                  </span>
                )}
              </div>
              <div className="status-cell">
                {canEditAttendance ? (
                  <div className="status-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button 
                      className={`status-btn present ${currentStatus === 'PRESENT' ? 'active' : ''}`}
                      onClick={() => {
                        console.log('[AttendanceDetail] 상태 변경: PRESENT, ID:', attendanceId);
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
                        console.log('[AttendanceDetail] 상태 변경: ABSENT, ID:', attendanceId);
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
                        console.log('[AttendanceDetail] 상태 변경: LATE, ID:', attendanceId);
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
                        console.log('[AttendanceDetail] 상태 변경: UNKNOWN, ID:', attendanceId);
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
                ) : (
                  <div className="status-display">
                    {currentStatus === 'PRESENT' && <span className="status present">출석</span>}
                    {currentStatus === 'ABSENT' && <span className="status absent">결석</span>}
                    {currentStatus === 'LATE' && <span className="status late">지각</span>}
                    {currentStatus === 'UNKNOWN' && <span className="status unknown">미확인</span>}
                  </div>
                )}
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

// 출석 탭 메인 컴포넌트
function AttendanceTab() {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [view, setView] = useState('overview'); // 'overview' or 'detail'
  const authContext = useContext(AuthContext);
  
  // 기본 역할 정보 확인 (AuthContext 또는 토큰에서)
  const getUserRole = () => {
    // 1. AuthContext에서 역할 정보 가져오기
    if (authContext.role && authContext.role !== 'MEMBER') {
      return authContext.role;
    }
    
    // 2. 토큰에서 직접 역할 정보 추출 (백업 방법)
    try {
      const token = tokenUtils.getToken();
      if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        return tokenPayload.role || tokenPayload.roles || 'MEMBER';
      }
    } catch (error) {
      console.error('[AttendanceTab] 토큰에서 역할 정보 추출 실패:', error);
    }
    
    // 3. 사용자 객체에서 역할 정보 확인
    if (authContext.user && authContext.user.role) {
      return authContext.user.role;
    }
    
    return 'MEMBER';
  };
  
  const initialRole = getUserRole();
  // 역할 및 관리자 여부 상태 관리
  const [role, setRole] = useState(initialRole);
  const [isHost, setIsHost] = useState(
    initialRole === 'CREATOR' || initialRole === 'CREATER' || initialRole === 'HOST'
  );
  
  console.log('[AttendanceTab] 초기 역할 정보:', role, '관리자 여부:', isHost);

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
  // 더 이상 필요없는 상태 업데이트 제거
  // setSelectedAttendance(attendance);
  // setOpenDetailId(attendance.id);

  // 대신 해당 스케줄 ID로 상세 정보 조회
  setSelectedScheduleId(attendance.id);
  fetchAttendanceDetails(attendance.id);
};

const handleCloseDetail = () => {
  // 더 이상 필요없는 상태 업데이트 제거
  // setOpenDetailId(null);
  // setSelectedAttendance(null);
  
  // 대신 뷰를 개요로 변경
  setView('overview');
};

// 출석 상세 조회
const fetchAttendanceDetails = async (attendanceId) => {
  if (!attendanceId) return;
  
  try {
    setDetailLoading(true);
    console.log(`[AttendanceTab] 출석 상세 조회 요청: ${attendanceId}`);
    
    const response = await studyService.getHostAttendancesByAttendance(studyId, attendanceId);
    console.log('[AttendanceTab] 출석 상세 응답:', response);
    
    // API 응답에서 역할 정보 추출
    let memberRole = '';
    let isHostFromResponse = false;
    
    if (response && response.memberContext && response.memberContext.memberRole) {
      memberRole = response.memberContext.memberRole;
      console.log(`[AttendanceTab] API 응답에서 추출한 역할: ${memberRole}`);
      
      // API 응답의 역할 정보를 기준으로 관리자 여부 판단
      isHostFromResponse = memberRole === 'CREATOR' || memberRole === 'CREATER' || memberRole === 'HOST';
      console.log(`[AttendanceTab] API 응답 기준 관리자 여부: ${isHostFromResponse}`);
      
      // API 응답으로부터 얻은 역할 정보로 상태 업데이트
      setRole(memberRole);
      setIsHost(isHostFromResponse);
    }
    
    // 응답 데이터 처리
    let attendanceData = [];
    
    if (response) {
      // 스케줄 정보 추출
      const scheduleTitle = response.scheduleTitle || '';
      const scheduleStartingAt = response.scheduleStartingAt || '';
      console.log(`[AttendanceTab] 스케줄 정보: ${scheduleTitle} (${scheduleStartingAt})`);
      
      // 데이터 배열 처리
      if (response.data && Array.isArray(response.data)) {
        attendanceData = response.data.map(item => ({
          ...item,
          // attendanceStatus를 status로 매핑
          status: item.attendanceStatus,
          attendanceId: item.attendanceId,
          // memberContext 정보 추가
          studyName: response.memberContext?.studyName || '',
          memberRole: response.memberContext?.memberRole || ''
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
    
    // 오류 메시지 개선
    if (error.message === 'Network Error') {
      alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
    } else if (error.response && error.response.status === 403) {
      alert('출석 상세 정보를 볼 수 있는 권한이 없습니다.');
    }
    
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
    
    // 토큰 가져오기 - tokenUtils 사용
    const token = tokenUtils.getToken();
    if (!token) {
      console.error('[AttendanceTab] 인증 토큰이 없습니다.');
      alert('인증 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    // 1. axios를 사용한 방법
    try {
      // API 문서와 정확히 일치하는 URL 구성
      const url = `https://onrank.kr/studies/${studyId}/attendances/${attendanceId}?status=${newStatus}`;
      console.log(`[AttendanceTab] PUT 요청: ${url}`);
      
      const response = await axios.put(
        url,
        null, // 본문 데이터 없음 (null로 설정)
        {
          // CORS 이슈로 withCredentials를 false로 변경 시도
          withCredentials: false,
          headers: {
            'Authorization': token,
            // 본문 데이터가 없으므로 Content-Type 제거
            'Accept': 'application/json',
            // CORS 헤더 추가 시도
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
      
      console.log('[AttendanceTab] 상태 변경 응답 (axios):', response.data);
      handleSuccessfulUpdate();
      return;
    } catch (axiosError) {
      console.error('[AttendanceTab] Axios 요청 실패, fetch API로 재시도:', axiosError);
      // Axios로 실패했을 때 fetch로 다시 시도
    }

    // 2. fetch API를 사용한 대안
    console.log(`[AttendanceTab] fetch API로 재시도`);
    const url = `https://onrank.kr/studies/${studyId}/attendances/${attendanceId}?status=${newStatus}`;
    
    const fetchResponse = await fetch(url, {
      method: 'PUT',
      // mode: 'no-cors', // 마지막 수단으로 no-cors 모드 시도
      headers: {
        'Authorization': token,
        'Accept': 'application/json'
      },
      // credentials: 'include' // 쿠키 포함이 필요한 경우에만 활성화
    });
    
    if (fetchResponse.ok) {
      const data = await fetchResponse.json().catch(() => ({}));
      console.log('[AttendanceTab] 상태 변경 응답 (fetch):', data);
      handleSuccessfulUpdate();
    } else {
      throw new Error(`HTTP error! status: ${fetchResponse.status}`);
    }
  } catch (error) {
    console.error('[AttendanceTab] 상태 변경 실패:', error);
    
    // 오류 세부 정보 로깅
    if (error.response) {
      // 서버 응답이 있는 경우
      console.error('응답 상태 코드:', error.response.status);
      console.error('응답 데이터:', error.response.data);
      console.error('응답 헤더:', error.response.headers);
      alert(`상태 변경에 실패했습니다 (${error.response.status}): ${error.response.data?.message || '알 수 없는 오류'}`);
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못한 경우
      console.error('요청은 전송되었으나 응답이 없습니다:', error.request);
      alert('서버로부터 응답이 없습니다. 네트워크 연결을 확인해주세요.');
    } else {
      // 요청 생성 자체에 문제가 생긴 경우
      console.error('오류 메시지:', error.message);
      alert(`상태 변경 요청 중 오류 발생: ${error.message}`);
    }
  }
  
  // 성공 시 공통 처리 함수
  function handleSuccessfulUpdate() {
    // 성공 메시지 표시
    alert('출석 상태가 성공적으로 변경되었습니다.');
    
    // 상세 정보 다시 조회
    console.log(`[AttendanceTab] 상태 변경 후 상세 정보 다시 조회: ${selectedScheduleId}`);
    fetchAttendanceDetails(selectedScheduleId);
    
    // 전체 목록도 새로고침
    console.log('[AttendanceTab] 상태 변경 후 전체 목록 새로고침');
    fetchAttendances();
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