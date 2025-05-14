import React, { useState } from "react";
import { useParams } from "react-router-dom";
import StudyManagement from "../../../components/study/management/StudyManagement";
import MemberManagement from "../../../components/study/management/MemberManagement";
import Button from "../../../components/common/Button";

function ManagementContainer() {
  const { studyId } = useParams();
  const [activeTab, setActiveTab] = useState("study"); // 'study', 'member'

  return (
    <>
      <div
        style={{
          maxWidth: "800px",
          fontSize: "24px",
          fontWeight: "700",
          margin: "1rem",
          padding: "0 1rem",
        }}>
        관리
      </div>

      {/* 관리 탭 메뉴 */}
      <div
        style={{
          maxWidth: "800px",
          display: "flex",
          justifyContent: "flex-start",
          margin: "2rem",
          padding: "0",
        }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            onClick={() => setActiveTab("study")}
            variant="study"
            isActive={activeTab === "study"}
          />
          <Button
            onClick={() => setActiveTab("member")}
            variant="member"
            isActive={activeTab === "member"}
          />
        </div>
      </div>

      {/* 현재 선택된 탭에 따라 컴포넌트 렌더링 */}
      <div>
        {activeTab === "study" && <StudyManagement />}
        {activeTab === "member" && <MemberManagement />}
      </div>
    </>
  );
}

export default ManagementContainer;
