import React from "react";

function PointContainer({ title, icon, point }) {
  const styles = {
    container: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
      padding: "16px 20px",
      minWidth: "180px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    topRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
    },
    iconCircle: {
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      backgroundColor: title === "과제" ? "#fbe26a" : "#a5e4c2",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "16px",
    },
    title: {
      fontWeight: "bold",
      fontSize: "16px",
    },
    pointText: {
      fontSize: "14px",
      color: "#f4a623",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <div style={styles.iconCircle}>{icon}</div>
        <div style={styles.title}>{title}</div>
      </div>
      <div style={styles.pointText}>총 {point.toLocaleString()} pt</div>
    </div>
  );
}

export default PointContainer;
