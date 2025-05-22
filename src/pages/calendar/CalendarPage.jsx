import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTheme } from '../../contexts/ThemeContext';
import calendarService from '../../services/calendar';

function CalendarPage() {
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [leftArrowColor, setLeftArrowColor] = useState(colors.textSecondary);
  const [rightArrowColor, setRightArrowColor] = useState(colors.textSecondary);
  const [calendarItems, setCalendarItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // API에서 캘린더 데이터를 불러오는 함수
  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await calendarService.getCalendarEvents();
        console.log('[CalendarPage] API Response:', response);
        
        // API 응답이 올바른 형식인지 확인
        if (response && Array.isArray(response)) {
          setCalendarItems(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setCalendarItems(response.data);
        } else {
          console.error('[CalendarPage] Unexpected API response format:', response);
          setError('캘린더 데이터 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('[CalendarPage] Calendar fetch error:', err);
        setError('캘린더 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  const handlePrevMonth = () => {
    setLeftArrowColor(colors.primary);
    setTimeout(() => setLeftArrowColor(colors.textSecondary), 200);
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setRightArrowColor(colors.primary);
    setTimeout(() => setRightArrowColor(colors.textSecondary), 200);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // 날짜에 해당하는 일정을 찾는 함수
  const getEventsForDate = (date) => {
    if (!calendarItems || calendarItems.length === 0) return [];
    
    return calendarItems.filter(item => {
      try {
        // API 응답의 time 필드가 ISO 형식인지 확인 (예: "2025-06-01T23:59:00")
        const eventDate = item.time ? parseISO(item.time) : null;
        return eventDate && isSameDay(date, eventDate);
      } catch (err) {
        console.error(`[CalendarPage] Date parsing error for item:`, item, err);
        return false;
      }
    });
  };

  // 이벤트 유형에 따른 카테고리 스타일
  const getCategoryStyle = (category) => {
    if (!category) return { color: colors.primary, backgroundColor: colors.primary + '20' };
    
    const categoryMap = {
      'ASSIGNMENT': { color: '#FF5722', backgroundColor: '#FFCCBC' },
      'SCHEDULE': { color: '#2196F3', backgroundColor: '#BBDEFB' }
    };
    
    return categoryMap[category] || { color: colors.primary, backgroundColor: colors.primary + '20' };
  };

  // 날짜 카드 내 이벤트 렌더링 함수
  const renderEvents = (date) => {
    const events = getEventsForDate(date);
    
    if (events.length === 0) return null;
    
    return (
      <div style={{
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontSize: '12px',
        overflow: 'hidden'
      }}>
        {events.slice(0, 2).map((event, index) => {
          const style = getCategoryStyle(event.category);
          const borderColor = event.colorCode || style.color;
          
          return (
            <div
              key={index}
              style={{
                backgroundColor: style.backgroundColor,
                color: style.color,
                padding: '2px 4px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderLeft: `3px solid ${borderColor}`
              }}
              title={event.title || event.studyName}
            >
              {event.title || event.studyName}
            </div>
          );
        })}
        {events.length > 2 && (
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            color: colors.textSecondary
          }}>
            +{events.length - 2}개 더보기
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          데이터를 불러오는 중...
        </div>
      )}
      
      {error && (
        <div style={{
          backgroundColor: colors.error + '20',
          color: colors.error,
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
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
          fontWeight: 'bold',
          color: colors.text
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
        borderBottom: `1px solid ${colors.border}`,
        padding: '0.5rem'
      }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            style={{
              color: index === 0 ? colors.primary : index === 6 ? colors.info : colors.text,
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
        backgroundColor: colors.border
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
                backgroundColor: colors.cardBackground,
                padding: '0.5rem',
                height: '120px',
                cursor: 'pointer',
                position: 'relative',
                color: !isCurrentMonth ? colors.textSecondary : 
                       date.getDay() === 0 ? colors.primary :
                       date.getDay() === 6 ? colors.info : colors.text,
                ...(isSelected && {
                  backgroundColor: colors.surfaceHover,
                  border: `2px solid ${colors.primary}`
                }),
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  ...(todayDate && {
                    backgroundColor: colors.primary,
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
              
              {/* 각 날짜에 해당하는 일정 표시 */}
              {renderEvents(date)}
            </div>
          );
        })}
      </div>
      
      {/* 선택된 날짜 일정 상세 보기 (필요 시 구현) */}
      {getEventsForDate(selectedDate).length > 0 && (
        <div style={{
          marginTop: '2rem',
          backgroundColor: colors.cardBackground,
          borderRadius: '8px',
          padding: '1rem',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{ marginTop: 0 }}>
            {format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })} 일정
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {getEventsForDate(selectedDate).map((event, index) => {
              const style = getCategoryStyle(event.category);
              
              return (
                <div 
                  key={index}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: style.backgroundColor,
                    borderLeft: `4px solid ${event.colorCode || style.color}`
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {event.title || event.studyName}
                  </div>
                  {event.detailList && event.detailList.length > 0 && (
                    <div style={{ fontSize: '14px' }}>
                      {event.detailList.map((detail, i) => (
                        <div key={i}>{detail.title}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage; 