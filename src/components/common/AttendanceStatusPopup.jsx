import React from "react";
import PropTypes from "prop-types";

function AttendanceStatusPopup({
  open,
  onClose,
  onSelect,
  renderStatusIcon,
  getStatusText,
  style,
}) {
  if (!open) return null;
  const statusList = [
    { key: "PRESENT", label: "출석" },
    { key: "LATE", label: "지각" },
    { key: "ABSENT", label: "결석" },
    { key: "UNKNOWN", label: "미인증" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 1000,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #222",
          borderRadius: 18,
          minWidth: 220,
          minHeight: 320,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: "0 0 0 0",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          ...style,
        }}>
        {/* X 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: "#222",
            padding: 0,
            zIndex: 2,
          }}
          aria-label="닫기">
          ×
        </button>
        {/* 상태 선택 영역 */}
        <div style={{ padding: "38px 0 0 0", width: "100%" }}>
          {statusList.map((status, idx) => (
            <React.Fragment key={status.key}>
              {idx !== 0 && (
                <div
                  style={{ borderBottom: "2px dotted #888", margin: "0 24px" }}
                />
              )}
              <div
                onClick={() => onSelect(status.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 32px",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#222",
                  background: "#fff",
                  transition: "background 0.15s",
                }}>
                {renderStatusIcon(status.key)}
                <span style={{ fontSize: 18 }}>
                  {getStatusText(status.key)}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

AttendanceStatusPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  renderStatusIcon: PropTypes.func.isRequired,
  getStatusText: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default AttendanceStatusPopup;
