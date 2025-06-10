import React from "react";

function RankingList({ rankingList }) {
  const styles = {
    container: {
      maxHeight: "400px",
      overflow: "auto",
      borderRadius: "8px",
      border: "1px solid #ccc",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: "sans-serif",
    },
    thead: {
      backgroundColor: "#f9f9f9",
      fontWeight: "bold",
      fontSize: "14px",
      position: "sticky",
      top: 0,
      zIndex: 1,
    },
    th: {
      padding: "12px 16px",
      textAlign: "left",
      borderBottom: "1px solid #e5e5e5",
    },
    td: {
      padding: "12px 16px",
      textAlign: "left",
      borderBottom: "1px solid #e5e5e5",
      fontSize: "14px",
    },
    tdRightBold: {
      fontWeight: "bold",
      color: "#f4a623",
      textAlign: "right",
    },
    lastRow: {
      borderBottom: "none",
    },
  };

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th style={styles.th}>랭킹</th>
            <th style={styles.th}>참여자</th>
            <th style={{ ...styles.th, textAlign: "right" }}>포인트</th>
          </tr>
        </thead>
        <tbody>
          {rankingList.map((item, index) => (
            <tr key={index}>
              <td style={styles.td}>{item.rank}</td>
              <td style={styles.td}>{item.name}</td>
              <td style={{ ...styles.td, ...styles.tdRightBold }}>
                {item.point.toLocaleString()} pt
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RankingList;
