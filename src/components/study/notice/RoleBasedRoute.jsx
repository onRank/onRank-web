import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

function RoleBasedRoute({
  managerComponent: ManagerComponent,
  userComponent: UserComponent,
  memberRole: propsMemberRole, // 상위 컴포넌트에서 전달받은 역할
}) {
  const { studyId } = useParams();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 상위 컴포넌트에서 전달받은 역할이 있으면 사용
    if (propsMemberRole) {
      console.log("[NoticeRole] Props에서 역할 정보 사용:", propsMemberRole);
      setRole(propsMemberRole);
      setLoading(false);
      return;
    }

    // props로 역할이 제공되지 않은 경우 localStorage에서 확인
    try {
      console.log("[NoticeRole] localStorage에서 역할 정보 확인");
      const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
      if (cachedStudyDataStr) {
        const cachedStudyData = JSON.parse(cachedStudyDataStr);
        setRole(cachedStudyData.memberRole || "PARTICIPANT");
      } else {
        setRole("PARTICIPANT");
      }
    } catch (err) {
      console.error("[NoticeRole] localStorage 읽기 오류:", err);
      setRole("PARTICIPANT");
    } finally {
      setLoading(false);
    }
  }, [studyId, propsMemberRole]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 관리자 권한이 있는지 체크 (CREATOR 또는 HOST인 경우)
  const isManager = role === "CREATOR" || role === "HOST";

  if (isManager) {
    return <ManagerComponent />;
  } else {
    return <UserComponent />;
  }
}

RoleBasedRoute.propTypes = {
  managerComponent: PropTypes.elementType.isRequired,
  userComponent: PropTypes.elementType.isRequired,
  memberRole: PropTypes.string, // memberRole은 선택적 props
};

export default RoleBasedRoute;
