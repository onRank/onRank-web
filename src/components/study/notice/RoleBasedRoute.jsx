// src/components/common/RoleBasedRoute.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { noticeService } from "../../../services/api"; // 경로 확인 필요

function RoleBasedRoute({
  managerComponent: ManagerComponent,
  userComponent: UserComponent,
}) {
  const { studyId } = useParams();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleFromNoticeAPI = async () => {
      try {
        // 공지사항 API 호출 (첫 페이지 데이터만 가볍게 요청)
        const response = await noticeService.getNotices(studyId, {
          page: 0,
          size: 1,
        });

        // memberContext에서 역할 정보 확인
        if (response.memberContext && response.memberContext.memberRole) {
          console.log(
            "[NoticeRole] API에서 역할 정보 확인:",
            response.memberContext.memberRole
          );
          setRole(response.memberContext.memberRole);
          setLoading(false);
          return;
        }

        // API 응답에 memberContext가 없는 경우 localStorage 확인
        fallbackToLocalStorage();
      } catch (error) {
        console.error("[NoticeRole] API 호출 오류:", error);
        // 오류 발생 시 localStorage 확인
        fallbackToLocalStorage();
      }
    };

    // localStorage에서 역할 정보 가져오는 폴백 함수
    const fallbackToLocalStorage = () => {
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
    };

    fetchRoleFromNoticeAPI();
  }, [studyId]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

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
