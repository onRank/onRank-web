import React, { useEffect, useState } from "react";
import { GiLaurelsTrophy } from "react-icons/gi";
import { IoMedalOutline } from "react-icons/io5";

function Ranking({ rankingData }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      gap: "16px",
      minHeight: "330px",
    },
    card1: {
      backgroundColor: "#EE0418",
      borderRadius: "12px",
      padding: "16px",
      minWidth: "120px",
      minHeight: "90%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
    },
    card2: {
      backgroundColor: "#EE0418",
      borderRadius: "12px",
      padding: "16px",
      minWidth: "100px",
      minHeight: "70%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
    },
    card3: {
      backgroundColor: "#EE0418",
      borderRadius: "12px",
      padding: "16px",
      minWidth: "90px",
      minHeight: "40%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#fff",
      height: animate ? "0%" : "100%",
      transition: "height 0.6s ease-in-out",
    },
    icon: {
      fontSize: "28px",
      marginBottom: "8px",
    },
    name: {
      fontWeight: "bold",
      fontSize: "16px",
      marginBottom: "4px",
      textShadow: "0 4px 7px rgba(0, 0, 0, 0.5)",
    },
    point: {
      fontSize: "14px",
      fontWeight: "bold",
      textShadow: "0 4px 7px rgba(0, 0, 0, 0.5)",
    },
  };

  const renderIcon = (rank) => {
    if (rank === 1) return <GiLaurelsTrophy size={120} />;
    if (rank === 2) return <IoMedalOutline size={90} />;
    if (rank === 3) return <IoMedalOutline size={90} />;
    return "🎖️";
  };

  const getCardStyle = (rank) => {
    if (rank === 1) return styles.card1;
    if (rank === 2) return styles.card2;
    if (rank === 3) return styles.card3;
    return styles.card3;
  };

  const getAnimationDelay = (rank) => {
    if (rank === 3) return "0s";
    if (rank === 2) return "0.3s";
    if (rank === 1) return "0.6s";
    return "0s";
  };

  return (
    <div style={styles.container}>
      {(rankingData || []).map((person, index) =>
        person ? (
          <div key={index} style={getCardStyle(person.rank)}>
            <div style={styles.icon}>{renderIcon(person.rank)}</div>
            <div style={styles.name}>{person.name}</div>
            <div style={styles.point}>
              {(person.point || 0).toLocaleString()} pt
            </div>
            <div
              style={{
                ...styles.overlay,
                transitionDelay: getAnimationDelay(person.rank),
              }}
            />
          </div>
        ) : null
      )}
    </div>
  );
}

export default Ranking;
