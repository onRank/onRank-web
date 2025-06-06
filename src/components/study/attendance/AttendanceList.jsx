import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  formatDateTime,
  getStatusText,
  getStatusIcon,
  STATUS_STYLES,
} from "../../../utils/attendanceUtils";
import { FaEdit } from "react-icons/fa";

/**
 * 출석 목록 컴포넌트
 * 출석 정보 목록을 표시하는 컴포넌트
 */
function AttendanceList({ attendances = [], isHost, studyId, onUpdateStatus }) {
  // 배열이 아닌 경우 빈 배열로 처리
  const safeAttendances = Array.isArray(attendances) ? attendances : [];

  // 마우스 오버 상태 관리
  const [hoveredId, setHoveredId] = useState(null);

  const navigate = useNavigate();

  // 출석 상태 표시 함수
  const renderStatus = (attendance) => {
    const status = attendance.attendanceStatus || "UNKNOWN";
    const styles = STATUS_STYLES[status] || STATUS_STYLES.UNKNOWN;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          width: "100%",
        }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: styles.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            border: styles.border,
          }}>
          {styles.icon}
        </div>
        <span style={{ color: styles.color }} />
      </div>
    );
  };

  // 아이콘 렌더링 함수
  const renderEditIcon = (attendance) => {
    const scheduleId = attendance.scheduleId || attendance.attendanceId;
    const isHovered = hoveredId === attendance.attendanceId;

    // 수정 버튼 클릭 시 url 이동
    const handleEdit = () => {
      navigate(`/studies/${studyId}/attendances/${scheduleId}`);
    };

    return (
      <>
        <span
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: "22px",
            zIndex: 10,
            cursor: "pointer",
          }}
          title="출석 상세"
          onClick={handleEdit}>
          <FaEdit />
        </span>
      </>
    );
  };

  return (
    <div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "1rem",
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
            backgroundColor: "#fff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "none",
          }}>
          {/* 출석 일정 목록 */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
            }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#fff",
                }}>
                <th
                  style={{
                    padding: "0.5rem",
                    textAlign: "left",
                    width: "30%",
                  }}
                />
                <th
                  style={{
                    padding: "0.5rem",
                    textAlign: "left",
                    width: "40%",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333333",
                  }}>
                  일정
                </th>
                <th
                  style={{
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "15%",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333333",
                  }}>
                  출석 상태
                </th>
                {isHost && (
                  <th
                    style={{
                      padding: "0.5rem",
                      textAlign: "center",
                      width: "15%",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#333333",
                    }}>
                    출결 변경
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {safeAttendances.map((attendance, idx) => {
                const scheduleId =
                  attendance.scheduleId || attendance.attendanceId;
                const formattedDate = formatDateTime(
                  attendance.scheduleStartingAt,
                  "yyyy.MM.dd"
                );
                const isLast = idx === safeAttendances.length - 1;

                return (
                  <tr
                    key={attendance.attendanceId}
                    style={{ background: "#fff" }}
                    onMouseEnter={() => setHoveredId(attendance.attendanceId)}
                    onMouseLeave={() => setHoveredId(null)}>
                    <td
                      style={{
                        padding: "1rem 2rem",
                        borderBottom: isLast ? "none" : "1px solid #eee",
                        background: "#fff",
                      }}>
                      <div style={{ fontSize: "14px" }}>{formattedDate}</div>
                    </td>
                    <td
                      style={{
                        padding: "1rem 0.5rem",
                        textAlign: "left",
                        borderBottom: isLast ? "none" : "1px solid #eee",
                        background: "#fff",
                      }}>
                      <div style={{ color: "#666", fontSize: "14px" }}>
                        {attendance.scheduleTitle ||
                          attendance.title ||
                          "일정명 없음"}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "1rem 0.5rem",
                        borderBottom: isLast ? "none" : "1px solid #eee",
                        background: "#fff",
                      }}>
                      {renderStatus(attendance)}
                    </td>
                    {isHost && (
                      <td
                        style={{
                          padding: "1rem 0.5rem",
                          display: "flex",
                          justifyContent: "center",
                          borderBottom: isLast ? "none" : "1px solid #eee",
                          background: "#fff",
                        }}>
                        {renderEditIcon(attendance)}
                      </td>
                    )}
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
