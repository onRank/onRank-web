import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { studyService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import StudySidebar from '../../../components/study/StudySidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import AttendanceList from '../../../components/study/attendance/AttendanceList';

/**
 * 출석 컨테이너 컴포넌트
 * 스터디 출석 관련 정보를 관리하고 표시하는 컨테이너 컴포넌트
 */
function AttendanceContainer() {
  console.log('[AttendanceContainer] 컴포넌트 렌더링');
  const { studyId } = useParams();
  console.log('[AttendanceContainer] 스터디 ID:', studyId);
  const { user } = useAuth();
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

  useEffect(() => {
    console.log('[AttendanceContainer] useEffect 실행. studyId:', studyId);
    
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('[AttendanceContainer] 스터디 정보 가져오기 시작');
        // 스터디 정보 가져오기
        const studyData = await studyService.getStudyById(studyId);
        console.log('[AttendanceContainer] 스터디 정보:', studyData);
        
        // 사용자가 호스트인지 확인
        setIsHost(
          (studyData && studyData.host?.userId === user?.userId) || 
          user?.role === 'ADMIN' || 
          user?.role === 'CREATOR'
        );
        console.log('[AttendanceContainer] 호스트 여부:', isHost);

        console.log('[AttendanceContainer] 출석 정보 가져오기 시작');
        // 출석 정보 가져오기
        const response = await studyService.getAttendances(studyId);
        console.log('[AttendanceContainer] 출석 데이터 원본:', response);
        
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
        
        console.log('[AttendanceContainer] 처리된 출석 데이터:', attendanceData);
        setAttendances(attendanceData);

        // 출석 통계 계산
        if (attendanceData && attendanceData.length > 0) {
          const stats = attendanceData.reduce((acc, curr) => {
            if (!curr) return acc;
            
            const status = curr.attendanceStatus || curr.status || 'UNKNOWN';
            if (status === 'PRESENT') acc.present += 1;
            else if (status === 'ABSENT') acc.absent += 1;
            else if (status === 'LATE') acc.late += 1;
            else acc.unknown += 1;
            return acc;
          }, { present: 0, absent: 0, late: 0, unknown: 0 });
          
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
  }, [studyId, user]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <StudySidebar activeTab="출석" />
      <div style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '2rem' }}>출석 관리</h1>
        
        {/* 출석 통계 */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>출석 통계</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
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
        </div>
        
        {/* 출석 목록 */}
        <AttendanceList 
          attendances={attendances} 
          isHost={isHost}
          studyId={studyId}
        />
      </div>
    </div>
  );
}

export default AttendanceContainer; 