import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const ScheduleMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [isBottomPosition, setIsBottomPosition] = useState(false);
  const [isRightPosition, setIsRightPosition] = useState(false);

  const toggleMenu = () => {
    // Check position before opening menu
    if (!isOpen) {
      checkPosition();
    }
    setIsOpen(!isOpen);
  };

  // Check if the menu is near the bottom or right edge of the page
  const checkPosition = () => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // If less than 150px from bottom of viewport, position menu above
      setIsBottomPosition(viewportHeight - rect.bottom < 150);
      
      // If less than 160px from right edge of viewport, position menu to the left
      setIsRightPosition(viewportWidth - rect.right < 160);
      
      console.log('Menu position check:', {
        bottom: viewportHeight - rect.bottom,
        right: viewportWidth - rect.right,
        isBottomPosition: viewportHeight - rect.bottom < 150,
        isRightPosition: viewportWidth - rect.right < 160
      });
    }
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

  // Check position on window resize
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('resize', checkPosition);
      return () => {
        window.removeEventListener('resize', checkPosition);
      };
    }
  }, [isOpen]);

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
    margin: '0',
    height: '100%'
  };

  // Determine the position of the dropdown menu
  const getDropdownPosition = () => {
    if (isBottomPosition && isRightPosition) {
      return { bottom: '100%', right: 'auto', left: '0' };
    } else if (isBottomPosition) {
      return { bottom: '100%', right: '0' };
    } else if (isRightPosition) {
      return { top: '100%', right: 'auto', left: '0' };
    } else {
      return { top: '100%', right: '0' };
    }
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    ...getDropdownPosition(),
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    borderRadius: '4px',
    padding: '8px 0',
    zIndex: 1000,
    minWidth: '150px',
    maxHeight: 'none',
    overflowY: 'visible'
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
        <BsThreeDotsVertical size={28} color="#333" />
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