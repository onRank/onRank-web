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
        <button className="action-popup-button edit-button" onClick={handleEdit}>
          <span className="action-popup-icon edit-icon">✎</span>
          <span className="action-popup-text">{editText}</span>
        </button>
        <div className="action-popup-divider"></div>
        <button className="action-popup-button delete-button" onClick={handleDelete}>
          <span className="action-popup-icon delete-icon">🗑</span>
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