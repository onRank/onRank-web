import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit, FiTrash2, FiX } from 'react-icons/fi';

const ScheduleMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      setIsOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmPopup(true);
    setIsOpen(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowConfirmPopup(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmPopup(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="menu-dropdown" ref={menuRef}>
        <button className="menu-icon" onClick={toggleMenu}>
          <BsThreeDotsVertical size={18} />
        </button>
        
        {isOpen && (
          <div className="dropdown-menu">
            <div className="popup-option" onClick={handleEdit}>
              <span className="option-icon">
                <FiEdit size={18} />
              </span>
              수정
            </div>
            <div className="popup-divider" />
            <div className="popup-option" onClick={handleDeleteClick}>
              <span className="option-icon">
                <FiTrash2 size={18} />
              </span>
              삭제
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Popup */}
      {showConfirmPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <div className="popup-header">
              <h3 className="popup-title">수정 및 삭제</h3>
              <button className="close-button" onClick={handleCancelDelete}>
                <FiX />
              </button>
            </div>
            <div className="popup-option" onClick={handleEdit}>
              <span className="option-icon">
                <FiEdit size={18} />
              </span>
              수정
            </div>
            <div className="popup-divider" />
            <div className="popup-option" onClick={handleConfirmDelete}>
              <span className="option-icon">
                <FiTrash2 size={18} />
              </span>
              삭제
            </div>
          </div>
        </div>
      )}
    </>
  );
};

ScheduleMenu.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ScheduleMenu; 