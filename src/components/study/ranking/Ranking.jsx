import React from "react";

function Ranking({ rankingData }) {
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      gap: "16px",
    },
    card1: {
      backgroundColor: "#d94135",
      borderRadius: "12px",
      padding: "16px",
      minWidth: "120px",
      minHeight: "80%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
    card2: {
      backgroundColor: "#d94135",
      borderRadius: "12px",
      padding: "16px",
      minWidth: "100px",
      minHeight: "57%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
    card3: {
      backgroundColor: "#d94135",
      borderRadius: "12px",
      padding: "16px",
      minWidth: "90px",
      minHeight: "40%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    icon: {
      fontSize: "28px",
      marginBottom: "8px",
    },
    name: {
      fontWeight: "bold",
      fontSize: "16px",
      marginBottom: "4px",
    },
    point: {
      fontSize: "14px",
      fontWeight: "bold",
    },
  };

  const renderIcon = (rank) => {
    if (rank === 1) return "🏆";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🎖️";
  };

  const getCardStyle = (rank) => {
    if (rank === 1) return styles.card1;
    if (rank === 2) return styles.card2;
    if (rank === 3) return styles.card3;
    return styles.card3;
  };

  return (
    <div style={styles.container}>
      {rankingData.map((person, index) => (
        <div key={index} style={getCardStyle(person.rank)}>
          <div style={styles.icon}>{renderIcon(person.rank)}</div>
          <div style={styles.name}>{person.name}</div>
          <div style={styles.point}>{person.point.toLocaleString()} pt</div>
        </div>
      ))}
    </div>
  );
}

export default Ranking;
