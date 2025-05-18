import React from "react";
import PropTypes from "prop-types";
import { FaUserCog } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa";
import { FaUserSlash } from "react-icons/fa";

function MemberCard({ member, onChangeRole, onDelete }) {
  // member: { name, email, phone, university, department }

  // 역할 표시명 가져오기
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "CREATOR":
        return "스터디 생성자";
      case "HOST":
        return "관리자";
      case "PARTICIPANT":
        return "참여자";
      default:
        return role;
    }
  };

  // 버튼 스타일
  const buttonStyle = {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    marginLeft: 8,
    boxShadow: "2px 4px 0 rgb(0,0,0)",
    border: "1.5px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  };

  const participantBtn = {
    ...buttonStyle,
    background: member.role === "PARTICIPANT" ? "#ee0418" : "#fff",
    color: member.role === "PARTICIPANT" ? "#fff" : "#ee0418",
    border:
      member.role === "PARTICIPANT"
        ? "1.5px solid #ee0418"
        : "1.5px solid #ee0418",
  };
  const hostBtn = {
    ...buttonStyle,
    background: member.role === "HOST" ? "#222" : "#fff",
    color: member.role === "HOST" ? "#fff" : "#222",
    border: member.role === "HOST" ? "1.5px solid #222" : "1.5px solid #222",
  };
  const deleteBtn = {
    ...buttonStyle,
    background: "#fff",
    color: "#222",
    border: "1.5px solid #222",
  };

  // 생성자는 버튼 비활성화
  const isCreator = member.role === "CREATOR";

  return (
    <div
      className="member-card"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "8px 0",
        gap: "16px",
      }}>
      {/* 왼쪽: 이름, 이메일, 전화번호 */}
      <div style={{ minWidth: 180 }}>
        <div style={{ fontWeight: 600 }}>{member.name}</div>
        <div style={{ color: "#888", fontSize: 14 }}>{member.email}</div>
        <div style={{ color: "#888", fontSize: 14 }}>{member.phone}</div>
      </div>
      {/* 가운데: 학교, 학과 */}
      <div style={{ color: "#888", fontSize: 14, minWidth: 100 }}>
        <div>{member.university}</div>
        <div>{member.department}</div>
      </div>
      {/* 오른쪽: 역할/삭제 버튼 */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={participantBtn}
          title="참여자로 변경"
          disabled={isCreator || member.role === "PARTICIPANT"}
          onClick={() => onChangeRole(member.memberId, "PARTICIPANT")}>
          <FaUserCheck />
        </button>
        <button
          style={hostBtn}
          title="관리자로 변경"
          disabled={isCreator || member.role === "HOST"}
          onClick={() => onChangeRole(member.memberId, "HOST")}>
          <FaUserCog />
        </button>
        <button
          style={deleteBtn}
          title="삭제"
          disabled={isCreator}
          onClick={() => onDelete(member.memberId)}>
          <FaUserSlash />
        </button>
      </div>
    </div>
  );
}

MemberCard.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string,
    university: PropTypes.string,
    department: PropTypes.string,
    role: PropTypes.string,
    memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onChangeRole: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default MemberCard;
