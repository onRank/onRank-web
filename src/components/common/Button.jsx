import React from "react";

function Button({ onClick, variant = "default", label, ...props }) {
  const defaultLabels = {
    create: "작성",
    back: "닫기",
    store: "저장",
    upload: "업로드",
    delete: "삭제",
    addFiles: "파일 첨부",
    default: "확인",
  };

  const variantStyles = {
    create: {
      backgroundColor: "#e74c3c",
      color: "#fff",
    },
    back: {
      backgroundColor: "#f2f2f2",
      color: "#333",
    },
    edit: {
      backgroundColor: "#f2f2f2",
      color: "#333",
    },
    upload: {
      backgroundColor: "#e74c3c",
      color: "#fff",
    },
    delete: {
      backgroundColor: "#e74c3c",
      color: "#fff",
    },
    addFiles: {
      backgroundColor: "#e74c3c",
      color: "#fff",
    },
    default: {
      backgroundColor: "#f2f2f2",
      color: "#333",
    },
  };

  const buttonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    ...variantStyles[variant],
  };

  return (
    <button onClick={onClick} style={buttonStyle} {...props}>
      {label || defaultLabels[variant] || "확인"}
    </button>
  );
}

export default Button;
