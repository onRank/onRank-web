import { FaBookReader } from "react-icons/fa";

function MyPageCard({ icon, name, studyStatus, onClick }) {
  const styles = {
    card: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      borderRadius: 8,
      background: "none",
      padding: "0 4px",
      fontWeight: 500,
      minWidth: 180,
      minHeight: 52,
      cursor: "pointer", // 클릭 가능하게
      transition: "background 0.15s",
    },
    iconBox: {
      width: 40,
      height: 40,
      border: "1.0px solid #222",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff",
      overflow: "hidden",
    },
    icon: {
      fontSize: 23,
      color: "#222",
      display: "block",
    },
    image: {
      width: 32,
      height: 32,
      objectFit: "cover",
      borderRadius: 8,
      display: "block",
    },
    badge: {
      fontSize: 13,
      fontWeight: 700,
      borderRadius: 6,
      padding: "3px 12px",
      marginRight: 8,
      display: "inline-block",
      color: studyStatus === "PROGRESS" ? "#fff" : "#fff",
      backgroundColor: studyStatus === "PROGRESS" ? "#ee0418" : "#222",
      border: studyStatus === "PROGRESS" ? "none" : "none",
    },
    name: {
      fontSize: 16,
      fontWeight: 400,
      color: "#222",
    },
  };

  // 상태 텍스트
  const statusLabel = studyStatus === "PROGRESS" ? "진행중" : "완료";

  return (
    <div style={styles.card} onClick={onClick}>
      <span style={styles.iconBox}>
        <span style={styles.icon}>
          <FaBookReader
            style={{
              display: "block",
              alignContent: "center",
              justifyContent: "center",
            }}
          />
        </span>
      </span>
      <span style={styles.badge}>{statusLabel}</span>
      <span style={styles.name}>{name}</span>
    </div>
  );
}

export default MyPageCard;
