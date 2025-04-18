import React, { useState } from "react";

function Button({ onClick, variant = "default", label, ...props }) {
  const [isPressed, setIsPressed] = useState(false);

  const defaultLabels = {
    create: "작성",
    back: "닫기",
    store: "저장",
    upload: "업로드",
    delete: "삭제",
    edit: "수정",
    addFiles: "파일 첨부",
    default: "확인",
  };

  const variantStyles = {
    create: {
      backgroundColor: "#ee0418",
      color: "#fff",
      border: "none",
    },
    back: {
      backgroundColor: "#fff",
      color: "#333",
      border: "1px solid #ccc",
    },
    edit: {
      backgroundColor: "#f2f2f2",
      color: "#333",
      border: "1px solid #ccc",
    },
    upload: {
      backgroundColor: "#ee0418",
      color: "#fff",
      border: "none",
    },
    delete: {
      backgroundColor: "#e74c3c",
      color: "#fff",
      border: "none",
    },
    addFiles: {
      backgroundColor: "#ee0418",
      color: "#fff",
      border: "none",
    },
    default: {
      backgroundColor: "#f2f2f2",
      color: "#333",
      border: "1px solid #ccc",
    },
  };

  const buttonStyle = {
    borderRadius: "10px",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none",
    width: "58px",
    height: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transform: isPressed ? "translate(2px, 3px)" : "translate(0, 0)",
    boxShadow: isPressed ? "none" : "2px 4px 0 rgb(0, 0, 0)",
    transition: "all 0.1s ease-in-out",
    ...variantStyles[variant],
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPressed(false)}
      style={buttonStyle}
      {...props}
    >
      {label || defaultLabels[variant] || "확인"}
    </button>
  );
}

export default Button;
