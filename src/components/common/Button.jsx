import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ onClick, children, variant = 'default', disabled = false }) => {
  const getButtonStyle = () => {
    const baseStyle = 'px-4 py-2 rounded-lg transition-colors duration-200 font-medium';
    
    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-blue-500 text-white hover:bg-blue-600`;
      case 'secondary':
        return `${baseStyle} bg-gray-500 text-white hover:bg-gray-600`;
      case 'danger':
        return `${baseStyle} bg-red-500 text-white hover:bg-red-600`;
      case 'back':
        return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200`;
      default:
        return `${baseStyle} bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${getButtonStyle()} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'danger', 'back']),
  disabled: PropTypes.bool
};

export default Button; 