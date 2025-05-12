import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ActionPopup.css';

/**
 * ActionPopup component - A reusable popup menu for edit and delete actions
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the popup
 * @param {Function} props.onClose - Function to call when popup should close
 * @param {Function} props.onEdit - Function to call when edit is clicked
 * @param {Function} props.onDelete - Function to call when delete is clicked
 * @param {string} props.editText - Text to display for edit option (default: "수정")
 * @param {string} props.deleteText - Text to display for delete option (default: "삭제")
 * @param {string} props.position - Position of the popup (default: "bottom-right")
 * @returns {JSX.Element}
 */
const ActionPopup = ({ 
  show,
  onClose,
  onEdit,
  onDelete,
  editText = "수정",
  deleteText = "삭제",
  position = "bottom-right"
}) => {
  const popupRef = useRef(null);
  const [isVisible, setIsVisible] = useState(show);

  // Handle show prop changes
  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Handle edit click
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
    onClose();
  };

  // Handle delete click
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`action-popup ${position}`} ref={popupRef}>
      <div className="action-popup-content">
        <button className="action-popup-close" onClick={onClose}>×</button>
        <button className="action-popup-button edit-button" onClick={handleEdit}>
          <span className="action-popup-icon edit-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.3 1.70001C11.91 1.31001 11.28 1.31001 10.89 1.70001L2.78002 9.81001C2.69002 9.90001 2.62002 10.02 2.58002 10.15L1.04002 14.77C0.980023 14.95 1.03002 15.15 1.17002 15.28C1.31002 15.42 1.50002 15.47 1.69002 15.41L6.31002 13.87C6.44002 13.83 6.55002 13.76 6.64002 13.67L14.75 5.56001C15.14 5.17001 15.14 4.54001 14.75 4.15001L12.3 1.70001ZM5.85002 12.88L2.75002 14C2.75002 14 2.75002 14 2.74002 14L4.22002 9.90001L10.59 3.54001L12.91 5.86001L5.85002 12.88Z" fill="black"/>
            </svg>
          </span>
          <span className="action-popup-text">{editText}</span>
        </button>
        <div className="action-popup-divider"></div>
        <button className="action-popup-button delete-button" onClick={handleDelete}>
          <span className="action-popup-icon delete-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 3H10.5V2.5C10.5 1.67 9.83 1 9 1H7C6.17 1 5.5 1.67 5.5 2.5V3H2.5C2.22 3 2 3.22 2 3.5C2 3.78 2.22 4 2.5 4H3V12.5C3 13.33 3.67 14 4.5 14H11.5C12.33 14 13 13.33 13 12.5V4H13.5C13.78 4 14 3.78 14 3.5C14 3.22 13.78 3 13.5 3ZM6.5 2.5C6.5 2.22 6.72 2 7 2H9C9.28 2 9.5 2.22 9.5 2.5V3H6.5V2.5ZM12 12.5C12 12.78 11.78 13 11.5 13H4.5C4.22 13 4 12.78 4 12.5V4H12V12.5Z" fill="black"/>
              <path d="M5.5 11.5C5.78 11.5 6 11.28 6 11V6C6 5.72 5.78 5.5 5.5 5.5C5.22 5.5 5 5.72 5 6V11C5 11.28 5.22 11.5 5.5 11.5Z" fill="black"/>
              <path d="M8 11.5C8.28 11.5 8.5 11.28 8.5 11V6C8.5 5.72 8.28 5.5 8 5.5C7.72 5.5 7.5 5.72 7.5 6V11C7.5 11.28 7.72 11.5 8 11.5Z" fill="black"/>
              <path d="M10.5 11.5C10.78 11.5 11 11.28 11 11V6C11 5.72 10.78 5.5 10.5 5.5C10.22 5.5 10 5.72 10 6V11C10 11.28 10.22 11.5 10.5 11.5Z" fill="black"/>
            </svg>
          </span>
          <span className="action-popup-text">{deleteText}</span>
        </button>
      </div>
    </div>
  );
};

ActionPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  editText: PropTypes.string,
  deleteText: PropTypes.string,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
};

export default ActionPopup; 