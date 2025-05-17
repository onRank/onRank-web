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
      }}
      onClick={onClose}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #222",
          borderRadius: 18,
          minWidth: 280,
          minHeight: 140,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: "2px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}>
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
            padding: "12px 32px",
            cursor: "pointer",
            fontSize: 20,
            color: "#222",
            background: "#fff",
            transition: "background 0.15s",
            width: "100%",
            justifyContent: "flex-start",
            marginBottom: "7px",
          }}>
          <FaRegEdit style={{ fontSize: 22 }} />
          <span style={{ fontSize: 16 }}>수정</span>
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
