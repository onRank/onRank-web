// src/components/auth/RoleBasedRoute.jsx
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { api } from "../../services/api";

// 권한에 따라 적절한 컴포넌트를 렌더링하는 컴포넌트
function RoleBasedRoute({
  managerComponent: ManagerComponent,
  userComponent: UserComponent,
}) {
  const { studyId } = useParams();
  const [memberRole, setMemberRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMemberRole = async () => {
      try {
        // API를 호출해서 현재 사용자의 스터디 내 역할 확인
        const response = await api.get(`/studies/${studyId}/member-role`);
        setMemberRole(response.data.memberRole);
      } catch (error) {
        console.error("멤버 권한 확인 실패:", error);
        // 오류 발생 시 기본적으로 일반 사용자 권한으로 처리
        setMemberRole("participant");
      } finally {
        setLoading(false);
      }
    };

    checkMemberRole();
  }, [studyId]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 권한에 따라 다른 컴포넌트 렌더링
  if (memberRole === "creator" || memberRole === "host") {
    return <ManagerComponent />;
  } else {
    return <UserComponent />;
  }
}

RoleBasedRoute.propTypes = {
  managerComponent: PropTypes.elementType.isRequired,
  userComponent: PropTypes.elementType.isRequired,
};

export default RoleBasedRoute;
