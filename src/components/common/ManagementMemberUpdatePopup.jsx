import React from "react";
import PropTypes from "prop-types";
import "./ManagementMemberUpdatePopup.css";

function ManagementMemberUpdatePopup({ member, onClose, anchorPosition }) {
  if (!member) return null;

  // anchorPosition: { top, left } 형태로 위치 지정
  const popupStyle = anchorPosition
    ? {
        position: "absolute",
        top: anchorPosition.top,
        left: anchorPosition.left,
      }
    : {};

  return (
    <div className="popup-content" style={popupStyle}>
      <div className="popup-header">
        <h3>권한 설정</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <hr className="popup-divider" />
      <div className="popup-item">관리자</div>
      <hr className="popup-divider" />
      <div className="popup-item">참여자</div>
      <hr className="popup-divider" />
      <div
        className="popup-item"
        style={{ display: "flex", alignItems: "center", color: "#222" }}>
        <span style={{ fontSize: 18, marginRight: 6 }}>🗑️</span> 삭제
      </div>
    </div>
  );
}

ManagementMemberUpdatePopup.propTypes = {
  member: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  anchorPosition: PropTypes.shape({
    top: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    left: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default ManagementMemberUpdatePopup;
