import React, { useState } from "react";

function Button({ onClick, variant = "default", label, ...props }) {
  const [isPressed, setIsPressed] = useState(false);

  const defaultLabels = {
    create: "+생성",
    back: "닫기",
    store: "저장",
    upload: "업로드",
    add: "+추가",
    edit: "수정",
    logout: "logout",
    complete: "완료",
    submit: "제출",
    reSubmit: "다시 제출",
    all: "전체",
    progressing: "진행중",
    addFiles: "파일 첨부", // 삭제 필요
    delete: "삭제", // 삭제 필요
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
    store: {
      backgroundColor: "#ee0418",
      color: "#fff",
      border: "none",
    },
    upload: {
      backgroundColor: "#ee0418",
      color: "#fff",
      border: "none",
    },
    add: {
      backgroundColor: "#ee0418",
      color: "#fff",
      border: "none",
    },
    edit: {
      backgroundColor: "#fff",
      color: "#333",
      border: "1px solid #ccc",
    },
    logout: {
      backgroundColor: "#fff",
      color: "#333",
      border: "1px solid #ccc",
      borderRadius: "20px",
      width: "75px",
    },
    complete: {
      backgroundColor: "#ee0418",
      color: "#fff",
      border: "none",
    },
    submit: {
      backgroundColor: "#ee0418",
      color: "#fff",
      border: "none",
    },
    reSubmit: {
      backgroundColor: "#fff",
      color: "#333",
      border: "none",
      width: "76px",
    },
    addFiles: {
      backgroundColor: "#ee0418",
      color: "#fff",
      border: "none",
      width: "76px",
    },
    delete: {
      backgroundColor: "#e74c3c",
      color: "#fff",
      border: "none",
    },
    all: {
      backgroundColor: "#fff",
      color: "#333",
      border: "1px solid #ccc",
    },
    progressing: {
      backgroundColor: "#fff",
      color: "#333",
      border: "1px solid #ccc",
    },
    default: {
      backgroundColor: "#f2f2f2",
      color: "#333",
      border: "1px solid #ccc",
    },
  };

  const buttonStyle = {
    borderRadius: "10px",
    fontSize: "14px",
    cursor: "pointer",
    outline: "none",
    width: "62px",
    height: "33px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transform: isPressed ? "translate(2px, 3px)" : "translate(0, 0)",
    boxShadow: isPressed ? "none" : "2px 4px 0 rgb(0, 0, 0)",
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
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
