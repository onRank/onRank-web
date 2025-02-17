import PropTypes from 'prop-types';

function BackButton({ onClick, className = '' }) {
  return (
    <button 
      onClick={onClick}
      className={`text-blue-600 hover:text-blue-800 ${className}`}
    >
      ← 목록으로 돌아가기
    </button>
  );
}

BackButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default BackButton; 