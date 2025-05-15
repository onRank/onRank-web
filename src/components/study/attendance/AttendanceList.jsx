import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  formatDateTime,
  getStatusText,
  getStatusIcon,
  STATUS_STYLES,
} from "../../../utils/attendanceUtils";

/**
 * 출석 목록 컴포넌트
 * 출석 정보 목록을 표시하는 컴포넌트
 */
function AttendanceList({ attendances = [], isHost, studyId, onUpdateStatus }) {
  // 배열이 아닌 경우 빈 배열로 처리
  const safeAttendances = Array.isArray(attendances) ? attendances : [];

  // 마우스 오버 상태 관리
  const [hoveredId, setHoveredId] = useState(null);

  // 출석 상태 표시 함수 (아이콘만)
  const renderStatusIconOnly = (attendance) => {
    const status = attendance.attendanceStatus || "UNKNOWN";
    const styles = STATUS_STYLES[status] || STATUS_STYLES.UNKNOWN;
    return (
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: styles.color,
          border: styles.border || "1.5px solid #eee",
          fontSize: "1.3rem",
          margin: "0 auto",
        }}>
        {styles.icon}
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
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          textDecoration: "none",
          fontSize: "14px",
          marginRight: "8px",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.2s ease",
          zIndex: 10,
        }}
        title="출석 상세">
        ✎
      </Link>
    );
  };

  return (
    <div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "2rem",
        }}>
        출석 현황
      </h2>

      {safeAttendances.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            textAlign: "center",
            color: "#666666",
          }}>
          등록된 출석 일정이 없습니다.
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
            border: "1.5px solid #f2f2f2",
          }}>
          {/* 출석 일정 목록 */}
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f2f2f2" }}>
                <th
                  style={{
                    padding: "1rem 0.5rem",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#222",
                  }}>
                  일정
                </th>
                <th
                  style={{
                    padding: "1rem 0.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#222",
                  }}>
                  출석 상태
                </th>
              </tr>
            </thead>
            <tbody>
              {safeAttendances.map((attendance) => {
                const scheduleId =
                  attendance.scheduleId || attendance.attendanceId;
                const formattedDate = formatDateTime(
                  attendance.scheduleStartingAt,
                  "yyyy년 MM월 dd일 HH:mm"
                );

                return (
                  <tr
                    key={attendance.attendanceId}
                    style={{ borderBottom: "1px solid #f7f7f7" }}
                    onMouseEnter={() => setHoveredId(attendance.attendanceId)}
                    onMouseLeave={() => setHoveredId(null)}>
                    <td style={{ padding: "1.1rem 0.5rem" }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "#222",
                        }}>
                        {formattedDate}
                      </div>
                      <div
                        style={{
                          color: "#888",
                          fontSize: "0.95rem",
                          marginTop: "0.15rem",
                        }}>
                        {attendance.scheduleTitle ||
                          attendance.title ||
                          "일정명 없음"}
                      </div>
                    </td>
                    <td
                      style={{ padding: "1.1rem 0.5rem", textAlign: "center" }}>
                      {renderStatusIconOnly(attendance)}
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
