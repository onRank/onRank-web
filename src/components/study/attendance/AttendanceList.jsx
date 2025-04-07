import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, getStatusText, getStatusIcon, STATUS_STYLES } from '../../../utils/attendanceUtils';

/**
 * 출석 목록 컴포넌트
 * 출석 정보 목록을 표시하는 컴포넌트
 */
function AttendanceList({ attendances = [], isHost, studyId }) {
  // 배열이 아닌 경우 빈 배열로 처리
  const safeAttendances = Array.isArray(attendances) ? attendances : [];
  
  // 출석 일정 기준으로 그룹화
  const groupedAttendances = safeAttendances.reduce((acc, attendance) => {
    if (!attendance || !attendance.scheduleStartingAt) return acc;
    
    try {
      const key = new Date(attendance.scheduleStartingAt).toISOString().split('T')[0];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(attendance);
    } catch (error) {
      console.error('[AttendanceList] 날짜 변환 오류:', error, attendance);
    }
    return acc;
  }, {});

  // 날짜 기준으로 정렬된 키 배열 생성 (최신 날짜가 먼저 오도록)
  const sortedDates = Object.keys(groupedAttendances).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>출석 일정</h2>
        {isHost && (
          <Link 
            to={`/studies/${studyId}/schedules/add`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#E50011',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            일정 추가
          </Link>
        )}
      </div>

      {sortedDates.length === 0 ? (
        <div style={{
          padding: '2rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666666'
        }}>
          등록된 출석 일정이 없습니다.
        </div>
      ) : (
        sortedDates.map(date => {
          const attendancesForDate = groupedAttendances[date];
          // 각 날짜별 첫 번째 항목에서 일정 정보 추출
          const scheduleInfo = attendancesForDate[0];
          
          if (!scheduleInfo) return null;
          
          return (
            <div 
              key={date}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                marginBottom: '1rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid #E5E5E5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {formatDateTime(scheduleInfo.scheduleStartingAt, 'yyyy년 MM월 dd일')}
                    {' '}
                    {formatDateTime(scheduleInfo.scheduleStartingAt, 'HH:mm')} ~ {formatDateTime(scheduleInfo.scheduleEndingAt, 'HH:mm')}
                  </h3>
                  <div style={{ fontSize: '14px', color: '#666666' }}>
                    {scheduleInfo.scheduleName || '일정 이름 없음'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isHost ? (
                    <>
                      <Link
                        to={`/studies/${studyId}/attendances/${scheduleInfo.scheduleId}/edit`}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #007BFF',
                          borderRadius: '4px',
                          backgroundColor: '#FFFFFF',
                          color: '#007BFF',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        출석 관리
                      </Link>
                      <Link
                        to={`/studies/${studyId}/attendances/${scheduleInfo.scheduleId}`}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #E5E5E5',
                          borderRadius: '4px',
                          backgroundColor: '#FFFFFF',
                          color: '#333333',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        상세 보기
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={`/studies/${studyId}/attendances/${scheduleInfo.scheduleId}`}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #E5E5E5',
                        borderRadius: '4px',
                        backgroundColor: '#FFFFFF',
                        color: '#333333',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      상세 보기
                    </Link>
                  )}
                </div>
              </div>
              
              <div style={{ padding: '1rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '1rem'
                }}>
                  {attendancesForDate.map(attendance => {
                    if (!attendance) return null;
                    
                    const status = attendance.attendanceStatus || 'UNKNOWN';
                    const styles = STATUS_STYLES[status] || STATUS_STYLES.UNKNOWN;
                    
                    return (
                      <div 
                        key={attendance.attendanceId || `attendance-${Math.random()}`}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '4px',
                          background: styles.background,
                          border: styles.border,
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: styles.color,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            marginRight: '4px'
                          }}>
                            {getStatusIcon(status)}
                          </div>
                          <span style={{ 
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: styles.color
                          }}>
                            {getStatusText(status)}
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {attendance.studentName || '이름 없음'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AttendanceList; 