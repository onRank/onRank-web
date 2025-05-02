import React from "react";

function MyRank({ rank, name, point }) {
  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #ccc",
      borderRadius: "8px",
      overflow: "hidden",
      backgroundColor: "#fff",
      height: "48px",
      width: "100%",
    },
    rankBox: {
      backgroundColor: "#f4c28c",
      color: "#000",
      fontWeight: "bold",
      width: "48px",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRight: "1px solid #ccc",
    },
    nameBox: {
      flex: 1,
      paddingLeft: "16px",
      fontSize: "14px",
      fontWeight: 500,
    },
    pointBox: {
      paddingRight: "16px",
      fontSize: "14px",
      fontWeight: "bold",
      color: "#f4a623",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.rankBox}>{rank}</div>
      <div style={styles.nameBox}>{name}</div>
      <div style={styles.pointBox}>{point.toLocaleString()} pt</div>
    </div>
  );
}

export default MyRank;
