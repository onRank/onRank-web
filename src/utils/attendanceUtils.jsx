import React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { formatDate as dateUtilsFormatDate } from "./dateUtils";
import { FaCheck } from "react-icons/fa";
import { FaQuestion } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";

/**
 * 출석 상태 스타일 정의
 */
export const STATUS_STYLES = {
  PRESENT: {
    color: "#E50011",
    background: "rgba(229, 0, 17, 0.1)",
    border: "1px solid #E50011",
    icon: <FaCheck />,
  },
  ABSENT: {
    color: "#000",
    background: "rgba(0, 0, 0, 0.1)",
    border: "1px solid #000",
    icon: <FaXmark />,
  },
  LATE: {
    color: "#000",
    background: "rgba(0, 0, 0, 0.1)",
    border: "1px solid #000",
    icon: <FaMinus />,
  },
  UNKNOWN: {
    color: "#000",
    background: "rgba(0, 0, 0, 0.1)",
    border: "1px solid #000",
    icon: <FaQuestion />,
  },
};

/**
 * 그래프 색상 - 출석은 빨간색, 나머지는 분홍색
 */
export const CHART_COLORS = {
  PRESENT: "#E50011",
  ABSENT: "#000",
  LATE: "#007BFF",
  UNKNOWN: "#999",
};

/**
 * 출석 상태 코드를 텍스트로 변환하는 함수
 * @param {string} status - 출석 상태 코드 (PRESENT, ABSENT, LATE, UNKNOWN)
 * @returns {string} - 변환된 텍스트
 */
export const getStatusText = (status) => {
  switch (status) {
    case "PRESENT":
      return "출석";
    case "ABSENT":
      return "결석";
    case "LATE":
      return "지각";
    case "UNKNOWN":
    default:
      return "미인증";
  }
};

/**
 * 출석 상태 코드를 아이콘 컴포넌트로 변환하는 함수
 * @param {string} status - 출석 상태 코드 (PRESENT, ABSENT, LATE, UNKNOWN)
 * @returns {string} - 상태에 해당하는 아이콘 문자
 */
export const getStatusIcon = (status) => {
  return STATUS_STYLES[status]?.icon || STATUS_STYLES.UNKNOWN.icon;
};

/**
 * 출석 항목 데이터 포맷팅 함수
 * @param {Object} item - 원본 출석 데이터
 * @param {Object} memberContext - 멤버 컨텍스트 정보 (선택적)
 * @returns {Object} - 포맷팅된 출석 데이터
 */
export const formatAttendanceItem = (item, memberContext = null) => {
  if (!item) return null;

  // 필수 필드 추출
  const id = item.attendanceId || item.id || "";
  const scheduleId =
    item.scheduleId || (item.schedule && item.schedule.id) || "";
  const title = item.scheduleTitle || item.title || item.scheduleName || "무제";
  const startingAt =
    item.scheduleStartingAt ||
    item.startingAt ||
    (item.schedule && item.schedule.startingAt) ||
    "";
  const status = item.status || item.attendanceStatus || "UNKNOWN";
  const myStatus =
    item.myStatus ||
    (memberContext && memberContext.status) ||
    status ||
    "UNKNOWN";

  return {
    id,
    scheduleId,
    title,
    date: startingAt ? dateUtilsFormatDate(startingAt) : "날짜 없음",
    status,
    myStatus,
  };
};

/**
 * 날짜 및 시간을 포맷팅
 * @param {string|Date} date - 포맷팅할 날짜 (ISO 문자열 또는 Date 객체)
 * @param {string} formatStr - 포맷 문자열 (기본값: 'yyyy년 MM월 dd일 HH:mm')
 * @returns {string} 포맷팅된 날짜 및 시간
 */
export const formatDateTime = (date, formatStr = "yyyy년 MM월 dd일 HH:mm") => {
  if (!date) return "-";
  try {
    return format(new Date(date), formatStr, { locale: ko });
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
    return "-";
  }
};

/**
 * 날짜만 포맷팅 (시간 제외)
 * @param {string|Date} date - 포맷팅할 날짜 (ISO 문자열 또는 Date 객체)
 * @param {string} formatStr - 포맷 문자열 (기본값: 'yyyy년 MM월 dd일')
 * @returns {string} 포맷팅된 날짜
 */
export const formatDate = (date, formatStr = "yyyy년 MM월 dd일") => {
  return formatDateTime(date, formatStr);
};

/**
 * 시간만 포맷팅
 * @param {string|Date} date - 포맷팅할 날짜 (ISO 문자열 또는 Date 객체)
 * @param {string} formatStr - 포맷 문자열 (기본값: 'HH:mm')
 * @returns {string} 포맷팅된 시간
 */
export const formatTime = (date, formatStr = "HH:mm") => {
  return formatDateTime(date, formatStr);
};
