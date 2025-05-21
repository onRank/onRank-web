import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { FiMoreVertical } from "react-icons/fi";
import ActionPopup from "../../common/ActionPopup";

const ScheduleMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    // Simple confirmation dialog
    if (window.confirm("정말 삭제하시겠습니까?")) {
      if (onDelete) {
        onDelete();
      }
    }
  };

  const handleCloseMenu = () => {
    setIsOpen(false);
  };

  // Updated styles for better positioning and appearance
  const menuIconStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    background: "transparent",
    cursor: "pointer",
    border: "none",
    margin: "0",
    height: "100%",
  };

  return (
    <div
      className="menu-dropdown"
      ref={menuRef}
      style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}>
      <button className="menu-icon" onClick={toggleMenu} style={menuIconStyle}>
        <FiMoreVertical size={18} color="#333" />
      </button>

      <ActionPopup
        show={isOpen}
        onClose={handleCloseMenu}
        onEdit={handleEdit}
        onDelete={handleDelete}
        position="bottom-right"
      />
    </div>
  );
};

ScheduleMenu.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ScheduleMenu;
