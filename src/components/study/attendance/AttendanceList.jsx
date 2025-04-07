import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, getStatusText, getStatusIcon, STATUS_STYLES } from '../../../utils/attendanceUtils';

/**
 * 출석 목록 컴포넌트
 * 출석 정보 목록을 표시하는 컴포넌트
 */
function AttendanceList({ attendances = [], isHost, studyId, onUpdateStatus }) {
  console.log('[AttendanceList] 렌더링, 출석 데이터:', attendances);
  
  // 배열이 아닌 경우 빈 배열로 처리
  const safeAttendances = Array.isArray(attendances) ? attendances : [];
  
  console.log('[AttendanceList] 처리된 출석 데이터:', safeAttendances);

  // 출석 상태 표시 함수
  const renderStatus = (attendance) => {
    const status = attendance.attendanceStatus || 'UNKNOWN';
    
    // 상태에 따른 아이콘 선택
    let icon = null;
    if (status === 'PRESENT') {
      icon = (
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          backgroundColor: '#E50011', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          ✓
        </div>
      );
    } else if (status === 'ABSENT') {
      icon = (
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          backgroundColor: '#000', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          ✕
        </div>
      );
    } else if (status === 'LATE') {
      icon = (
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          backgroundColor: '#007BFF', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          -
        </div>
      );
    } else {
      icon = (
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          backgroundColor: '#999', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          ?
        </div>
      );
    }
    
    return icon;
  };

  return (
    <div>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        marginBottom: '1rem' 
      }}>
        출석 일정
      </h2>
      
      {safeAttendances.length === 0 ? (
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
        <div style={{ 
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* 출석 일정 목록 */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '1rem', textAlign: 'left', width: '70%' }}>일정</th>
                <th style={{ padding: '1rem', textAlign: 'right', width: '30%' }}>출석 상태</th>
              </tr>
            </thead>
            <tbody>
              {safeAttendances.map((attendance) => {
                const scheduleId = attendance.scheduleId || attendance.attendanceId;
                const formattedDate = formatDateTime(attendance.scheduleStartingAt, 'yyyy년 MM월 dd일 HH:mm');
                
                return (
                  <tr 
                    key={attendance.attendanceId} 
                    style={{ borderBottom: '1px solid #e5e5e5' }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {formattedDate}
                      </div>
                      <div style={{ color: '#666', marginTop: '0.25rem' }}>
                        {attendance.scheduleTitle || attendance.title || '일정명 없음'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                        {renderStatus(attendance)}
                        {isHost && (
                          <Link
                            to={`/studies/${studyId}/attendances/${scheduleId}/edit`}
                            style={{
                              padding: '0.5rem 0.75rem',
                              border: '1px solid #007BFF',
                              borderRadius: '4px',
                              backgroundColor: '#FFFFFF',
                              color: '#007BFF',
                              textDecoration: 'none',
                              fontSize: '14px',
                              display: 'inline-block'
                            }}
                          >
                            출석 관리
                          </Link>
                        )}
                        <Link
                          to={`/studies/${studyId}/attendances/${scheduleId}`}
                          style={{
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #E5E5E5',
                            borderRadius: '4px',
                            backgroundColor: '#FFFFFF',
                            color: '#333333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            display: 'inline-block'
                          }}
                        >
                          상세 보기
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceList; 