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

  // 백엔드 날짜 형식(2025-02-19-20:00)을 사용자 친화적인 형식으로 변환
  const formatDate = (dateString) => {
    try {
      // 2025-02-19-20:00 형식을 파싱
      const [year, month, day, time] = dateString.split('-');
      
      // 표시 형식: 2025.2.19
      return `${year}.${parseInt(month)}.${parseInt(day)}`;
    } catch (e) {
      console.error('날짜 파싱 오류:', e);
      return dateString; // 파싱 오류 시 원본 반환
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
          session: `${data.length - index}회차(${formattedDate})`,
          name: '일정이름', // 백엔드에서 이름 정보가 없으므로 기본값 사용
          status: mapAttendanceStatus(item.attendanceStatus)
        };
      });
    } catch (e) {
      console.error('출석 데이터 변환 오류:', e);
      return [];
    }
  };

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 백엔드 API 호출
        const data = await studyService.getAttendances(studyId);
        console.log('[AttendanceTab] 출석 데이터 응답:', data);
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const transformedRecords = transformAttendanceData(data);
        
        // 출석 상태 업데이트
        setAttendance(prev => ({
          ...prev,
          records: transformedRecords
        }));
        
      } catch (error) {
        console.error('[AttendanceTab] 출석 데이터 조회 실패:', error);
        setError('출석 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, [studyId]);

  // 출석 점수 계산 (출석=100%, 지각=50%, 결석=0%)
  const calculateAttendanceScore = () => {
    if (!attendance.records || attendance.records.length === 0) return 0;
    
    const totalSessions = attendance.records.length;
    let totalPoints = 0;
    
    attendance.records.forEach(record => {
      if (record.status === 'present') totalPoints += 1;
      else if (record.status === 'late') totalPoints += 0.5;
      // 결석과 미정은 0점
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

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return (
          <div style={styles.statusIcon} className={styles.statusIconPresent}>
            ✓
          </div>
        );
      case 'absent':
        return (
          <div style={styles.statusIcon} className={styles.statusIconAbsent}>
            ✗
          </div>
        );
      case 'late':
        return (
          <div style={styles.statusIcon} className={styles.statusIconLate}>
            −
          </div>
        );
      case 'unknown':
      default:
        return (
          <div style={styles.statusIcon} className={styles.statusIconUnknown}>
            ?
          </div>
        );
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  // 다음 일정 정보가 있는 경우에만 진행 상태 표시
  const hasUpcomingSession = attendance.records.length > 0 && 
                            attendance.records.some(r => r.status === 'unknown');

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>출석</h1>
      
      {hasUpcomingSession && (
        <>
          <h2 style={styles.sectionTitle}>스터디 진행 상태</h2>
          <div style={styles.timeline}>
            <div style={styles.timelineItem}>
              <div style={{...styles.timelineIcon, ...styles.timelineIconCalendar}}>
                📅
              </div>
              <div style={styles.timelineContent}>
                <div>{attendance.status.currentDate} '일정' 오늘 진행됩니다</div>
              </div>
              <div style={styles.timelineConnector}></div>
            </div>
            
            <div style={styles.timelineItem}>
              <div style={{...styles.timelineIcon, ...styles.timelineIconClock}}>
                ⏰
              </div>
              <div style={styles.timelineContent}>
                <div>{attendance.status.currentDate} '일정'이 곧 시작합니다</div>
                <div style={styles.timelineTime}>{attendance.status.startTime}</div>
              </div>
            </div>
          </div>
        </>
      )}
      
      <h2 style={styles.sectionTitle}>출석 현황</h2>
      <div style={styles.progressContainer}>
        <div style={styles.progressTextContainer}>
          <span style={styles.progressText}>{attendance.score}</span>
        </div>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${attendance.score}%`
            }}
          ></div>
        </div>
      </div>
      
      {attendance.records.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>일정</th>
              <th style={styles.tableHeader}>출석 상태</th>
            </tr>
          </thead>
          <tbody>
            {attendance.records.map((record) => (
              <tr key={record.id}>
                <td style={styles.tableCell}>{record.session}</td>
                <td style={styles.tableCell}>
                  <div style={styles.attendanceStatus}>
                    {renderStatusIcon(record.status)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#666' }}>
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