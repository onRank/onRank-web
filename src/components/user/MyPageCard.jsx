import { FaBookReader } from "react-icons/fa";

function MyPageCard({ icon, name }) {
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
    name: {
      fontSize: 16,
      fontWeight: 400,
      color: "#222",
    },
  };

  return (
    <div style={styles.card}>
      <span style={styles.iconBox}>
        {icon ? (
          <img src={icon} alt={name} style={styles.image} />
        ) : (
          <span style={styles.icon}>
            <FaBookReader
              style={{
                display: "block",
                alignContent: "center",
                justifyContent: "center",
              }}
            />
          </span>
        )}
      </span>
      <span style={styles.name}>{name}</span>
    </div>
  );
}

export default MyPageCard;
