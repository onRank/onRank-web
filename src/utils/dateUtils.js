// 기존 함수 유지 (로케일 기반 포맷팅)
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

// yyyy.MM.dd 형식 포맷팅 함수 (새로 추가)
export const formatDateYMD = (isoDateString) => {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 시간 포맷팅 함수
export const formatTime = (isoDateString) => {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  // AM/PM 포맷 적용
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // 12시간제로 변환
  
  return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
};

// 날짜+시간 포맷팅 함수
export const formatDateTime = (isoDateString) => {
  if (!isoDateString) return '';
  const dateStr = formatDateYMD(isoDateString);
  const timeStr = formatTime(isoDateString);
  return `${dateStr} ${timeStr}`;
};

// 기타 유틸리티 함수들
export const convertToISODate = (dateString, timeString = '00:00:00') => {
  if (!dateString) return '';
  return `${dateString.replace(/\./g, '-')}T${timeString}`;
};

export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};