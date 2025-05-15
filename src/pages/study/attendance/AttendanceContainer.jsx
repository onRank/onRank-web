import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { studyService } from "../../../services/api";
import AttendanceList from "../../../components/study/attendance/AttendanceList";
import AttendanceChart from "../../../components/study/attendance/AttendanceChart";
import useStudyRole from "../../../hooks/useStudyRole";

/**
 * 출석 컨테이너 컴포넌트
 * 스터디의 출석 정보를 관리하는 컨테이너 컴포넌트
 */
function AttendanceContainer() {
  const { studyId } = useParams();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const { updateMemberRoleFromResponse, isManager } = useStudyRole();
  const [statistics, setStatistics] = useState({
    present: 0,
    absent: 0,
    late: 0,
    unknown: 0,
  });

  // 출석 데이터 가져오기
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await studyService.getAttendances(studyId);
      console.log("[AttendanceContainer] 원본 응답:", response);

      // 멤버 역할 정보 업데이트
      updateMemberRoleFromResponse(response, studyId);

      // 출석 데이터 추출
      const extractedAttendances = response.data || [];
      console.log(
        "[AttendanceContainer] 추출된 출석 데이터:",
        extractedAttendances
      );

      // 출석 데이터가 비어있는 경우 처리
      if (!extractedAttendances || extractedAttendances.length === 0) {
        setAttendances([]);
        setStatistics({
          present: 0,
          absent: 0,
          late: 0,
          unknown: 0,
        });
        setLoading(false);
        return;
      }

      // 출석 데이터 형식 변환
      const formattedAttendances = extractedAttendances.map((attendance) => ({
        ...attendance,
        id: attendance.attendanceId,
        scheduleId: attendance.scheduleId || attendance.attendanceId,
        formattedDateTime: attendance.scheduleStartingAt,
        status: attendance.attendanceStatus || "UNKNOWN",
        studentName: attendance.studentName || "이름 없음",
      }));

      // 출석 통계 계산
      const stats = formattedAttendances.reduce(
        (acc, attendance) => {
          const status = attendance.attendanceStatus || "UNKNOWN";
          if (status === "PRESENT") acc.present += 1;
          else if (status === "ABSENT") acc.absent += 1;
          else if (status === "LATE") acc.late += 1;
          else acc.unknown += 1;
          return acc;
        },
        { present: 0, absent: 0, late: 0, unknown: 0 }
      );

      // 상태 업데이트
      setAttendances(formattedAttendances);
      setStatistics(stats);

      // 호스트 권한 설정 - isManager 사용
      setIsHost(isManager);
      console.log("[AttendanceContainer] 호스트 여부:", isManager);
    } catch (error) {
      console.error("[AttendanceContainer] 출석 데이터 가져오기 오류:", error);
      setError("출석 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 출석 상태 업데이트 핸들러
  const handleUpdateStatus = async (attendanceId, newStatus) => {
    try {
      await studyService.updateAttendance(studyId, attendanceId, newStatus);
      fetchAttendanceData(); // 데이터 새로고침
    } catch (error) {
      console.error("[AttendanceContainer] 출석 상태 업데이트 오류:", error);
      setError("출석 상태 업데이트 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [studyId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: "1rem", marginTop: "1rem" }}>
      <h1 className="page-title" style={{ padding: "1rem" }}>
        출석
      </h1>

      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "2rem",
            backgroundColor: "none",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}>
          {/* 차트 배치 - 가운데 정렬 */}
          <div
            style={{
              width: "240px",
              height: "240px",
              marginRight: "4rem",
            }}>
            <AttendanceChart attendances={attendances} />
          </div>

          {/* 오른쪽에 텍스트 통계 배치 - 2x2 그리드로 변경 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gridTemplateRows: "repeat(2, 1fr)",
              gap: "1rem",
              marginLeft: "1rem",
              width: "220px",
            }}>
            {/* 출석 */}
            <div
              style={{
                border: "2px solid #E50011",
                borderRadius: "12px",
                padding: "1.2rem",
                background: "#fff",
                color: "#E50011",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 2px 8px #f5f5f5",
              }}>
              <span style={{ fontSize: "1rem", fontWeight: 500 }}>출석</span>
              <span style={{ fontSize: "1.3rem", marginTop: "0.5rem" }}>
                {statistics.present}
              </span>
            </div>
            {/* 지각 */}
            <div
              style={{
                border: "1.5px solid #ccc",
                borderRadius: "12px",
                padding: "1.2rem",
                background: "#fff",
                color: "#007BFF",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 2px 8px #f5f5f5",
              }}>
              <span
                style={{ fontSize: "1rem", fontWeight: 500, color: "#333" }}>
                지각
              </span>
              <span
                style={{
                  fontSize: "1.3rem",
                  marginTop: "0.5rem",
                  color: "#007BFF",
                }}>
                {statistics.late}
              </span>
            </div>
            {/* 미인증 */}
            <div
              style={{
                border: "1.5px solid #ccc",
                borderRadius: "12px",
                padding: "1.2rem",
                background: "#fff",
                color: "#999",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 2px 8px #f5f5f5",
              }}>
              <span
                style={{ fontSize: "1rem", fontWeight: 500, color: "#333" }}>
                미인증
              </span>
              <span
                style={{
                  fontSize: "1.3rem",
                  marginTop: "0.5rem",
                  color: "#999",
                }}>
                {statistics.unknown}
              </span>
            </div>
            {/* 결석 */}
            <div
              style={{
                border: "1.5px solid #ccc",
                borderRadius: "12px",
                padding: "1.2rem",
                background: "#fff",
                color: "#000",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: "0 2px 8px #f5f5f5",
              }}>
              <span
                style={{ fontSize: "1rem", fontWeight: 500, color: "#333" }}>
                결석
              </span>
              <span
                style={{
                  fontSize: "1.3rem",
                  marginTop: "0.5rem",
                  color: "#000",
                }}>
                {statistics.absent}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AttendanceList
        attendances={attendances}
        isHost={isHost}
        studyId={studyId}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default AttendanceContainer;
