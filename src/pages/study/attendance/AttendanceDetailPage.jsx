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
import AttendanceStatusPopup from "../../../components/common/AttendanceStatusPopup";

/**
 * 출석 상세 페이지
 * 특정 출석 일정에 대한 상세 정보를 보여주는 페이지
 */

// 출석 상태 아이콘 렌더링 함수 (AttendanceList와 동일하게)
const renderStatusIcon = (status, onClick) => {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.UNKNOWN;
  return (
    <div
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: styles.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: styles.color,
        border: styles.border,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}>
      {styles.icon}
    </div>
  );
};

function AttendanceDetailPage() {
  const { studyId, scheduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [openPopup, setOpenPopup] = useState({
    open: false,
    attendanceId: null,
  });
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
      setOpenPopup({ open: false, attendanceId: null });
      fetchAttendanceDetails();
    } catch (error) {
      console.error("출석 상태 변경 실패:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceDetails();
  }, [studyId, scheduleId]);

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
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #eee",
                padding: 0,
                overflow: "hidden",
              }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  borderRadius: "12px",
                  background: "#fff",
                  boxShadow: "none",
                  overflow: "hidden",
                }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "18px 0",
                        textAlign: "left",
                        fontSize: "15px",
                        fontWeight: 400,
                        color: "#222",
                        background: "#fff",
                        borderTopLeftRadius: "12px",
                        borderBottom: "1px solid #f0f0f0",
                      }}>
                      이름
                    </th>
                    <th
                      style={{
                        padding: "18px 0",
                        textAlign: "center",
                        fontSize: "15px",
                        fontWeight: 400,
                        color: "#222",
                        background: "#fff",
                        borderTopRightRadius: "12px",
                        borderBottom: "1px solid #f0f0f0",
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
                        style={{
                          borderBottom: isLast ? "none" : "1px solid #f0f0f0",
                          background: "#fff",
                        }}>
                        <td
                          style={{
                            padding: "22px 0",
                            fontSize: "15px",
                            color: "#222",
                            textAlign: "left",
                            borderBottomLeftRadius: isLast ? "12px" : 0,
                          }}>
                          {attendance.studentName}
                        </td>
                        <td
                          style={{
                            padding: "22px 0",
                            textAlign: "center",
                            borderBottomRightRadius: isLast ? "12px" : 0,
                          }}>
                          {renderStatusIcon(attendance.attendanceStatus, () =>
                            setOpenPopup({
                              open: true,
                              attendanceId: attendance.attendanceId,
                            })
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <AttendanceStatusPopup
                open={openPopup.open}
                onClose={() =>
                  setOpenPopup({ open: false, attendanceId: null })
                }
                onSelect={(status) =>
                  handleStatusChange(openPopup.attendanceId, status)
                }
                renderStatusIcon={renderStatusIcon}
                getStatusText={getStatusText}
              />
              <div
                style={{
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "flex-end",
                  padding: "0 0.5rem",
                  marginTop: "3rem",
                }}>
                <Button
                  variant="back"
                  onClick={() => navigate(`/studies/${studyId}/attendances`)}
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
