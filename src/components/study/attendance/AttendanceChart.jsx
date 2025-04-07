import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../../../contexts/ThemeContext';

// Chart.js 컴포넌트 등록
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * 출석률 그래프 컴포넌트
 * 출석 데이터를 받아 도넛 차트로 표시합니다.
 */
const AttendanceChart = ({ attendances }) => {
  const { colors } = useTheme();
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
  
  const total = safeAttendances.length;
  const presentRate = total > 0 ? Math.round((stats.PRESENT / total) * 100) : 0;
  
  // 차트 데이터
  const chartData = {
    labels: ['출석', '미출석'],
    datasets: [
      {
        data: [stats.PRESENT, (total - stats.PRESENT)],
        backgroundColor: ['#E50011', '#FFB2B2'],
        borderWidth: 0,
      },
    ],
  };
  
  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };
  
  return (
    <div className="attendance-overview">
      <h2>출석</h2>
      <div className="attendance-chart-container">
        <div className="chart-wrapper">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="chart-center">
            <div className="percentage">{presentRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

AttendanceChart.propTypes = {
  attendances: PropTypes.array.isRequired
};

export default AttendanceChart; 