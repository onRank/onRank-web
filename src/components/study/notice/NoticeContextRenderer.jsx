import React from "react";
import PropTypes from "prop-types";
import { useNotice } from "./NoticeProvider";

function NoticeContextRenderer({
  managerComponent: ManagerComponent,
  userComponent: UserComponent,
}) {
  const { memberRole, isLoading } = useNotice();

  if (isLoading) {
    return <div>공지사항 로딩 중...</div>;
  }

  // 관리자 권한이 있는지 체크 (CREATOR 또는 HOST인 경우)
  const isManager = memberRole === "CREATOR" || memberRole === "HOST";

  console.log("[NoticeContent] 역할에 따른 렌더링:", { memberRole, isManager });

  if (isManager) {
    return <ManagerComponent />;
  } else {
    return <UserComponent />;
  }
}

NoticeContextRenderer.propTypes = {
  managerComponent: PropTypes.elementType.isRequired,
  userComponent: PropTypes.elementType.isRequired,
};

export default NoticeContext;
