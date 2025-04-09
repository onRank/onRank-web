import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { studyService } from '../../../services/api';
import AttendanceList from '../../../components/study/attendance/AttendanceList';
import AttendanceChart from '../../../components/study/attendance/AttendanceChart';
import { isStudyHost } from '../../../utils/studyRoleUtils';

/**
 * 출석 컨테이너 컴포넌트
 * 스터디의 출석 정보를 관리하는 컨테이너 컴포넌트
 */
function AttendanceContainer() {
  const { studyId } = useParams();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [statistics, setStatistics] = useState({
    present: 0, 
    absent: 0, 
    late: 0, 
    unknown: 0
  });

  // 출석 데이터 가져오기
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await studyService.getAttendances(studyId);
      console.log('[AttendanceContainer] 원본 응답:', response);
      
      // 출석 데이터 추출
      const extractedAttendances = response.data || [];
      console.log('[AttendanceContainer] 추출된 출석 데이터:', extractedAttendances);
      
      // 출석 데이터가 비어있는 경우 처리
      if (!extractedAttendances || extractedAttendances.length === 0) {
        setAttendances([]);
        setStatistics({
          present: 0,
          absent: 0,
          late: 0,
          unknown: 0
        });
        setLoading(false);
        return;
      }
      
      // 출석 데이터 형식 변환
      const formattedAttendances = extractedAttendances.map(attendance => ({
        ...attendance,
        id: attendance.attendanceId,
        scheduleId: attendance.scheduleId || attendance.attendanceId,
        formattedDateTime: attendance.scheduleStartingAt,
        status: attendance.attendanceStatus || 'UNKNOWN',
        studentName: attendance.studentName || '이름 없음'
      }));
      
      // 출석 통계 계산
      const stats = formattedAttendances.reduce((acc, attendance) => {
        const status = attendance.attendanceStatus || 'UNKNOWN';
        if (status === 'PRESENT') acc.present += 1;
        else if (status === 'ABSENT') acc.absent += 1;
        else if (status === 'LATE') acc.late += 1;
        else acc.unknown += 1;
        return acc;
      }, { present: 0, absent: 0, late: 0, unknown: 0 });
      
      // 상태 업데이트
      setAttendances(formattedAttendances);
      setStatistics(stats);
      
      // 호스트 권한 확인 - 유틸리티 함수 사용
      const userIsHost = isStudyHost(response);
      console.log('[AttendanceContainer] 호스트 여부:', userIsHost);
      
      setIsHost(userIsHost);
      
    } catch (error) {
      console.error('[AttendanceContainer] 출석 데이터 가져오기 오류:', error);
      setError('출석 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 출석 상태 업데이트 핸들러
  const handleUpdateStatus = async (attendanceId, newStatus) => {
    try {
      await studyService.updateAttendance(studyId, attendanceId, newStatus);
      fetchAttendanceData(); // 데이터 새로고침
    } catch (error) {
      console.error('[AttendanceContainer] 출석 상태 업데이트 오류:', error);
      setError('출석 상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [studyId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '2rem' 
      }}>
        출석 관리
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '1rem' 
        }}>
          출석
        </h2>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '2rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <div style={{ width: '300px', height: '300px' }}>
            <AttendanceChart attendances={attendances} />
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '1rem' 
        }}>
          출석 통계
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          {/* 출석 통계 카드 */}
          <div style={{ 
            flex: 1, 
            padding: '1.5rem', 
            borderRadius: '8px', 
            backgroundColor: '#FFE5E5', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '14px', marginBottom: '0.5rem' }}>출석</div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#E50011'
            }}>
              {statistics.present}
            </div>
          </div>
          
          <div style={{ 
            flex: 1, 
            padding: '1.5rem', 
            borderRadius: '8px', 
            backgroundColor: '#F0F0F0', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '14px', marginBottom: '0.5rem' }}>결석</div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#000000'
            }}>
              {statistics.absent}
            </div>
          </div>
          
          <div style={{ 
            flex: 1, 
            padding: '1.5rem', 
            borderRadius: '8px', 
            backgroundColor: '#E6F3FF', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '14px', marginBottom: '0.5rem' }}>지각</div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#007BFF'
            }}>
              {statistics.late}
            </div>
          </div>
          
          <div style={{ 
            flex: 1, 
            padding: '1.5rem', 
            borderRadius: '8px', 
            backgroundColor: '#F8F8F8', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '14px', marginBottom: '0.5rem' }}>미정</div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#999999'
            }}>
              {statistics.unknown}
            </div>
          </div>
        </div>
      </div>
      
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