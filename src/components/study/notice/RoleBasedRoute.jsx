// src/components/common/RoleBasedRoute.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

function RoleBasedRoute({
  managerComponent: ManagerComponent,
  userComponent: UserComponent,
  memberRole: initialMemberRole,
}) {
  const { studyId } = useParams();
  const [role, setRole] = useState(initialMemberRole || null);
  const [loading, setLoading] = useState(initialMemberRole ? false : true);

  useEffect(() => {
    if (initialMemberRole) {
      setRole(initialMemberRole);
      setLoading(false);
      return;
    }

    const fetchStudyRole = () => {
      try {
        const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
        if (cachedStudyDataStr) {
          const cachedStudyData = JSON.parse(cachedStudyDataStr);
          setRole(cachedStudyData.memberRole || "PARTICIPANT");
        } else {
          setRole("PARTICIPANT");
        }
      } catch (err) {
        console.error("역할 정보 가져오기 오류:", err);
        setRole("PARTICIPANT");
      } finally {
        setLoading(false);
      }
    };

    fetchStudyRole();
  }, [studyId, initialMemberRole]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (role === "CREATER" || role === "HOST") {
    return <ManagerComponent />;
  } else {
    return <UserComponent />;
  }
}

RoleBasedRoute.propTypes = {
  managerComponent: PropTypes.elementType.isRequired,
  userComponent: PropTypes.elementType.isRequired,
  memberRole: PropTypes.string,
};

export default RoleBasedRoute;
