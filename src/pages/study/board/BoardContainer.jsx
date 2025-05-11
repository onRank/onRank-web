import React from 'react';
import PropTypes from 'prop-types';

function BoardContainer({ onSubPageChange }) {
  // 현재는 개발 중임을 알리는 간단한 메시지만 표시
  return (
    <>
      <h1 className="page-title">게시판</h1>
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px' 
      }}>
        게시판 기능 개발 중입니다.
      </div>
    </>
  );
}

BoardContainer.propTypes = {
  onSubPageChange: PropTypes.func.isRequired
};

export default BoardContainer; 