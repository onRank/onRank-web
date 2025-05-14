import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './ActionPopup.css';

/**
 * AssignmentActionPopup component - A reusable popup menu for assignment actions (grade, edit, delete)
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the popup
 * @param {Function} props.onClose - Function to call when popup should close
 * @param {Function} props.onGrade - Function to call when grade is clicked
 * @param {Function} props.onEdit - Function to call when edit is clicked
 * @param {Function} props.onDelete - Function to call when delete is clicked
 * @param {string} props.gradeText - Text to display for grade option (default: "채점")
 * @param {string} props.editText - Text to display for edit option (default: "수정")
 * @param {string} props.deleteText - Text to display for delete option (default: "삭제")
 * @param {string} props.position - Position of the popup (default: "bottom-right")
 * @param {boolean} props.skipConfirm - Skip confirmation dialog (default: false)
 * @returns {JSX.Element}
 */
const AssignmentActionPopup = ({ 
  show,
  onClose,
  onGrade,
  onEdit,
  onDelete,
  gradeText = "채점",
  editText = "수정",
  deleteText = "삭제",
  position = "bottom-right",
  skipConfirm = false
}) => {
  const popupRef = useRef(null);
  const triggerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(show);
  const [popupStyle, setPopupStyle] = useState({});

  // Handle show prop changes
  useEffect(() => {
    setIsVisible(show);
    
    // Calculate position when popup becomes visible
    if (show) {
      calculatePosition();
    }
  }, [show]);

  // Calculate popup position based on trigger element
  const calculatePosition = () => {
    if (!triggerRef.current) {
      // Check for global reference first
      if (window._lastAssignmentMenuButton) {
        triggerRef.current = window._lastAssignmentMenuButton;
      } else {
        // Find the menu button that triggered this popup
        const menuButton = document.activeElement;
        if (menuButton) {
          triggerRef.current = menuButton;
        } else {
          // If no trigger element found, position at center
          setPopupStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
          return;
        }
      }
    }

    const buttonRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Popup approximate dimensions
    const popupWidth = 200;
    const popupHeight = 180; // Slightly higher to accommodate the extra button
    
    // Default positioning is bottom-right
    let style = {};
    
    // Check if popup would go below the bottom of the viewport
    if (buttonRect.bottom + popupHeight > viewportHeight) {
      // Position above the button
      style.bottom = viewportHeight - buttonRect.top;
      style.top = 'auto';
    } else {
      // Position below the button
      style.top = buttonRect.bottom;
      style.bottom = 'auto';
    }
    
    // Horizontal positioning
    if (buttonRect.right - popupWidth < 0) {
      // Too far left, align with left of button
      style.left = buttonRect.left;
    } else if (buttonRect.right > viewportWidth) {
      // Too far right, ensure popup stays in viewport
      style.left = viewportWidth - popupWidth - 10;
    } else {
      // Default: align with right of button
      style.left = buttonRect.right - popupWidth;
    }
    
    // Make sure popup stays in viewport
    style.left = Math.max(10, Math.min(viewportWidth - popupWidth - 10, style.left));
    
    // Set fixed position to make popup appear above all other elements
    style.position = 'fixed';
    
    setPopupStyle(style);
  };

  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isVisible, onClose]);

  // 이벤트 핸들러 강화
  const handleButtonClick = (e, callback) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
    onClose();
  };

  // Handle grade click
  const handleGrade = (e) => {
    e.stopPropagation();
    onGrade();
    onClose();
  };

  // Handle edit click
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
    onClose();
  };

  // Handle delete click
  const handleDelete = (e) => {
    e.stopPropagation();
    
    // Skip confirmation if skipConfirm is true
    if (skipConfirm || window.confirm("정말로 삭제하시겠습니까?")) {
      onDelete();
    }
    
    onClose();
  };

  if (!isVisible) return null;

  // 강제로 왼쪽 정렬을 위한 버튼 스타일
  const buttonStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
    outline: 'none',
    padding: '8px 0'
  };
  
  // 아이콘 스타일
  const iconStyle = {
    marginRight: '12px',
    marginTop: '2px',
    display: 'flex',
    alignItems: 'flex-start',
    width: '16px'
  };

  // 텍스트 스타일 추가
  const textStyle = {
    display: 'block',
    textAlign: 'left'
  };

  // 포털을 사용하여 팝업을 body에 직접 렌더링 (z-index 문제 해결을 위해)
  return createPortal(
    <div className={`action-popup ${position}`} 
         ref={popupRef} 
         style={{...popupStyle, zIndex: 2147483647, position: 'fixed'}}
         onClick={(e) => e.stopPropagation()}>
      <div className="action-popup-content">
        <button className="action-popup-close" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClose();
                }}
                style={{outline: 'none'}}>×</button>
                
        {/* 채점 버튼 */}
        <button className="action-popup-button grade-button" 
                onClick={(e) => handleButtonClick(e, onGrade)} 
                style={buttonStyle}>
          <span className="action-popup-icon grade-icon" style={iconStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1H3C1.9 1 1 1.9 1 3V13C1 14.1 1.9 15 3 15H13C14.1 15 15 14.1 15 13V3C15 1.9 14.1 1 13 1ZM14 13C14 13.55 13.55 14 13 14H3C2.45 14 2 13.55 2 13V3C2 2.45 2.45 2 3 2H13C13.55 2 14 2.45 14 3V13Z" fill="black"/>
              <path d="M7 11.5L4.5 9L5.21 8.29L7 10.08L10.79 6.29L11.5 7L7 11.5Z" fill="black"/>
            </svg>
          </span>
          <span className="action-popup-text" style={textStyle}>{gradeText}</span>
        </button>
        
        <div className="action-popup-divider"></div>
        
        {/* 수정 버튼 */}
        <button className="action-popup-button edit-button" 
                onClick={(e) => handleButtonClick(e, onEdit)} 
                style={buttonStyle}>
          <span className="action-popup-icon edit-icon" style={iconStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.3 1.70001C11.91 1.31001 11.28 1.31001 10.89 1.70001L2.78002 9.81001C2.69002 9.90001 2.62002 10.02 2.58002 10.15L1.04002 14.77C0.980023 14.95 1.03002 15.15 1.17002 15.28C1.31002 15.42 1.50002 15.47 1.69002 15.41L6.31002 13.87C6.44002 13.83 6.55002 13.76 6.64002 13.67L14.75 5.56001C15.14 5.17001 15.14 4.54001 14.75 4.15001L12.3 1.70001ZM5.85002 12.88L2.75002 14C2.75002 14 2.75002 14 2.74002 14L4.22002 9.90001L10.59 3.54001L12.91 5.86001L5.85002 12.88Z" fill="black"/>
            </svg>
          </span>
          <span className="action-popup-text" style={textStyle}>{editText}</span>
        </button>
        
        <div className="action-popup-divider"></div>
        
        {/* 삭제 버튼 */}
        <button className="action-popup-button delete-button" 
                onClick={(e) => handleButtonClick(e, onDelete)} 
                style={buttonStyle}>
          <span className="action-popup-icon delete-icon" style={iconStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 3H10.5V2.5C10.5 1.67 9.83 1 9 1H7C6.17 1 5.5 1.67 5.5 2.5V3H2.5C2.22 3 2 3.22 2 3.5C2 3.78 2.22 4 2.5 4H3V12.5C3 13.33 3.67 14 4.5 14H11.5C12.33 14 13 13.33 13 12.5V4H13.5C13.78 4 14 3.78 14 3.5C14 3.22 13.78 3 13.5 3ZM6.5 2.5C6.5 2.22 6.72 2 7 2H9C9.28 2 9.5 2.22 9.5 2.5V3H6.5V2.5ZM12 12.5C12 12.78 11.78 13 11.5 13H4.5C4.22 13 4 12.78 4 12.5V4H12V12.5Z" fill="black"/>
              <path d="M5.5 11.5C5.78 11.5 6 11.28 6 11V6C6 5.72 5.78 5.5 5.5 5.5C5.22 5.5 5 5.72 5 6V11C5 11.28 5.22 11.5 5.5 11.5Z" fill="black"/>
              <path d="M8 11.5C8.28 11.5 8.5 11.28 8.5 11V6C8.5 5.72 8.28 5.5 8 5.5C7.72 5.5 7.5 5.72 7.5 6V11C7.5 11.28 7.72 11.5 8 11.5Z" fill="black"/>
              <path d="M10.5 11.5C10.78 11.5 11 11.28 11 11V6C11 5.72 10.78 5.5 10.5 5.5C10.22 5.5 10 5.72 10 6V11C10 11.28 10.22 11.5 10.5 11.5Z" fill="black"/>
            </svg>
          </span>
          <span className="action-popup-text" style={textStyle}>{deleteText}</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

AssignmentActionPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onGrade: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  gradeText: PropTypes.string,
  editText: PropTypes.string,
  deleteText: PropTypes.string,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  skipConfirm: PropTypes.bool
};

export default AssignmentActionPopup; 