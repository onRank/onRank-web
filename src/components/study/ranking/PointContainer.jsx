import React, { useState } from "react";

function PointContainer({ title, icon, point, details }) {
  const [isHovered, setIsHovered] = useState(false);

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
      position: "relative",
      transition: "all 0.2s ease",
      cursor: "pointer",
      ...(isHovered && {
        backgroundColor: "#f5f5f5",
      }),
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
      fontSize: "22px",
    },
    pointText: {
      fontSize: "15px",
      color: "#f4a623",
      fontWeight: "bold",
      display: "flex",
      justifyContent: "flex-end",
    },
    popup: {
      position: "absolute",
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "12px",
      borderRadius: "8px",
      fontSize: "14px",
      zIndex: 1000,
      minWidth: "200px",
      display: isHovered ? "block" : "none",
      marginTop: "8px",
    },
    detailItem: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "4px",
      "&:last-child": {
        marginBottom: 0,
      },
    },
  };

  return (
    <div
      style={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div style={styles.topRow}>
        <div style={styles.iconCircle}>{icon}</div>
        <div style={styles.title}>{title}</div>
      </div>
      <div style={styles.pointText}>총 {point.toLocaleString()} pt</div>
      {details && (
        <div style={styles.popup}>
          {Object.entries(details).map(([key, value]) => (
            <div key={key} style={styles.detailItem}>
              <span>{key}</span>
              <span>{value.toLocaleString()} pt</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PointContainer;
