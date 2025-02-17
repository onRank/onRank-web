import PropTypes from 'prop-types';

function SideBar({ activeSection, onSectionChange }) {
  return (
    <div className="w-64 bg-gray-100 p-4">
      <nav>
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full text-left p-2 rounded ${
                activeSection === 'study-detail' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => onSectionChange('study-detail')}
            >
              스터디 정보
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left p-2 rounded ${
                activeSection === 'notice' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => onSectionChange('notice')}
            >
              공지사항
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left p-2 rounded ${
                activeSection === 'schedule' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => onSectionChange('schedule')}
            >
              일정
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

SideBar.propTypes = {
  activeSection: PropTypes.oneOf(['study-detail', 'notice', 'schedule']).isRequired,
  onSectionChange: PropTypes.func.isRequired,
};

export default SideBar;