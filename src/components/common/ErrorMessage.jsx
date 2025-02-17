import PropTypes from 'prop-types';

function ErrorMessage({ message, type = 'error', className = '' }) {
  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-yellow-100';
  const textColor = type === 'error' ? 'text-red-700' : 'text-yellow-700';

  return (
    <div className={`p-4 ${bgColor} ${textColor} rounded-lg ${className}`}>
      {message}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'warning']),
  className: PropTypes.string,
};

export default ErrorMessage; 