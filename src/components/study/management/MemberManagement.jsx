import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import MemberAddModal from "./MemberAddModal";
import MemberCard from "./MemberCard";
import { managementService } from "../../../services/management";
import "./MemberManagement.css";
import Button from "../../common/Button";
import ManagementMemberUpdatePopup from "../../study/management/ManagementMemberUpdatePopup";

function MemberManagement() {
  const { studyId } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [processingMemberId, setProcessingMemberId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [permissionPopupMember, setPermissionPopupMember] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ left: 0, top: 0 });

  // 멤버 목록 조회 함수
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await managementService.getMembers(studyId);
      console.log("[MemberManagement] 받은 회원 데이터:", response);

      // API 응답 구조에 따라 적절히 데이터 추출
      if (response && response.data) {
        // data 필드가 배열인 경우
        if (Array.isArray(response.data)) {
          setMembers(response.data);
        }
        // data 필드가 객체이고 내부에 members 배열이 있는 경우
        else if (
          response.data.members &&
          Array.isArray(response.data.members)
        ) {
          setMembers(response.data.members);
        }
        // data 필드 자체가 객체인 경우 (배열 형태로 변환 필요)
        else if (typeof response.data === "object") {
          // 적절한 키로 멤버 데이터 배열 찾기 (API 구조에 따라 조정 필요)
          let foundMembers = null;
          const possibleArrays = ["members", "memberList", "data"];
          for (const key of possibleArrays) {
            if (response.data[key] && Array.isArray(response.data[key])) {
              foundMembers = response.data[key];
              setMembers(foundMembers);
              break;
            }
          }

          // 배열을 찾지 못한 경우 빈 배열 설정
          if (!foundMembers) {
            console.warn(
              "[MemberManagement] 회원 데이터 배열을 찾을 수 없습니다:",
              response.data
            );
            setMembers([]);
          }
        } else {
          console.warn(
            "[MemberManagement] 예상치 못한 데이터 형식:",
            response.data
          );
          setMembers([]);
        }
      } else {
        // 데이터 필드가 없는 경우
        console.warn("[MemberManagement] 회원 데이터가 없습니다:", response);
        setMembers([]);
      }
    } catch (err) {
      console.error("멤버 목록 조회 실패:", err);
      setError("멤버 목록을 불러오는데 실패했습니다.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 멤버 목록 조회
  useEffect(() => {
    fetchMembers();
  }, [studyId]);

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

  // 새 멤버 추가 후 콜백
  const handleMemberAdded = (newMember) => {
    fetchMembers();
  };

  // 디버깅을 위한 회원 데이터 출력
  console.log("[MemberManagement] 렌더링 중인 회원 데이터:", members);

  const renderRole = (member) => {
    // CREATOR 역할은 선택 변경할 수 없음
    if (member.memberRole === "CREATOR") {
      return <div className="role-badge creator">스터디 생성자</div>;
    }
  };

  // 휴대폰번호 포맷팅 함수
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === "번호 없음") return "번호 없음";

    // 숫자만 추출
    const cleaned = phoneNumber.replace(/\D/g, "");

    // 길이에 따라 형식 적용
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }

    return phoneNumber;
  };

  // MemberCard에 맞는 데이터 변환 함수
  const toMemberCardProps = (member) => ({
    name: member.studentName || "이름 없음",
    email: member.studentEmail || "이메일 없음",
    phone: formatPhoneNumber(member.studentPhoneNumber),
    university: member.studentSchool || "학교 정보 없음",
    department: member.studentDepartment || "학과 정보 없음",
    role: member.memberRole,
    memberId: member.memberId,
  });

  return (
    <div className="member-management-container">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "10px",
        }}>
        <Button
          onClick={() => setShowAddMemberModal(true)}
          variant="memberAdd"
          style={{ width: "85px", height: "34px" }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}>
        <h3 style={{ margin: "20px 0 0" }}>회원 권한</h3>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}>
        <div style={{ fontSize: "12px" }}>참여자</div>
        <div style={{ fontSize: "12px" }}>관리자</div>
        <div style={{ fontSize: "12px" }}>삭제</div>
      </div>
      {/* 회원 권한 회원 목록 */}
      <div>
        {members.length === 0 ? (
          <div style={{ color: "#aaa", padding: "8px 0" }}>
            회원이 없습니다.
          </div>
        ) : (
          members.map((member) => (
            <MemberCard
              key={member.memberId}
              member={toMemberCardProps(member)}
              onChangeRole={handleRoleChange}
              onDelete={handleDeleteMember}
            />
          ))
        )}
      </div>
      {/* 상태 메시지 표시 */}
      {statusMessage.text && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}
      {/* 회원 추가 모달 */}
      {showAddMemberModal && (
        <MemberAddModal
          studyId={studyId}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </div>
  );
}

MemberManagement.propTypes = {
  // PropTypes 정의
};

export default MemberManagement;
