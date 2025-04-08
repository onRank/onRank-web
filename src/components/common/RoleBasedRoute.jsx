// src/components/common/RoleBasedRoute.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

function RoleBasedRoute({
  managerComponent: ManagerComponent,
  userComponent: UserComponent,
}) {
  const { studyId } = useParams();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 스터디 정보 가져오기
    const fetchStudyRole = () => {
      try {
        // 로컬 스토리지에서 스터디 정보 가져오기
        const cachedStudyDataStr = localStorage.getItem(`study_${studyId}`);
        if (cachedStudyDataStr) {
          const cachedStudyData = JSON.parse(cachedStudyDataStr);
          // 멤버 롤 정보 설정
          setRole(cachedStudyData.memberRole || "PARTICIPANT");
        } else {
          // 정보가 없으면 기본적으로 일반 사용자 권한 설정
          setRole("PARTICIPANT");
        }
      } catch (err) {
        console.error("역할 정보 가져오기 오류:", err);
        setRole("PARTICIPANT"); // 오류 발생 시 기본값
      } finally {
        setLoading(false);
      }
    };

    fetchStudyRole();
  }, [studyId]);

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 역할에 따라 적절한 컴포넌트 렌더링
  if (role === "CREATOR" || role === "HOST") {
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
