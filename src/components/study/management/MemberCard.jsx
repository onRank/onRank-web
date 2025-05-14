import React from "react";
import PropTypes from "prop-types";
import { FaUserCog } from "react-icons/fa";

function MemberCard({ member }) {
  // member: { name, email, phone, university, department }

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
      {/* 오른쪽: 아이콘 */}
      <div>
        <FaUserCog />
      </div>
    </div>
  );
}

MemberCard.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    university: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired,
  }).isRequired,
  type: PropTypes.oneOf(["approve", "member"]).isRequired,
};

export default MemberCard;
