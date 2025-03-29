import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";

function StudySidebar({ activeTab }) {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const menuItems = [
    { id: "notices", label: "공지사항", path: "notices" },
    { id: "schedules", label: "일정", path: "schedules" },
    { id: "assignment", label: "과제", path: "assignment" },
    { id: "board", label: "게시판", path: "board" },
    { id: "attendance", label: "출석", path: "attendance" },
    { id: "manage", label: "관리", path: "management" },
    { id: "ranking", label: "랭킹", path: "ranking" },
  ];

  const handleTabClick = (path, label) => {
    navigate(`/studies/${studyId}/${path}`);
  };

  return (
    <div
      style={{
        width: "200px",
        borderRight: "1px solid #E5E5E5",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "fit-content",
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleTabClick(item.path, item.label)}
          style={{
            width: "100%",
            padding: "1rem",
            textAlign: "left",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: activeTab === item.label ? "#FF0000" : "#000000",
            fontWeight: activeTab === item.label ? "bold" : "normal",
            fontSize: "14px",
            outline: "none",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F8F9FA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

StudySidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
};

export default StudySidebar;
