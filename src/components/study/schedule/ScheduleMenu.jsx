import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const ScheduleMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
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
    // Simple confirmation dialog instead of custom popup
    if (window.confirm('정말 삭제하시겠습니까?')) {
      if (onDelete) {
        onDelete();
      }
    }
    setIsOpen(false);
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

  // Updated styles for better positioning and appearance
  const menuIconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '4px',
    background: 'transparent',
    cursor: 'pointer',
    border: 'none',
    marginLeft: '8px'
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    right: 0,
    top: '100%',
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    borderRadius: '4px',
    padding: '8px 0',
    zIndex: 1000,
    minWidth: '150px',
    overflow: 'visible'
  };

  return (
    <div className="menu-dropdown" ref={menuRef} style={{ 
      position: 'relative', 
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%'
    }}>
      <button className="menu-icon" onClick={toggleMenu} style={menuIconStyle}>
        <BsThreeDotsVertical size={24} color="#333" />
      </button>
      
      {isOpen && (
        <div className="dropdown-menu" style={dropdownMenuStyle}>
          <div className="popup-option" onClick={handleEdit} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '8px 16px',
            cursor: 'pointer',
            hover: { backgroundColor: '#f5f5f5' }
          }}>
            <span className="option-icon" style={{ marginRight: '8px' }}>
              <FiEdit size={18} />
            </span>
            수정
          </div>
          <div className="popup-divider" style={{ 
            height: '1px', 
            backgroundColor: '#e0e0e0', 
            margin: '4px 0' 
          }} />
          <div className="popup-option" onClick={handleDeleteClick} style={{
            display: 'flex', 
            alignItems: 'center', 
            padding: '8px 16px',
            cursor: 'pointer',
            hover: { backgroundColor: '#f5f5f5' }
          }}>
            <span className="option-icon" style={{ marginRight: '8px' }}>
              <FiTrash2 size={18} />
            </span>
            삭제
          </div>
        </div>
      )}
    </div>
  );
};

ScheduleMenu.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ScheduleMenu; 