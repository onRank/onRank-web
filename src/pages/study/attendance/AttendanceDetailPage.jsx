import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studyService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import StudySidebarContainer from "../../../components/common/sidebar/StudySidebarContainer";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import {
  getStatusText,
  getStatusIcon,
  STATUS_STYLES,
  formatDateTime,
} from "../../../utils/attendanceUtils";
import useStudyRole from "../../../hooks/useStudyRole";
import Button from "../../../components/common/Button";

/**
 * 출석 상세 페이지
 * 특정 출석 일정에 대한 상세 정보를 보여주는 페이지
 */
function AttendanceDetailPage() {
  const { studyId, scheduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleStartingAt, setScheduleStartingAt] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const { isManager, updateMemberRoleFromResponse } = useStudyRole();

  const fetchAttendanceDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await studyService.getAttendanceDetails(
        studyId,
        scheduleId
      );
      console.log("응답 데이터:", response);

      // 멤버 역할 정보 업데이트
      updateMemberRoleFromResponse(response, studyId);

      if (response.data && Array.isArray(response.data)) {
        setAttendanceDetails(response.data);
        setScheduleTitle(response.scheduleTitle);
        setScheduleStartingAt(response.scheduleStartingAt);
        setIsHost(isManager);
      } else {
        setError("출석 데이터 형식이 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("[AttendanceDetailPage] 출석 상세 정보 조회 실패:", error);
      setError("출석 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      await studyService.updateAttendance(studyId, attendanceId, newStatus);
      setOpenDropdownId(null);
      fetchAttendanceDetails();
    } catch (error) {
      console.error("출석 상태 변경 실패:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceDetails();
  }, [studyId, scheduleId]);

  const toggleDropdown = (attendanceId) => {
    if (openDropdownId === attendanceId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(attendanceId);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ display: "flex", gap: "2rem", width: "100%" }}>
        <StudySidebarContainer activeTab="출석" />
        <div style={{ flex: 1 }}>
          <h2 style={{ padding: "0 1rem", marginTop: "1rem" }}>출석 수정</h2>
          {/* 여기에 출석 상세 컴포넌트 */}
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <div
              style={{
                backgroundColor: "none",
                borderRadius: "8px",
                padding: "1rem",
              }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  borderRadius: "12px",
                  overflow: "hidden",
                }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #e5e5e5",
                      backgroundColor: "#fff",
                    }}>
                    <th
                      style={{
                        padding: "0.5rem",
                        textAlign: "center",
                        width: "30%",
                        fontSize: "14px",
                        fontWeight: "400",
                        color: "#333333",
                        backgroundColor: "#fff",
                        borderTopLeftRadius: "12px",
                      }}>
                      이름
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        width: "40%",
                        backgroundColor: "#fff",
                      }}
                    />
                    <th
                      style={{
                        padding: "0.5rem",
                        textAlign: "center",
                        width: "30%",
                        fontSize: "14px",
                        fontWeight: "400",
                        color: "#333333",
                        backgroundColor: "#fff",
                        borderTopRightRadius: "12px",
                      }}>
                      출석 상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceDetails.map((attendance, idx) => {
                    const isLast = idx === attendanceDetails.length - 1;
                    return (
                      <tr
                        key={attendance.attendanceId}
                        style={{ borderBottom: "1px solid #e5e5e5" }}>
                        <td
                          style={{
                            padding: "1rem",
                            fontSize: "14px",
                            textAlign: "center",
                            ...(isLast
                              ? { borderBottomLeftRadius: "12px" }
                              : {}),
                          }}>
                          {attendance.studentName}
                        </td>
                        <td style={{ padding: "1rem" }} />
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "center",
                            ...(isLast
                              ? { borderBottomRightRadius: "12px" }
                              : {}),
                          }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "1rem",
                              position: "relative",
                            }}>
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#666",
                                textDecoration: "none",
                                fontSize: "14px",
                                marginRight: "8px",
                                cursor: "pointer",
                                zIndex: 10,
                              }}
                              onClick={() =>
                                toggleDropdown(attendance.attendanceId)
                              }>
                              {STATUS_STYLES[attendance.attendanceStatus].icon}
                            </div>

                            {/* 드롭다운 메뉴 */}
                            {openDropdownId === attendance.attendanceId && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  right: "0",
                                  backgroundColor: "white",
                                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                  borderRadius: "4px",
                                  padding: "0.5rem",
                                  display: "flex",
                                  gap: "0.5rem",
                                  zIndex: 10,
                                }}>
                                <div
                                  onClick={() =>
                                    handleStatusChange(
                                      attendance.attendanceId,
                                      "PRESENT"
                                    )
                                  }
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                      STATUS_STYLES["PRESENT"].background,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: STATUS_STYLES["PRESENT"].color,
                                    cursor: "pointer",
                                    border: `1px solid ${STATUS_STYLES["PRESENT"].color}`,
                                  }}
                                  title="출석">
                                  {STATUS_STYLES["PRESENT"].icon}
                                </div>
                                <div
                                  onClick={() =>
                                    handleStatusChange(
                                      attendance.attendanceId,
                                      "LATE"
                                    )
                                  }
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                      STATUS_STYLES["LATE"].background,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: STATUS_STYLES["LATE"].color,
                                    cursor: "pointer",
                                    border: `1px solid ${STATUS_STYLES["LATE"].color}`,
                                  }}
                                  title="지각">
                                  {STATUS_STYLES["LATE"].icon}
                                </div>
                                <div
                                  onClick={() =>
                                    handleStatusChange(
                                      attendance.attendanceId,
                                      "ABSENT"
                                    )
                                  }
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                      STATUS_STYLES["ABSENT"].background,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: STATUS_STYLES["ABSENT"].color,
                                    cursor: "pointer",
                                    border: `1px solid ${STATUS_STYLES["ABSENT"].color}`,
                                  }}
                                  title="결석">
                                  {STATUS_STYLES["ABSENT"].icon}
                                </div>
                                <div
                                  onClick={() =>
                                    handleStatusChange(
                                      attendance.attendanceId,
                                      "UNKNOWN"
                                    )
                                  }
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                      STATUS_STYLES["UNKNOWN"].background,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: STATUS_STYLES["UNKNOWN"].color,
                                    cursor: "pointer",
                                    border: `1px solid ${STATUS_STYLES["UNKNOWN"].color}`,
                                  }}
                                  title="미정">
                                  {STATUS_STYLES["UNKNOWN"].icon}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div
                style={{
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "flex-end",
                  marginTop: "2rem",
                }}>
                <Button
                  variant="back"
                  onClick={() => navigate(`/studies/${studyId}/attendance`)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceDetailPage;
