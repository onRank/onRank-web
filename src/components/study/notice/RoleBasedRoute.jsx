import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useNotice } from "./NoticeProvider";

function RoleBasedRoute({
  managerComponent: ManagerComponent,
  userComponent: UserComponent,
}) {
  const { studyId } = useParams();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // NoticeProvider 컨텍스트에 접근 시 오류가 발생할 수 있으므로 try-catch로 감싸기
  let noticeContextValue = null;
  try {
    noticeContextValue = useNotice();
  } catch (error) {
    console.warn("[RoleBasedRoute] NoticeContext에 접근할 수 없습니다:", error);
  }

  // 컨텍스트 값이 있으면 memberRole 사용, 없으면 null
  const memberRoleFromContext = noticeContextValue?.memberRole || null;

  useEffect(() => {
    const checkRole = async () => {
      // 이미 Context에서 역할 정보를 가져왔으면 사용
      if (memberRoleFromContext) {
        console.log(
          "[RoleBasedRoute] Context에서 역할 정보 사용:",
          memberRoleFromContext
        );
        setRole(memberRoleFromContext);
        setLoading(false);
        return;
      }

      // 그렇지 않으면 localStorage에서 확인
      try {
        console.log("[RoleBasedRoute] localStorage에서 역할 정보 확인");
        const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
        if (cachedStudyDataStr) {
          const cachedStudyData = JSON.parse(cachedStudyDataStr);
          setRole(cachedStudyData.memberRole || "PARTICIPANT");
        } else {
          setRole("PARTICIPANT");
        }
      } catch (err) {
        console.error("[RoleBasedRoute] localStorage 읽기 오류:", err);
        setRole("PARTICIPANT");
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [studyId, memberRoleFromContext]);

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
};

export default RoleBasedRoute;
