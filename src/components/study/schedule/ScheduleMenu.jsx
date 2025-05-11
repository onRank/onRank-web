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

  // Added inline styles for better visibility
  const menuIconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '4px',
    background: '#f5f5f5',
    cursor: 'pointer',
    border: '1px solid #e0e0e0',
    marginLeft: '8px'
  };

  return (
    <>
      <div className="menu-dropdown" ref={menuRef} style={{ position: 'relative', zIndex: 10 }}>
        <button className="menu-icon" onClick={toggleMenu} style={menuIconStyle}>
          <BsThreeDotsVertical size={20} color="#333" />
        </button>
        
        {isOpen && (
          <div className="dropdown-menu" style={{ 
            position: 'absolute', 
            right: 0, 
            top: '100%', 
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            borderRadius: '4px',
            padding: '8px 0',
            zIndex: 100,
            minWidth: '150px'
          }}>
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

      {/* Confirm Delete Popup */}
      {showConfirmPopup && (
        <div className="popup-container" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000
        }}>
          <div className="popup-content" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            minWidth: '250px',
            maxWidth: '90%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div className="popup-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 className="popup-title" style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 'bold'
              }}>수정 및 삭제</h3>
              <button className="close-button" onClick={handleCancelDelete} style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '4px'
              }}>
                <FiX />
              </button>
            </div>
            <div className="popup-option" onClick={handleEdit} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 0',
              cursor: 'pointer'
            }}>
              <span className="option-icon" style={{ marginRight: '10px' }}>
                <FiEdit size={18} />
              </span>
              수정
            </div>
            <div className="popup-divider" style={{
              width: '100%',
              height: '1px',
              backgroundColor: '#e0e0e0',
              margin: '10px 0'
            }} />
            <div className="popup-option" onClick={handleConfirmDelete} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 0',
              cursor: 'pointer',
              color: '#e74c3c'
            }}>
              <span className="option-icon" style={{ marginRight: '10px' }}>
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