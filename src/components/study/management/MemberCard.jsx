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

  const roleButtonGroupStyle = {
    display: "flex",
    gap: 14,
    border: "2px solid #222",
    borderRadius: "8px",
    padding: "8px 4px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    alignItems: "center",
  };

  // 역할 버튼 스타일 함수
  const getRoleBtnStyle = (selected) => ({
    padding: "9px 13px",
    backgroundColor: selected ? "#ee0418" : "#fff",
    border: selected ? "1.7px solid #000" : "none",
    borderRadius: "11px",
    transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  });

  const deleteBtnStyle = {
    background: "#fff",
    padding: "0 17px",
    border: "1.7px solid #000",
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
      {!isCreator ? (
        <div style={{ display: "flex", gap: 10, height: "54px" }}>
          <div style={roleButtonGroupStyle}>
            <button
              style={getRoleBtnStyle(member.role === "PARTICIPANT")}
              title="참여자로 변경"
              onClick={() => onChangeRole(member.memberId, "PARTICIPANT")}>
              <FaUserCheck style={{ color: "#222" }} />
            </button>
            <button
              style={getRoleBtnStyle(member.role === "HOST")}
              title="관리자로 변경"
              onClick={() => onChangeRole(member.memberId, "HOST")}>
              <FaUserCog style={{ color: "#222" }} />
            </button>
          </div>
          <button
            style={deleteBtnStyle}
            title="삭제"
            onClick={() => onDelete(member.memberId)}>
            <FaUserSlash style={{ color: "#222" }} />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, height: "54px" }}>
          <div style={roleButtonGroupStyle}>
            <div style={getRoleBtnStyle(member.role === "PARTICIPANT")}>
              <FaUserCheck style={{ color: "#222" }} />
            </div>
            <div style={getRoleBtnStyle(member.role === "HOST")}>
              <FaUserCog style={{ color: "#222" }} />
            </div>
          </div>
          <div style={deleteBtnStyle}>
            <FaUserSlash style={{ color: "#222" }} />
          </div>
        </div>
      )}
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
