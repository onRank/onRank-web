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
import AttendanceStatusPopup from "../../../components/study/attendance/AttendanceStatusPopup";

/**
 * 출석 상세 페이지
 * 특정 출석 일정에 대한 상세 정보를 보여주는 페이지
 */

// 출석 상태 아이콘 렌더링 함수
const renderStatusIcon = (status, onClick) => {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.UNKNOWN;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
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
          cursor: "pointer",
        }}
        onClick={onClick}>
        {styles.icon}
      </div>
      <span style={{ color: styles.color }} />
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
    popupStyle: {},
  });
  const { isManager, updateMemberRoleFromResponse } = useStudyRole();

  // 팝업 위치 계산 함수
  const handleOpenStatusPopup = (attendanceId, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const popupWidth = 240; // 예상 팝업 너비(px)
    const popupHeight = 320; // 예상 팝업 높이(px)
    let left = rect.left - popupWidth - 12; // 아이콘 왼쪽에 위치
    let top = rect.top;
    // 화면 밖으로 나가지 않게 보정
    if (left < 8) left = 8;
    if (top + popupHeight > window.innerHeight) {
      top = window.innerHeight - popupHeight - 16;
      if (top < 8) top = 8;
    }
    setOpenPopup({
      open: true,
      attendanceId,
      popupStyle: {
        position: "fixed",
        left,
        top,
        zIndex: 1000,
      },
    });
  };

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
      setOpenPopup({ open: false, attendanceId: null, popupStyle: {} });
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
        <div style={{ flex: 1, padding: "0 1rem", marginTop: "1rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>출결 관리</h2>
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
                border: "1px solid #f5f5f5",
                padding: 0,
                overflow: "hidden",
                boxShadow: "none",
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
                        padding: "0.5rem",
                        width: "30%",
                        textAlign: "center",
                        fontSize: "15px",
                        fontWeight: 400,
                        color: "#222",
                        background: "#fff",
                        borderTopLeftRadius: "12px",
                        borderBottom: "1px solid #f0f0f0",
                      }}>
                      이름
                    </th>
                    <th style={{ width: "40%" }} />
                    <th
                      style={{
                        padding: "0.5rem",
                        width: "30%",
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
                            padding: "1rem 0.5rem",
                            fontSize: "15px",
                            color: "#222",
                            textAlign: "center",
                            borderBottomLeftRadius: isLast ? "12px" : 0,
                            background: "#fff",
                            borderBottom: isLast ? "none" : "1px solid #eee",
                          }}>
                          {attendance.studentName}
                        </td>
                        <td
                          style={{
                            background: "#fff",
                            borderBottom: isLast ? "none" : "1px solid #eee",
                          }}
                        />
                        <td
                          style={{
                            padding: "1rem 0.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottomRightRadius: isLast ? "12px" : 0,
                            background: "#fff",
                            borderBottom: isLast ? "none" : "1px solid #eee",
                          }}>
                          {renderStatusIcon(attendance.attendanceStatus, (e) =>
                            handleOpenStatusPopup(attendance.attendanceId, e)
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
                  setOpenPopup({
                    open: false,
                    attendanceId: null,
                    popupStyle: {},
                  })
                }
                onSelect={(status) =>
                  handleStatusChange(openPopup.attendanceId, status)
                }
                renderStatusIcon={renderStatusIcon}
                getStatusText={getStatusText}
                style={openPopup.popupStyle}
              />
            </div>
          )}
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
      </div>
    </div>
  );
}

export default AttendanceDetailPage;
