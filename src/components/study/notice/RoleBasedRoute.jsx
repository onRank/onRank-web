import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useNotice } from "./NoticeProvider";

function RoleBasedRoute({
  managerComponent: ManagerComponent,
  userComponent: UserComponent,
}) {
  const { studyId } = useParams();
  const { memberRole } = useNotice(); // NoticeProvider에서 역할 정보 가져오기
  const [loading, setLoading] = useState(!memberRole);

  useEffect(() => {
    // memberRole이 로드되면 로딩 상태 해제
    if (memberRole) {
      setLoading(false);
    }
  }, [memberRole]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 관리자 권한이 있는지 체크 (CREATOR 또는 HOST인 경우)
  const isManager = memberRole === "CREATOR" || memberRole === "HOST";

  if (isManager) {
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
