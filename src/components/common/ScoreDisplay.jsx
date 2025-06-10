import React from 'react';
import './ScoreDisplay.css';

/**
 * 점수 표시 컴포넌트
 * @param {Object} props
 * @param {number|null} props.score - 현재 점수 (null이면 미채점 상태)
 * @param {number} props.maxPoint - 최대 점수
 * @param {string} [props.className] - 추가 CSS 클래스
 * @param {Object} [props.style] - 추가 인라인 스타일
 * @returns {JSX.Element}
 */
const ScoreDisplay = ({ score, maxPoint, className = '', style = {} }) => {
  // 점수가 있는지 여부에 따라 클래스 결정
  const isScored = score !== null && score !== undefined;
  const displayClass = isScored ? 'scored' : 'not-scored';
  
  return (
    <div 
      className={`score-display-component ${displayClass} ${className}`}
      style={style}
    >
      {isScored ? score : '--'}/{maxPoint} pt
    </div>
  );
};

export default ScoreDisplay; 