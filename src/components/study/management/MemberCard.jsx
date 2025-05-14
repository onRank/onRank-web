import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { FaUserCog } from "react-icons/fa";
import ManagementMemberUpdatePopup from "../../common/ManagementMemberUpdatePopup";

function MemberCard({ member, onRoleChange, onDelete }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState("bottom-right");
  const [popupAnchor, setPopupAnchor] = useState(null);
  const iconRef = useRef(null);

  // member: { name, email, phone, university, department }

  // 역할 변경 처리 함수
  const handleRoleChange = async (memberId, newRole) => {
    try {
      console.log("역할 변경 시도:", memberId, newRole);
      setProcessingMemberId(memberId);
      setStatusMessage({ text: "역할 변경 중...", type: "info" });

      // API 요청 보내기
      await managementService.changeMemberRole(studyId, memberId, newRole);

      // 응답이 돌아왔다면 성공으로 처리 (에러가 발생하지 않았으므로)
      console.log("역할 변경 성공:", memberId, newRole);

      // 성공 메시지 표시
      setStatusMessage({ text: "역할이 변경되었습니다.", type: "success" });

      // 목록 새로고침
      fetchMembers();
    } catch (error) {
      console.error("역할 변경 오류:", error);
      setStatusMessage({
        text:
          error.response?.data?.message || "역할 변경 중 오류가 발생했습니다.",
        type: "error",
      });
    } finally {
      setProcessingMemberId(null);
      setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
    }
  };

  // 멤버 삭제 처리 함수
  const handleDeleteMember = async (memberId) => {
    if (!memberId) return;

    // 스터디 생성자와 관리자는 삭제 불가
    const memberToDelete = members.find((m) => m.memberId === memberId);
    if (memberToDelete?.memberRole === "CREATOR") {
      setStatusMessage({
        text: "스터디 생성자는 삭제할 수 없습니다.",
        type: "error",
      });
      setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
      return;
    }

    if (memberToDelete?.memberRole === "HOST") {
      setStatusMessage({ text: "관리자는 삭제할 수 없습니다.", type: "error" });
      setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
      return;
    }

    if (window.confirm("정말로 이 멤버를 삭제하시겠습니까?")) {
      try {
        setProcessingMemberId(memberId);
        setStatusMessage({ text: "처리 중...", type: "info" });

        await managementService.removeMember(studyId, memberId);

        setStatusMessage({ text: "멤버가 삭제되었습니다.", type: "success" });
        fetchMembers(); // 멤버 목록 갱신
      } catch (error) {
        console.error("멤버 삭제 실패:", error);
        setStatusMessage({
          text: error.response?.data?.message || "멤버 삭제에 실패했습니다.",
          type: "error",
        });
      } finally {
        setProcessingMemberId(null);
        setTimeout(() => setStatusMessage({ text: "", type: "" }), 3000);
      }
    }
  };

  // 역할 표시명 가져오기
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "CREATOR":
        return "스터디 생성자";
      case "HOST":
        return "관리자";
      case "PARTICIPANT":
        return "일반 회원";
      default:
        return role;
    }
  };

  // 아이콘 클릭 시 팝업 위치 계산 및 showPopup true
  const handleCogClick = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      // 아이템 위치에 따라 팝업 방향 결정 (예시: 아래쪽이 화면 끝에 가까우면 위로)
      const windowHeight = window.innerHeight;
      const popupHeight = 200;
      let position = "bottom-right";
      if (rect.bottom + popupHeight > windowHeight) {
        position = "top-right";
      }
      setPopupPosition(position);
      setPopupAnchor({
        top:
          position === "top-right"
            ? rect.top + window.scrollY - popupHeight - 8
            : rect.top + window.scrollY,
        left: rect.left + rect.width + window.scrollX + 8,
      });
      setShowPopup(true);
    }
  };

  // 팝업 닫기
  const handleClosePopup = () => setShowPopup(false);

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
        <FaUserCog
          ref={iconRef}
          onClick={handleCogClick}
          style={{ cursor: "pointer" }}
        />
        {showPopup && (
          <ManagementMemberUpdatePopup
            member={member}
            onClose={handleClosePopup}
            anchorPosition={popupAnchor}
            onRoleChange={handleRoleChange}
            onDelete={handleDeleteMember}
          />
        )}
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
    memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onRoleChange: PropTypes.func,
  onDelete: PropTypes.func,
};

export default MemberCard;
