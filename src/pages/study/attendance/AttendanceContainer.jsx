import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import AttendanceList from '../../../components/study/attendance/AttendanceList';
import AttendanceChart from '../../../components/study/attendance/AttendanceChart';
import { getStatusText, formatAttendanceItem, formatDateTime } from '../../../utils/attendanceUtils';

/**
 * 출석 컨테이너 컴포넌트
 * 스터디 출석 관련 정보를 관리하고 표시하는 컨테이너 컴포넌트
 */
function AttendanceContainer() {
  console.log('[AttendanceContainer] 컴포넌트 렌더링');
  const { studyId } = useParams();
  console.log('[AttendanceContainer] 스터디 ID:', studyId);
  const { user } = useAuth(); // 사용자 정보는 로깅용으로만 사용
  console.log('[AttendanceContainer] 사용자 정보:', user);
  const [attendances, setAttendances] = useState([]);
  const [statistics, setStatistics] = useState({
    present: 0,
    absent: 0,
    late: 0,
    unknown: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);

  // 출석 데이터 조회
  useEffect(() => {
    console.log('[AttendanceContainer] useEffect 실행. studyId:', studyId);
    
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 출석 정보 직접 가져오기
        console.log('[AttendanceContainer] 출석 정보 가져오기 시작');
        const response = await studyService.getAttendances(studyId);
        console.log('[AttendanceContainer] 출석 데이터 원본:', response);
        
        // 멤버 컨텍스트 정보 저장 (있는 경우)
        if (response && response.memberContext) {
          console.log('[AttendanceContainer] 멤버 컨텍스트:', response.memberContext);
          // 사용자가 호스트인지 확인 (memberRole이 CREATOR, ADMIN, HOST 중 하나인 경우)
          const role = response.memberContext.memberRole;
          const isUserHost = role === 'CREATOR' || role === 'ADMIN' || role === 'HOST' || role === 'CREATER';
          setIsHost(isUserHost);
          console.log('[AttendanceContainer] 호스트 여부:', isUserHost);
        }
        
        // 응답 데이터 처리
        let attendanceData = [];
        
        if (response) {
          if (Array.isArray(response)) {
            attendanceData = response;
          } else if (typeof response === 'object') {
            if (response.data && Array.isArray(response.data)) {
              attendanceData = response.data;
            } else if (response.attendances && Array.isArray(response.attendances)) {
              attendanceData = response.attendances;
            } else {
              // 다른 형식의 응답, 단일 객체일 수 있음
              attendanceData = [response];
            }
          }
        }
        
        console.log('[AttendanceContainer] 추출된 출석 데이터:', attendanceData);
        
        // 데이터가 비어있는지 확인
        if (attendanceData.length === 0) {
          console.log('[AttendanceContainer] 출석 데이터가 없습니다.');
          setAttendances([]);
          setStatistics({ present: 0, absent: 0, late: 0, unknown: 0 });
          setIsLoading(false);
          return;
        }
        
        // 포맷팅된 데이터로 변환
        const formattedData = attendanceData.map(item => {
          // 기본 형식 변환
          const formattedItem = formatAttendanceItem(item);
          // 추가 필드 포맷팅
          return {
            ...item, // 원본 데이터 유지 (scheduleId가 없는 경우에 attendanceId를 사용하기 위해)
            id: item.attendanceId || item.id || '', 
            scheduleId: item.scheduleId || '',
            formattedDateTime: formatDateTime(item.scheduleStartingAt || item.startingAt),
            status: item.attendanceStatus || item.status || 'UNKNOWN',
            studentName: item.studentName || item.memberName || '이름 없음'
          };
        });
        
        console.log('[AttendanceContainer] 처리된 출석 데이터:', formattedData);
        setAttendances(formattedData);

        // 출석 통계 계산
        if (formattedData && formattedData.length > 0) {
          const stats = formattedData.reduce((acc, curr) => {
            if (!curr) return acc;
            
            const status = curr.status || 'UNKNOWN';
            if (status === 'PRESENT') acc.present += 1;
            else if (status === 'ABSENT') acc.absent += 1;
            else if (status === 'LATE') acc.late += 1;
            else acc.unknown += 1;
            return acc;
          }, { present: 0, absent: 0, late: 0, unknown: 0 });
          
          console.log('[AttendanceContainer] 계산된 통계:', stats);
          setStatistics(stats);
        }
      } catch (error) {
        console.error('[AttendanceContainer] 출석 정보 조회 실패:', error);
        setError('출석 정보를 불러오는데 실패했습니다.');
        setAttendances([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (studyId) {
      console.log('[AttendanceContainer] studyId 존재, fetchAttendanceData 호출');
      fetchAttendanceData();
    } else {
      console.warn('[AttendanceContainer] studyId가 없음, API 호출 생략');
      setIsLoading(false);
      setError('스터디 ID가 필요합니다.');
    }
  }, [studyId]);

  // 출석 상태 업데이트 핸들러
  const handleUpdateStatus = async (attendanceId, newStatus) => {
    try {
      console.log(`[AttendanceContainer] 출석 상태 업데이트 시도. ID: ${attendanceId}, 상태: ${newStatus}`);
      
      // API 호출
      const result = await studyService.updateAttendanceStatus(studyId, attendanceId, newStatus);
      console.log("[AttendanceContainer] 출석 상태 업데이트 성공:", result);
      
      // 업데이트 성공 시 데이터 다시 조회
      const response = await studyService.getAttendances(studyId);
      console.log("[AttendanceContainer] 출석 데이터 재조회 성공:", response);
      
      // 응답 데이터 처리
      let updatedData = [];
      if (response) {
        if (Array.isArray(response)) {
          updatedData = response;
        } else if (typeof response === 'object') {
          if (response.data && Array.isArray(response.data)) {
            updatedData = response.data;
          } else if (response.attendances && Array.isArray(response.attendances)) {
            updatedData = response.attendances;
          } else {
            updatedData = [response];
          }
        }
      }
      
      // 포맷팅된 데이터로 변환
      const formattedData = updatedData.map(item => {
        const formattedItem = formatAttendanceItem(item);
        return {
          ...formattedItem,
          formattedDateTime: formatDateTime(formattedItem.startingAt || formattedItem.scheduleStartingAt),
          status: formattedItem.status || formattedItem.attendanceStatus || 'UNKNOWN',
          studentName: formattedItem.studentName || formattedItem.memberName || '이름 없음'
        };
      });
      
      setAttendances(formattedData);
      
      // 통계 재계산
      if (formattedData && formattedData.length > 0) {
        const stats = formattedData.reduce((acc, curr) => {
          if (!curr) return acc;
          
          const status = curr.status || 'UNKNOWN';
          if (status === 'PRESENT') acc.present += 1;
          else if (status === 'ABSENT') acc.absent += 1;
          else if (status === 'LATE') acc.late += 1;
          else acc.unknown += 1;
          return acc;
        }, { present: 0, absent: 0, late: 0, unknown: 0 });
        
        setStatistics(stats);
      }
      
      return true;
    } catch (error) {
      console.error('[AttendanceContainer] 출석 상태 업데이트 실패:', error);
      setError(`출석 상태 업데이트에 실패했습니다: ${error.message}`);
      return false;
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '2rem' }}>출석 관리</h1>
      
      {/* 출석 통계와 그래프 */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>출석 통계</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* 통계 수치 */}
          <div style={{ display: 'flex', gap: '1rem', flex: 3 }}>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(229, 0, 17, 0.1)',
              width: '120px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#666666' }}>출석</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#E50011' }}>{statistics.present}</div>
            </div>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(0, 0, 0, 0.1)', 
              width: '120px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#666666' }}>결석</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000' }}>{statistics.absent}</div>
            </div>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(0, 123, 255, 0.1)', 
              width: '120px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#666666' }}>지각</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007BFF' }}>{statistics.late}</div>
            </div>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(153, 153, 153, 0.1)', 
              width: '120px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#666666' }}>미정</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#999999' }}>{statistics.unknown}</div>
            </div>
          </div>
          
          {/* 차트 영역 */}
          <div style={{ flex: 2, height: '180px' }}>
            <AttendanceChart attendances={attendances} />
          </div>
        </div>
      </div>
      
      {/* 출석 목록 */}
      <AttendanceList 
        attendances={attendances} 
        isHost={isHost}
        studyId={studyId}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default AttendanceContainer; 