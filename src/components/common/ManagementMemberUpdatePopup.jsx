import React from "react";
import PropTypes from "prop-types";

function ManagementMemberUpdatePopup({ member, onClose }) {
  if (!member) return null;
  return (
    <div className="popup-content">
      <div className="modal-header">
        <h3>권한 설정</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div style={{ margin: "20px 0" }}>
        <div>
          <b>이름:</b> {member.studentName || member.name}
        </div>
        <div>
          <b>이메일:</b> {member.studentEmail || member.email}
        </div>
        {/* 실제 권한 변경 UI는 추후 구현 */}
      </div>
    </div>
  );
}

ManagementMemberUpdatePopup.propTypes = {
  member: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default ManagementMemberUpdatePopup;
