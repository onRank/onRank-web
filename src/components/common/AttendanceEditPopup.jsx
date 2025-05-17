import React from "react";
import PropTypes from "prop-types";
import { FaRegEdit } from "react-icons/fa";

function AttendanceEditPopup({ open, onClose, onEdit, style }) {
  if (!open) return null;
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
          minWidth: 280,
          minHeight: 140,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: "0 0 0 0",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
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
            color: "#495c3a",
            padding: 0,
            zIndex: 2,
            outline: "none",
          }}
          aria-label="닫기">
          ×
        </button>
        {/* 점선 구분선 */}
        <div
          style={{
            width: "90%",
            borderBottom: "2px dotted #888",
            margin: "48px auto 0 auto",
          }}
        />
        {/* 수정 버튼 */}
        <div
          onClick={onEdit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "24px 32px 24px 32px",
            cursor: "pointer",
            fontSize: 20,
            color: "#222",
            background: "#fff",
            transition: "background 0.15s",
            width: "100%",
            justifyContent: "center",
          }}>
          <FaRegEdit style={{ fontSize: 24 }} />
          <span style={{ fontSize: 20 }}>수정</span>
        </div>
      </div>
    </div>
  );
}

AttendanceEditPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default AttendanceEditPopup;
