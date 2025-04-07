import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Chart.js 컴포넌트 등록
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * 출석률 그래프 컴포넌트
 * 출석 데이터를 받아 도넛 차트로 표시합니다.
 */
const AttendanceChart = ({ attendances }) => {
  // 출석 상태 통계 계산
  const stats = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    UNKNOWN: 0
  };
  
  // 배열이 아닌 경우 빈 배열로 처리
  const safeAttendances = Array.isArray(attendances) ? attendances : [];
  
  safeAttendances.forEach(attendance => {
    const status = attendance?.status || attendance?.attendanceStatus || 'UNKNOWN';
    if (stats.hasOwnProperty(status)) {
      stats[status] = stats[status] + 1;
    } else {
      stats.UNKNOWN = stats.UNKNOWN + 1;
    }
  });
  
  // 미인증(UNKNOWN)을 제외한 전체 일정 수 계산
  const totalExcludingUnknown = stats.PRESENT + stats.ABSENT + stats.LATE;
  
  // 출석률 계산 (미인증 제외)
  const presentRate = totalExcludingUnknown > 0 
    ? Math.round((stats.PRESENT / totalExcludingUnknown) * 100) 
    : 0;
  
  // 차트 데이터
  const chartData = {
    labels: ['출석', '미출석'],
    datasets: [
      {
        data: [presentRate, (100 - presentRate)],
        backgroundColor: ['#E50011', '#FFB2B2'],
        borderWidth: 0,
      },
    ],
  };
  
  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  };
  
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Doughnut data={chartData} options={chartOptions} />
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#E50011'
      }}>
        {presentRate}%
      </div>
    </div>
  );
};

AttendanceChart.propTypes = {
  attendances: PropTypes.array.isRequired
};

export default AttendanceChart; 