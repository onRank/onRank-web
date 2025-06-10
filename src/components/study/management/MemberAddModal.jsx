import React, { useState } from "react";
import PropTypes from "prop-types";
import { managementService } from "../../../services/management";
import "./MemberAddModal.css";

function MemberAddModal({ studyId, onClose, onMemberAdded }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // studentEmail만 전송 (역할은 백엔드에서 자동으로 할당됨)
      const response = await managementService.addMember(studyId, {
        studentEmail: email,
      });

      console.log("[MemberAddModal] 회원 추가 응답:", response);

      // 응답에 studyName과 memberRole이 포함된 경우 성공
      if (
        response &&
        (response.studyName !== undefined || response.memberRole !== undefined)
      ) {
        setSuccess(
          `'${
            response.studyName || "스터디"
          }'에 '${"PARTICIPANT"}' 역할로 회원이 추가되었습니다.`
        );
        setEmail("");

        // 부모 컴포넌트에 추가된 회원 정보 전달
        if (onMemberAdded) {
          onMemberAdded(response);
        }

        // 2초 후 모달 닫기
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError("회원 추가에 실패했습니다. 응답 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("[MemberAddModal] 회원 추가 실패:", err);

      // 에러 메시지가 있으면 그대로 표시하고, 없으면 기본 메시지 표시
      if (err.message) {
        setError(err.message);
      } else {
        setError(err.response?.data?.message || "회원 추가에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>회원 추가</h3>
          <button
            className="close-button"
            onClick={onClose}
            style={{ outline: "none" }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">이메일:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="초대할 사용자의 이메일"
              disabled={loading}
            />
            <p className="form-hint">
              이메일로 초대된 회원은 기본적으로 일반 회원으로 추가됩니다.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="modal-actions">
            <button
              type="submit"
              disabled={loading}
              className="modal-button submit-button">
              <span className="button-text">
                {loading ? "처리 중..." : "추가하기"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

MemberAddModal.propTypes = {
  studyId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onMemberAdded: PropTypes.func,
};

export default MemberAddModal;
