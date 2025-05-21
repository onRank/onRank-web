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
    study: "스터디",
    member: "회원",
    memberAdd: "+회원 추가",
    studyDelete: "스터디 삭제",
    done: "종료",
    default: "확인",
  };

  const variantStyles = {
    create: {
      backgroundColor: "#ee0418",
      color: "#fff",
    },
    back: {
      backgroundColor: "#fff",
      color: "#333",
    },
    store: {
      backgroundColor: "#ee0418",
      color: "#fff",
    },
    upload: {
      backgroundColor: "#ee0418",
      color: "#fff",
    },
    add: {
      backgroundColor: "#ee0418",
      color: "#fff",
    },
    edit: {
      backgroundColor: "#fff",
      color: "#333",
    },
    logout: {
      backgroundColor: "#fff",
      color: "#333",
      borderRadius: "20px",
      width: "75px",
    },
    complete: {
      backgroundColor: "#ee0418",
      color: "#fff",
    },
    submit: {
      backgroundColor: "#ee0418",
      color: "#fff",
      width: "64px",
    },
    reSubmit: {
      backgroundColor: "#fff",
      color: "#333",
      width: "85px",
    },
    addFiles: {
      backgroundColor: "#ee0418",
      color: "#fff",
      width: "76px",
    },
    delete: {
      backgroundColor: "#ee0418",
      color: "#fff",
    },
    all: {
      backgroundColor: "#fff",
      color: "#333",
    },
    progressing: {
      backgroundColor: "#fff",
      color: "#333",
    },
    study: {
      backgroundColor: "#fff",
      color: "#333",
    },
    member: {
      backgroundColor: "#fff",
      color: "#333",
    },
    memberAdd: {
      backgroundColor: "#ee0418",
      color: "#fff",
      minWidth: "84px",
    },
    studyDelete: {
      backgroundColor: "#ee0418",
      color: "#fff",
      width: " 100px",
    },
    done: {
      backgroundColor: "#fff",
      color: "#333",
    },
    default: {
      backgroundColor: "#f2f2f2",
      color: "#333",
    },
  };

  const isFilterButton =
    variant === "all" || variant === "progressing" || variant === "done";

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
    border: "1px solid #000",
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
