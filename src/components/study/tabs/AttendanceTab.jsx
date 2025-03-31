import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { studyService } from '../../../services/api';

const styles = {
  // 스타일 코드는 유지
};

function AttendanceTab() {
  const { studyId } = useParams();
  const [attendance, setAttendance] = useState({
    status: {
      currentDate: '2025.3.24',
      nextDate: '2025.3.24',
      startTime: '9:00 AM',
      endTime: '9:30 AM',
    },
    score: 85,
    records: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 백엔드 출석 상태 값을 프론트엔드 값으로 변환하는 함수
  const mapAttendanceStatus = (status) => {
    const statusMap = {
      'PRESENT': 'present',
      'ABSENT': 'absent',
      'LATE': 'late',
      'UNKNOWN': 'unknown'
    };
    return statusMap[status] || 'unknown';
  };

  // ISO 날짜 문자열을 사용자 친화적인 형식으로 변환
  const formatDate = (isoDateString) => {
    try {
      if (!isoDateString) return '';
      
      // ISO 날짜 형식(2025-04-01T19:00:00) 파싱
      const date = new Date(isoDateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // 표시 형식: 2025.4.1
      return `${year}.${month}.${day}`;
    } catch (e) {
      console.error('날짜 파싱 오류:', e);
      return isoDateString || ''; // 파싱 오류 시 원본 반환
    }
  };

  // 백엔드 데이터를 프론트엔드 형식으로 변환
  const transformAttendanceData = (data) => {
    try {
      if (!Array.isArray(data)) {
        console.error('출석 데이터가 배열 형식이 아닙니다:', data);
        return [];
      }
      
      // 각 출석 기록을 프론트엔드 형식으로 변환
      return data.map((item, index) => {
        const formattedDate = formatDate(item.scheduleStartingAt);
        return {
          id: item.attendanceId,
          session: `${index + 1}회차(${formattedDate})`,
          title: item.scheduleTitle || '일정',
          status: mapAttendanceStatus(item.attendanceStatus),
          startingAt: item.scheduleStartingAt,
          memberRole: item.memberRole
        };
      }).sort((a, b) => {
        // 날짜 역순으로 정렬 (최신 날짜가 먼저 오도록)
        return new Date(b.startingAt) - new Date(a.startingAt);
      });
    } catch (e) {
      console.error('출석 데이터 변환 오류:', e);
      return [];
    }
  };

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 백엔드 API 호출
        const data = await studyService.getAttendances(studyId);
        console.log('[AttendanceTab] 출석 데이터 응답:', data);
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const transformedRecords = transformAttendanceData(data);
        
        // 출석 상태 업데이트
        setAttendance(prev => {
          // 가장 최근 일정 정보 추출 (정렬된 데이터에서 첫 번째 항목)
          const nextSession = transformedRecords.length > 0 ? transformedRecords[0] : null;
          
          return {
            ...prev,
            status: {
              ...prev.status,
              // 다음 일정이 있으면 해당 정보로 업데이트
              currentDate: nextSession ? formatDate(nextSession.startingAt) : prev.status.currentDate,
              nextDate: nextSession ? formatDate(nextSession.startingAt) : prev.status.nextDate,
              nextTitle: nextSession ? nextSession.title : '',
              startTime: nextSession 
                ? new Date(nextSession.startingAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                : prev.status.startTime
            },
            records: transformedRecords
          };
        });
        
      } catch (error) {
        console.error('[AttendanceTab] 출석 데이터 조회 실패:', error);
        
        // 스터디 비회원 오류 메시지
        if (error.message.includes('스터디 회원만')) {
          setError('스터디 회원만 출석 정보를 조회할 수 있습니다.');
        } else {
          setError(`출석 정보를 불러오는 중 오류가 발생했습니다: ${error.message}`);
        }
        
        // 에러 발생해도 빈 배열로 설정하여 UI는 그려지도록 함
        setAttendance(prev => ({
          ...prev,
          records: []
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, [studyId]);

  // 출석 점수 계산 (출석=100%, 지각=50%, 결석=0%)
  const calculateAttendanceScore = () => {
    if (!attendance.records || attendance.records.length === 0) return 0;
    
    // 미정(unknown) 상태인 항목은 점수 계산에서 제외
    const completedRecords = attendance.records.filter(r => r.status !== 'unknown');
    if (completedRecords.length === 0) return 0;
    
    const totalSessions = completedRecords.length;
    let totalPoints = 0;
    
    completedRecords.forEach(record => {
      if (record.status === 'present') totalPoints += 1;
      else if (record.status === 'late') totalPoints += 0.5;
      // 결석은 0점
    });
    
    return Math.round((totalPoints / totalSessions) * 100);
  };

  // 렌더링 시 출석 점수 계산
  useEffect(() => {
    const score = calculateAttendanceScore();
    setAttendance(prev => ({
      ...prev,
      score
    }));
  }, [attendance.records]);

  // 출석 상태 아이콘 렌더링
  const renderStatusIcon = (status) => {
    let iconStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      fontWeight: 'bold',
      marginRight: '8px'
    };
    
    switch (status) {
      case 'present':
        return (
          <div style={{
            ...iconStyle,
            backgroundColor: '#4CAF50',
            color: 'white'
          }}>
            ✓
          </div>
        );
      case 'absent':
        return (
          <div style={{
            ...iconStyle,
            backgroundColor: '#F44336',
            color: 'white'
          }}>
            ✗
          </div>
        );
      case 'late':
        return (
          <div style={{
            ...iconStyle,
            backgroundColor: '#FF9800',
            color: 'white'
          }}>
            −
          </div>
        );
      case 'unknown':
      default:
        return (
          <div style={{
            ...iconStyle,
            backgroundColor: '#E0E0E0',
            color: '#757575'
          }}>
            ?
          </div>
        );
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  // 다음 일정 정보가 있는 경우에만 진행 상태 표시
  const hasUpcomingSession = attendance.status.nextTitle && 
                            attendance.status.currentDate && 
                            attendance.status.startTime;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>출석</h1>
      
      {/* 에러 메시지가 있으면 표시하지만 나머지 UI는 계속 렌더링 */}
      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem',
          backgroundColor: '#ffeeee', 
          borderRadius: '4px',
          color: '#990000'
        }}>
          {error}
        </div>
      )}
      
      {hasUpcomingSession && (
        <>
          <h2 style={styles.sectionTitle}>스터디 진행 상태</h2>
          <div style={styles.timeline}>
            <div style={styles.timelineItem}>
              <div style={{...styles.timelineIcon, ...styles.timelineIconCalendar}}>
                📅
              </div>
              <div style={styles.timelineContent}>
                <div>{attendance.status.currentDate} '{attendance.status.nextTitle}' 일정이 있습니다</div>
              </div>
              <div style={styles.timelineConnector}></div>
            </div>
            
            <div style={styles.timelineItem}>
              <div style={{...styles.timelineIcon, ...styles.timelineIconClock}}>
                ⏰
              </div>
              <div style={styles.timelineContent}>
                <div>시작 시간: {attendance.status.startTime}</div>
              </div>
            </div>
          </div>
        </>
      )}
      
      <h2 style={styles.sectionTitle}>출석 현황</h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: attendance.score >= 80 ? '#4CAF50' : 
                 attendance.score >= 60 ? '#FF9800' : '#F44336',
          marginBottom: '1rem'
        }}>
          {attendance.score}%
        </div>
        <div style={{
          width: '100%',
          height: '16px',
          backgroundColor: '#E0E0E0',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${attendance.score}%`,
            backgroundColor: attendance.score >= 80 ? '#4CAF50' : 
                            attendance.score >= 60 ? '#FF9800' : '#F44336',
            borderRadius: '8px',
            transition: 'width 0.5s ease-in-out'
          }}></div>
        </div>
        <div style={{
          marginTop: '0.5rem',
          fontSize: '14px',
          color: '#666'
        }}>
          출석: 100%, 지각: 50%, 결석: 0%
        </div>
      </div>
      
      {attendance.records.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>일정</th>
              <th style={styles.tableHeader}>일정 제목</th>
              <th style={styles.tableHeader}>시작 시간</th>
              <th style={styles.tableHeader}>출석 상태</th>
            </tr>
          </thead>
          <tbody>
            {attendance.records.map((record) => (
              <tr key={record.id}>
                <td style={styles.tableCell}>{record.session}</td>
                <td style={styles.tableCell}>{record.title}</td>
                <td style={styles.tableCell}>
                  {record.startingAt ? new Date(record.startingAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.attendanceStatus}>
                    {renderStatusIcon(record.status)}
                    <span style={{ marginLeft: '8px' }}>
                      {record.status === 'present' ? '출석' : 
                       record.status === 'absent' ? '결석' : 
                       record.status === 'late' ? '지각' : '미정'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          출석 기록이 없습니다.
        </div>
      )}
    </div>
  );
}

AttendanceTab.propTypes = {
  // 필요한 props 정의
};

export default AttendanceTab; 