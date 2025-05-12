import React, { useState } from "react";

function Button({ onClick, variant = "default", label, isActive, ...props }) {
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
    addFiles: "파일 첨부",
    delete: "삭제",
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
      minWidth: "84px",
    },
    reSubmit: {
      backgroundColor: "#fff",
      color: "#333",
      border: "1px solid #ccc",
      minWidth: "84px",
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

  const isFilterButton = variant === "all" || variant === "progressing";

  let buttonStyle = {
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    outline: "none",
    width: "64px",
    height: "36px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    ...variantStyles[variant],
  };

  if (isFilterButton) {
    buttonStyle = {
      ...buttonStyle,
      transform: isActive
        ? "translate(2px, 3px)"
        : isPressed
        ? "translate(2px, 3px)"
        : "translate(0, 0)",
      boxShadow: isActive
        ? "none"
        : isPressed
        ? "none"
        : "2px 4px 0 rgb(0, 0, 0)",
    };
  } else {
    buttonStyle = {
      ...buttonStyle,
      transform: isPressed ? "translate(2px, 3px)" : "translate(0, 0)",
      boxShadow: isPressed ? "none" : "2px 4px 0 rgb(0, 0, 0)",
    };
  }

  buttonStyle = {
    ...buttonStyle,
    ...(props.style || {}),
  };

  const handleMouseDown = () => {
    if (isFilterButton && isActive) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (isFilterButton && isActive) return;
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    if (isFilterButton && isActive) return;
    setIsPressed(false);
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const { style, ...restProps } = props;

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={buttonStyle}
      {...restProps}>
      {label || defaultLabels[variant] || "확인"}
    </button>
  );
}

export default Button;
