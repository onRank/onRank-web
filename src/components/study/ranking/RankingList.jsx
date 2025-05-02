import React from "react";

function RankingList({ rankingList }) {
  const styles = {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #ccc",
      borderRadius: "8px",
      overflow: "hidden",
      fontFamily: "sans-serif",
    },
    thead: {
      backgroundColor: "#f9f9f9",
      fontWeight: "bold",
      fontSize: "14px",
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
  );
}

export default RankingList;
