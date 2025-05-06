import React, { useState, useEffect, memo } from "react";
import PropTypes from "prop-types";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";
import useStudyRole from "../../../hooks/useStudyRole";
import StudyInfoHeader from "./StudyInfoHeader";
import StudyNavigation from "./StudyNavigation";
import studyContextService from "../../../services/studyContext";
import { IoHome, IoChevronForward } from "react-icons/io5";

// 스터디 사이드바 컨테이너 컴포넌트
const StudySidebarContainer = memo(({ activeTab, subPage }) => {
  const { studyId } = useParams();
  const { colors } = useTheme();
  const { memberRole, updateMemberRole } = useStudyRole();
  const [studyInfo, setStudyInfo] = useState({
    studyName: "",
    studyImageUrl: null,
  });

  console.log(
    "[StudySidebarContainer] 렌더링, studyId:",
    studyId,
    "memberRole:",
    memberRole
  );

  // 컴포넌트 마운트 시 스터디 정보 로드
  useEffect(() => {
    // 캐시된 스터디 컨텍스트 정보 가져오기
    const cachedContext = studyContextService.getStudyContext(studyId);

    console.log("[StudySidebarContainer] 캐시된 컨텍스트:", cachedContext);

    if (cachedContext) {
      // 스터디 정보 설정
      setStudyInfo({
        studyName: cachedContext.studyName || "",
        studyImageUrl: cachedContext.studyImageUrl || null,
      });

      // 역할 정보 설정 (memberRole이 없는 경우에만)
      if (
        cachedContext.memberRole &&
        (!memberRole || memberRole !== cachedContext.memberRole)
      ) {
        console.log(
          "[StudySidebarContainer] 캐시에서 역할 업데이트:",
          cachedContext.memberRole
        );
        updateMemberRole(cachedContext.memberRole, studyId);
      }

      console.log(
        `[StudySidebarContainer] 캐시된 스터디 정보 사용: ${cachedContext.studyName}`
      );
    } else {
      console.log(
        `[StudySidebarContainer] 캐시된 스터디 정보 없음: ${studyId}`
      );
    }
  }, [studyId, memberRole, updateMemberRole]);

  // 1초마다 스터디 정보 업데이트 감지
  useEffect(() => {
    const checkForUpdates = setInterval(() => {
      const latestContext = studyContextService.getStudyContext(studyId);
      if (latestContext) {
        // 현재 memberRole 값 (API 응답 또는 캐시된 값)
        const currentContextRole = latestContext.memberRole;

        // 이미지나 이름이 변경된 경우 업데이트
        if (
          latestContext.studyName !== studyInfo.studyName ||
          latestContext.studyImageUrl !== studyInfo.studyImageUrl
        ) {
          console.log("[StudySidebarContainer] 스터디 정보 변경 감지");
          setStudyInfo({
            studyName: latestContext.studyName || studyInfo.studyName,
            studyImageUrl:
              latestContext.studyImageUrl || studyInfo.studyImageUrl,
          });
        }

        // 역할이 변경된 경우 업데이트
        if (currentContextRole && currentContextRole !== memberRole) {
          console.log("[StudySidebarContainer] 역할 변경 감지:", {
            old: memberRole,
            new: currentContextRole,
          });

          updateMemberRole(currentContextRole, studyId);
        }
      }
    }, 1000);

    return () => clearInterval(checkForUpdates);
  }, [studyId, studyInfo, memberRole, updateMemberRole]);

  // 브레드크럼 조건부 표시를 위한 함수
  const renderBreadcrumb = () => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.85rem 1.2rem",
          margin: "0.75rem auto",
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #000",
          maxWidth: "95%",
          boxShadow: "4px 4px 0px rgba(0, 0, 0, 0.9)"
        }}
      >
        <Link
          to={`/studies/${studyId}`}
          style={{ color: "#333", display: "flex", alignItems: "center" }}
        >
          <IoHome size={20} />
        </Link>

        <IoChevronForward
          size={16}
          style={{ margin: "0 0.75rem", color: "#000" }}
        />

        {activeTab && (
          <Link
            to={`/studies/${studyId}/${getPathFromTab(activeTab)}`}
            style={{
              color: subPage ? "#333" : "#FF0000",
              fontWeight: subPage ? "normal" : "bold",
              textDecoration: "none",
            }}
          >
            {activeTab}
          </Link>
        )}

        {subPage && (
          <>
            <IoChevronForward
              size={16}
              style={{ margin: "0 0.75rem", color: "#000" }}
            />
            <span style={{ color: "#FF0000", fontWeight: "bold" }}>
              {subPage}
            </span>
          </>
        )}
      </div>
    );
  };

  // 탭 이름에서 경로를 가져오는 도우미 함수
  const getPathFromTab = (tab) => {
    const pathMap = {
      공지사항: "notices",
      일정: "schedules",
      과제: "assignment",
      게시판: "posts",
      출석: "attendances",
      관리: "management",
      랭킹: "ranking",
    };
    return pathMap[tab] || "";
  };

  return (
    <div
      style={{
        width: "240px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: colors.cardBackground,
        flexShrink: 0,
        border: "1px solid #000",
        display: "flex",
        flexDirection: "column",
        margin: "0.5rem 0",
        alignSelf: "flex-start",
        position: "sticky",
        top: "1rem",
        maxHeight: "calc(100vh - 2rem)",
      }}
    >
      {/* 스터디 정보 헤더 (이미지와 이름) */}
      <StudyInfoHeader
        studyName={studyInfo.studyName}
        studyImageUrl={studyInfo.studyImageUrl}
      />

      {/* 브레드크럼 네비게이션 */}
      {renderBreadcrumb()}

      {/* 스터디 네비게이션 메뉴 - 스크롤 제거 */}
      <div
        style={{
          flex: "0 1 auto",
          overflowY: "auto",
        }}
      >
        <StudyNavigation activeTab={activeTab} />
      </div>
    </div>
  );
});

StudySidebarContainer.displayName = "StudySidebarContainer";

StudySidebarContainer.propTypes = {
  activeTab: PropTypes.string,
  subPage: PropTypes.string,
};

StudySidebarContainer.defaultProps = {
  activeTab: "",
  subPage: "",
};

export default StudySidebarContainer;
