import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [leftArrowColor, setLeftArrowColor] = useState('#666666');
  const [rightArrowColor, setRightArrowColor] = useState('#666666');
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 달력에 표시할 전체 날짜 배열 생성 (이전 달, 현재 달, 다음 달 일부 포함)
  const startDay = monthStart.getDay(); // 0 (일요일) ~ 6 (토요일)
  const endDay = 6 - monthEnd.getDay();

  const prevMonthDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(-startDay + i + 1);
    return date;
  });

  const nextMonthDays = Array.from({ length: endDay }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(monthEnd.getDate() + i + 1);
    return date;
  });

  const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

  const handlePrevMonth = () => {
    setLeftArrowColor('#FF0000');
    setTimeout(() => setLeftArrowColor('#666666'), 200);
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setRightArrowColor('#FF0000');
    setTimeout(() => setRightArrowColor('#666666'), 200);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      {/* 달력 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <button
          onClick={handlePrevMonth}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: leftArrowColor,
            transition: 'color 0.2s'
          }}
        >
          ←
        </button>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          {format(currentDate, 'yyyy. M', { locale: ko })}
        </h2>
        <button
          onClick={handleNextMonth}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: rightArrowColor,
            transition: 'color 0.2s'
          }}
        >
          →
        </button>
      </div>

      {/* 요일 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        textAlign: 'center',
        borderBottom: '1px solid #E5E5E5',
        padding: '0.5rem'
      }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            style={{
              color: index === 0 ? '#FF0000' : index === 6 ? '#0000FF' : '#000000',
              fontSize: '14px'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: '#E5E5E5'
      }}>
        {allDays.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const todayDate = isToday(date);
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '1rem',
                minHeight: '100px',
                cursor: 'pointer',
                position: 'relative',
                color: !isCurrentMonth ? '#CCCCCC' : 
                       date.getDay() === 0 ? '#FF0000' :
                       date.getDay() === 6 ? '#0000FF' : '#000000',
                ...(isSelected && {
                  backgroundColor: '#F8F9FA',
                  border: '2px solid #FF0000'
                })
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  ...(todayDate && {
                    backgroundColor: '#FF0000',
                    color: '#FFFFFF',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  })
                }}>
                  {date.getDate()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarPage; 