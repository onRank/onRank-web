import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyService, tokenUtils } from '../../../services/api';
import { IoChevronBackOutline } from "react-icons/io5";
import AuthContext from '../../../contexts/AuthContext';
import AttendanceChart from '../../../components/study/attendance/AttendanceChart';
import AttendanceList from '../../../components/study/attendance/AttendanceList';
import AttendanceDetail from '../../../components/study/attendance/AttendanceDetail';
import { formatAttendanceItem } from '../../../utils/attendanceUtils';
import '../../../styles/attendanceTab.css';
import axios from 'axios';

/**
 * 출석 기능을 담당하는 컨테이너 컴포넌트
 * 출석 데이터 조회, 상태 관리, 출석 상태 변경 등의 기능을 관리
 */
const AttendanceContainer = () => {
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
      console.error('[AttendanceContainer] 토큰에서 역할 정보 추출 실패:', error);
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
  
  console.log('[AttendanceContainer] 초기 역할 정보:', role, '관리자 여부:', isHost);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AttendanceContainer] 출석 목록 조회 요청');
    
      const response = await studyService.getAttendances(studyId);
      console.log('[AttendanceContainer] 출석 목록 응답:', response);
      
      // 응답 형식 처리
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
      
      console.log('[AttendanceContainer] 처리된 출석 목록:', formattedAttendances);
      setAttendances(formattedAttendances);
      
      // 첫 번째 항목을 기본 선택하지만 상세 뷰로 전환하지 않음
      if (formattedAttendances.length > 0 && !selectedScheduleId) {
        setSelectedScheduleId(formattedAttendances[0].id);
      }
    } catch (error) {
      console.error('[AttendanceContainer] 출석 목록 조회 실패:', error);
      setError('출석 정보를 불러오는 중 오류가 발생했습니다.');
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  // 출석 상세 조회
  const fetchAttendanceDetails = async (attendanceId) => {
    if (!attendanceId) return;
    
    try {
      setDetailLoading(true);
      console.log(`[AttendanceContainer] 출석 상세 조회 요청: ${attendanceId}`);
      
      const response = await studyService.getHostAttendancesByAttendance(studyId, attendanceId);
      console.log('[AttendanceContainer] 출석 상세 응답:', response);
      
      // API 응답에서 역할 정보 추출
      let memberRole = '';
      let isHostFromResponse = false;
      
      if (response && response.memberContext && response.memberContext.memberRole) {
        memberRole = response.memberContext.memberRole;
        console.log(`[AttendanceContainer] API 응답에서 추출한 역할: ${memberRole}`);
        
        // API 응답의 역할 정보를 기준으로 관리자 여부 판단
        isHostFromResponse = memberRole === 'CREATOR' || memberRole === 'CREATER' || memberRole === 'HOST';
        console.log(`[AttendanceContainer] API 응답 기준 관리자 여부: ${isHostFromResponse}`);
        
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
        console.log(`[AttendanceContainer] 스케줄 정보: ${scheduleTitle} (${scheduleStartingAt})`);
        
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
      
      console.log('[AttendanceContainer] 처리된 출석 상세 데이터:', attendanceData);
      setDetailData(attendanceData);
      
      // 상세 보기로 전환
      setView('detail');
    } catch (error) {
      console.error('[AttendanceContainer] 출석 상세 조회 실패:', error);
      
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
      console.log(`[AttendanceContainer] 상태 변경 시도: attendanceId=${attendanceId}, newStatus=${newStatus}`);
      
      if (!attendanceId) {
        console.error('[AttendanceContainer] 출석 ID가 없어 상태를 변경할 수 없습니다.');
        alert('출석 ID가 없어 상태를 변경할 수 없습니다.');
        return;
      }
      
      if (!studyId) {
        console.error('[AttendanceContainer] 스터디 ID가 없어 상태를 변경할 수 없습니다.');
        alert('스터디 ID가 없어 상태를 변경할 수 없습니다.');
        return;
      }
      
      // 상태값 검증
      if (!['PRESENT', 'ABSENT', 'LATE', 'UNKNOWN'].includes(newStatus)) {
        console.error(`[AttendanceContainer] 잘못된 상태값: ${newStatus}`);
        alert('잘못된 상태값입니다.');
        return;
      }
      
      // 토큰 가져오기 - tokenUtils 사용
      const token = tokenUtils.getToken();
      if (!token) {
        console.error('[AttendanceContainer] 인증 토큰이 없습니다.');
        alert('인증 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }

      // 1. axios를 사용한 방법
      try {
        // API 문서와 정확히 일치하는 URL 구성
        const url = `https://onrank.kr/studies/${studyId}/attendances/${attendanceId}?status=${newStatus}`;
        console.log(`[AttendanceContainer] PUT 요청: ${url}`);
        
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
        
        console.log('[AttendanceContainer] 상태 변경 응답 (axios):', response.data);
        handleSuccessfulUpdate();
        return;
      } catch (axiosError) {
        console.error('[AttendanceContainer] Axios 요청 실패, fetch API로 재시도:', axiosError);
        // Axios로 실패했을 때 fetch로 다시 시도
      }

      // 2. fetch API를 사용한 대안
      console.log(`[AttendanceContainer] fetch API로 재시도`);
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
        console.log('[AttendanceContainer] 상태 변경 응답 (fetch):', data);
        handleSuccessfulUpdate();
      } else {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }
    } catch (error) {
      console.error('[AttendanceContainer] 상태 변경 실패:', error);
      
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
      console.log(`[AttendanceContainer] 상태 변경 후 상세 정보 다시 조회: ${selectedScheduleId}`);
      fetchAttendanceDetails(selectedScheduleId);
      
      // 전체 목록도 새로고침
      console.log('[AttendanceContainer] 상태 변경 후 전체 목록 새로고침');
      fetchAttendances();
    }
  };

  // 일정 선택 핸들러
  const handleSelectSchedule = (scheduleId) => {
    if (!scheduleId) return;
    
    console.log(`[AttendanceContainer] 일정 선택: ${scheduleId}`);
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
                <AttendanceList 
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
};

export default AttendanceContainer; 