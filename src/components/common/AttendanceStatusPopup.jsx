import React from "react";

function AttendanceStatusPopup({
  open,
  onClose,
  onSelect,
  renderStatusIcon,
  getStatusText,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          minWidth: 260,
          boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        }}>
        <h4 style={{ margin: 0, marginBottom: 16 }}>출석 상태 변경</h4>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: 16 }}>
          {["PRESENT", "LATE", "ABSENT", "UNKNOWN"].map((status) => (
            <div
              key={status}
              style={{ cursor: "pointer", textAlign: "center" }}
              onClick={() => onSelect(status)}>
              {renderStatusIcon(status)}
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {getStatusText(status)}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "6px 18px",
            borderRadius: 6,
            border: "1px solid #eee",
            background: "#fafafa",
            cursor: "pointer",
          }}>
          닫기
        </button>
      </div>
    </div>
  );
}

export default AttendanceStatusPopup;
