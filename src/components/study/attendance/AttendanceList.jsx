import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, getStatusText, getStatusIcon, STATUS_STYLES } from '../../../utils/attendanceUtils';

/**
 * 출석 목록 컴포넌트
 * 출석 정보 목록을 표시하는 컴포넌트
 */
function AttendanceList({ attendances = [], isHost, studyId, onUpdateStatus }) {
  // 배열이 아닌 경우 빈 배열로 처리
  const safeAttendances = Array.isArray(attendances) ? attendances : [];

  // 마우스 오버 상태 관리
  const [hoveredId, setHoveredId] = useState(null);

  // 출석 상태 표시 함수
  const renderStatus = (attendance) => {
    const status = attendance.attendanceStatus || 'UNKNOWN';
    const styles = STATUS_STYLES[status] || STATUS_STYLES.UNKNOWN;
    
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          backgroundColor: styles.color, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          border: styles.border
        }}>
          {styles.icon}
        </div>
        <span style={{ color: styles.color }}>
          {getStatusText(status)}
        </span>
      </div>
    );
  };

  // 연필 아이콘 렌더링 함수
  const renderEditIcon = (attendance) => {
    const scheduleId = attendance.scheduleId || attendance.attendanceId;
    const isHovered = hoveredId === attendance.attendanceId;
    
    return (
      <Link
        to={`/studies/${studyId}/attendances/${scheduleId}`}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          textDecoration: 'none',
          fontSize: '14px',
          marginRight: '8px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        title="출석 상세"
      >
        ✎
      </Link>
    );
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
                    onMouseEnter={() => setHoveredId(attendance.attendanceId)}
                    onMouseLeave={() => setHoveredId(null)}
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
                        {isHost && renderEditIcon(attendance)}
                        {renderStatus(attendance)}
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