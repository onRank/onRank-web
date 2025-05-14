import React from "react";
import PropTypes from "prop-types";
import { FaTrashAlt } from "react-icons/fa";

function ManagementMemberUpdatePopup({
  member,
  onClose,
  onChangeRole,
  onDelete,
  style,
}) {
  if (!member) return null;
  const currentRole = member.role;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 1000,
        background: "#fff",
        border: "1px solid #222",
        borderRadius: 14,
        minWidth: 300,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: "0 35px",
        transform: "translate(-105%, 0)",
        ...style,
      }}>
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 0 0",
        }}>
        <span style={{ fontWeight: 500, fontSize: 18 }}>권한 설정</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#222",
          }}
          aria-label="닫기">
          ×
        </button>
      </div>
      {/* 구분선 */}
      <div style={{ borderBottom: "3px dotted #222", margin: "10px 0 0 0" }} />
      {/* 권한 선택 */}
      <div
        onClick={() => onChangeRole && onChangeRole("HOST")}
        style={{
          padding: "16px 3px",
          cursor: "pointer",
          color: currentRole === "HOST" ? "#222" : "#444",
          fontWeight: currentRole === "HOST" ? 600 : 400,
          background: currentRole === "HOST" ? "#f7f7f7" : "#fff",
        }}>
        관리자
      </div>
      <div style={{ borderBottom: "3px dotted #222", margin: 0 }} />
      <div
        onClick={() => onChangeRole && onChangeRole("PARTICIPANT")}
        style={{
          padding: "16px 3px",
          cursor: "pointer",
          color: currentRole === "PARTICIPANT" ? "#222" : "#444",
          fontWeight: currentRole === "PARTICIPANT" ? 600 : 400,
          background: currentRole === "PARTICIPANT" ? "#f7f7f7" : "#fff",
        }}>
        참여자
      </div>
      <div style={{ borderBottom: "3px dotted #222", margin: 0 }} />
      {/* 삭제 */}
      <div
        onClick={onDelete}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "16px 3px",
          cursor: "pointer",
          color: "#222",
        }}>
        <FaTrashAlt style={{ fontSize: 20 }} />
        <span>삭제</span>
      </div>
    </div>
  );
}

ManagementMemberUpdatePopup.propTypes = {
  member: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onChangeRole: PropTypes.func,
  onDelete: PropTypes.func,
  style: PropTypes.object,
};

export default ManagementMemberUpdatePopup;
