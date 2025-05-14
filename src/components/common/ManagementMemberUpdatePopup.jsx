import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaTrashAlt } from "react-icons/fa";

function ManagementMemberUpdatePopup({ member, onClose }) {
  const [role, setRole] = useState(member?.role || "참여자");

  if (!member) return null;
  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}>
      <div
        className="modal-content"
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: 24,
          minWidth: 280,
          minHeight: 220,
          border: "1px solid #ddd",
          position: "relative",
        }}>
        <div
          className="modal-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px dotted #bbb",
            paddingBottom: 8,
          }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>
            권한 설정
          </h3>
          <button
            className="close-button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
            }}>
            ×
          </button>
        </div>
        <div style={{ margin: "20px 0 0 0" }}>
          <div
            onClick={() => setRole("관리자")}
            style={{
              padding: "16px 0",
              borderBottom: "1px dotted #bbb",
              cursor: "pointer",
              color: role === "관리자" ? "#222" : "#666",
              fontWeight: role === "관리자" ? 600 : 400,
            }}>
            관리자
          </div>
          <div
            onClick={() => setRole("참여자")}
            style={{
              padding: "16px 0",
              borderBottom: "1px dotted #bbb",
              cursor: "pointer",
              color: role === "참여자" ? "#222" : "#666",
              fontWeight: role === "참여자" ? 600 : 400,
            }}>
            참여자
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 0 0 0",
              cursor: "pointer",
              color: "#222",
            }}
            onClick={() => {
              /* 삭제 기능 구현 필요 */
            }}>
            <FaTrashAlt style={{ fontSize: 18 }} />
            <span>삭제</span>
          </div>
        </div>
      </div>
    </div>
  );
}

ManagementMemberUpdatePopup.propTypes = {
  member: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ManagementMemberUpdatePopup;
