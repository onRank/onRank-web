import React, { useState } from "react";
import ReactDOM from "react-dom";
import { RiErrorWarningLine } from "react-icons/ri";
import PropTypes from "prop-types";

function PointContainer({ title, icon, point, details, showWarningIcon }) {
  const [isHovered, setIsHovered] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const containerRef = React.useRef(null);

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
      cursor: "default",
      ...(isHovered && {
        backgroundColor: "#f5f5f5",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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
      fontSize: "20px",
    },
    warningIcon: {
      position: "absolute",
      top: 12,
      right: 14,
      fontSize: 20,
      color: "#222",
      cursor: "pointer",
      zIndex: 2,
    },
    pointText: {
      fontSize: "14px",
      color: "#f4a623",
      fontWeight: "bold",
    },
    popup: {
      position: "fixed",
      top: popupPos.top,
      left: popupPos.left,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "12px",
      borderRadius: "8px",
      fontSize: "14px",
      zIndex: 99999,
      minWidth: "200px",
      marginTop: "8px",
      pointerEvents: "none",
    },
    detailItem: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "4px",
      "&:last-child": {
        marginBottom: 0,
      },
    },
    detailLabel: {
      color: "#666",
    },
    detailValue: {
      color: "#f4a623",
      fontWeight: "bold",
    },
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2 - 100,
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      style={styles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {showWarningIcon && (
        <div style={styles.warningIcon}>
          <RiErrorWarningLine />
        </div>
      )}
      <div style={styles.topRow}>
        <div style={styles.iconCircle}>{icon}</div>
        <div style={styles.title}>{title}</div>
      </div>
      <div style={styles.pointText}>총 {point.toLocaleString()} pt</div>
      {details &&
        isHovered &&
        ReactDOM.createPortal(
          <div style={styles.popup}>
            {Object.entries(details).map(([key, value]) => (
              <div key={key} style={styles.detailItem}>
                <span style={styles.detailLabel}>{key}</span>
                <span style={styles.detailValue}>
                  {value.toLocaleString()} pt
                </span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

PointContainer.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  point: PropTypes.number.isRequired,
  details: PropTypes.object,
  showWarningIcon: PropTypes.bool,
};

export default PointContainer;
