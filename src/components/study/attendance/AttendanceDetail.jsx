import React from 'react';
import { formatDateTime, getStatusText, getStatusIcon, STATUS_STYLES } from '../../../utils/attendanceUtils';

/**
 * 출석 상세 컴포넌트
 * 특정 일정에 대한 출석 상세 정보를 표시하는 컴포넌트
 */
function AttendanceDetail({ attendanceDetails, isLoading, isHost, onUpdateStatus }) {
  if (!attendanceDetails || attendanceDetails.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666666'
      }}>
        출석 정보가 없습니다.
      </div>
    );
  }

  // 일정 정보는 모든 항목에서 동일하므로 첫 번째 항목에서 가져옴
  const scheduleInfo = attendanceDetails[0];
  
  return (
    <div>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1rem' }}>
          {scheduleInfo.scheduleName || '일정 이름 없음'}
        </h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: '#666666', marginBottom: '0.25rem' }}>날짜</div>
            <div style={{ fontWeight: 'bold' }}>
              {formatDateTime(scheduleInfo.scheduleStartingAt, 'yyyy년 MM월 dd일')}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: '#666666', marginBottom: '0.25rem' }}>시간</div>
            <div style={{ fontWeight: 'bold' }}>
              {formatDateTime(scheduleInfo.scheduleStartingAt, 'HH:mm')} ~ {formatDateTime(scheduleInfo.scheduleEndingAt, 'HH:mm')}
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#666666', marginBottom: '0.25rem' }}>설명</div>
          <div style={{ lineHeight: '1.5' }}>
            {scheduleInfo.scheduleDescription || '설명이 없습니다.'}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>출석 현황</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '0.75rem'
      }}>
        {attendanceDetails.map((attendance) => {
          const status = attendance.attendanceStatus || 'UNKNOWN';
          const styles = STATUS_STYLES[status];
          
          return (
            <div 
              key={attendance.attendanceId}
              style={{
                padding: '1rem',
                backgroundColor: '#FFFFFF',
                border: styles.border,
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {attendance.studentName || '이름 없음'}
                </div>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px', 
                  color: styles.color 
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
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
                  {getStatusText(status)}
                  {attendance.attendanceTimeAt && (
                    <span style={{ marginLeft: '0.5rem', color: '#666666' }}>
                      (체크인: {formatDateTime(attendance.attendanceTimeAt, 'HH:mm:ss')})
                    </span>
                  )}
                </div>
              </div>

              {isHost && onUpdateStatus && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onUpdateStatus(attendance.attendanceId, 'PRESENT')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: status === 'PRESENT' ? '#E50011' : '#E5E5E5',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                    title={getStatusText('PRESENT')}
                  >
                    O
                  </button>
                  <button
                    onClick={() => onUpdateStatus(attendance.attendanceId, 'ABSENT')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: status === 'ABSENT' ? '#000' : '#E5E5E5',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                    title={getStatusText('ABSENT')}
                  >
                    X
                  </button>
                  <button
                    onClick={() => onUpdateStatus(attendance.attendanceId, 'LATE')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: status === 'LATE' ? '#007BFF' : '#E5E5E5',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                    title={getStatusText('LATE')}
                  >
                    △
                  </button>
                  <button
                    onClick={() => onUpdateStatus(attendance.attendanceId, 'UNKNOWN')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: status === 'UNKNOWN' ? '#999' : '#E5E5E5',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                    title={getStatusText('UNKNOWN')}
                  >
                    ?
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttendanceDetail; 